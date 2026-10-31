/**
 * YTubeDL Engine — job manager.
 *
 * Orchestrates the full lifecycle: probe → (parallel) segmented downloads →
 * subtitle fetching → ffmpeg processing → file registry. Bounded concurrency,
 * instant cancellation (abort propagates into fetches and ffmpeg kills),
 * weighted progress across stages, a compact event ring per job, and crash-
 * resilient state persistence.
 */
import { rm, rename, copyFile, writeFile, stat, readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { existsSync } from 'node:fs';
import { filesDir, tmpDir, statePath, loadConfig, profileSpec, saveConfig, } from './config.js';
import { analyzeInputs, clearProbeCache, probeUrl } from './providers/index.js';
import { demoThumbPath } from './demo-origin.js';
import { downloadStream } from './download/segment-downloader.js';
import { planAudio, planVideo, runAudioExtract, runMux } from './download/pipelines.js';
import { downloadCaption } from './subtitles.js';
import { dirSize, ensureDir, mimeFor, randomId, sanitizeFilename } from './util.js';
const KIND_WEIGHTS = {
    video: { probe: 0.03, download: 0.62, subs: 0.05, process: 0.3 },
    audio: { probe: 0.03, download: 0.75, subs: 0, process: 0.22 },
    subtitle: { probe: 0.05, download: 0, subs: 0.95, process: 0 },
};
const EVENT_LIMIT = 25;
/* ------------------------------ manager ------------------------------- */
export class JobManager {
    cfg;
    queue = [];
    active = new Set();
    jobs = new Map();
    files = new Map();
    order = []; // newest first
    onUpdate;
    constructor() {
        this.cfg = { concurrency: 2, profile: 'balanced' };
    }
    async init(onUpdate) {
        this.onUpdate = onUpdate;
        this.cfg = await loadConfig();
        // No job can survive a restart — sweep orphaned temp workspaces.
        await rm(tmpDir(), { recursive: true, force: true }).catch(() => { });
        await ensureDir(tmpDir());
        await this.loadState();
    }
    getConfig() {
        return { ...this.cfg };
    }
    async updateConfig(patch) {
        if (patch.concurrency !== undefined) {
            this.cfg.concurrency = Math.min(4, Math.max(1, Math.round(patch.concurrency)));
        }
        if (patch.profile && ['power-saver', 'balanced', 'performance'].includes(patch.profile)) {
            this.cfg.profile = patch.profile;
        }
        await saveConfig(this.cfg);
        clearProbeCache();
        this.pump();
        return this.getConfig();
    }
    stats() {
        let filesBytes = 0;
        for (const f of this.files.values())
            filesBytes += f.sizeBytes;
        return { jobsActive: this.active.size, jobsQueued: this.queue.length, filesBytes };
    }
    /* ------------------------------ enqueue ----------------------------- */
    enqueue(request) {
        const job = {
            id: randomId('j'),
            request,
            status: 'queued',
            stage: 'Queued',
            weightBase: 0,
            currentWeight: 0,
            currentFraction: 0,
            downloadedBytes: 0,
            extraFiles: [],
            events: [],
            timings: {},
            createdAt: Date.now(),
        };
        this.jobs.set(job.id, job);
        this.order.unshift(job.id);
        this.queue.push(job);
        this.pushEvent(job, 'info', `Job queued (${request.kind})`);
        this.pump();
        return this.view(job);
    }
    pump() {
        while (this.active.size < this.cfg.concurrency && this.queue.length > 0) {
            const job = this.queue.shift();
            this.active.add(job);
            if (!job.startedAt)
                job.startedAt = Date.now();
            this.runJob(job)
                .catch(() => { })
                .finally(() => {
                this.active.delete(job);
                this.persist();
                this.pump();
            });
        }
    }
    /* ------------------------------ controls ---------------------------- */
    cancel(id) {
        const job = this.jobs.get(id);
        if (!job)
            return null;
        if (job.status === 'queued') {
            const idx = this.queue.indexOf(job);
            if (idx >= 0)
                this.queue.splice(idx, 1);
            job.status = 'canceled';
            job.stage = 'Canceled';
            job.finishedAt = Date.now();
            this.pushEvent(job, 'warn', 'Job canceled before start');
            this.persist();
        }
        else if (this.isActive(job)) {
            job.ac?.abort(new Error('canceled by user'));
            this.pushEvent(job, 'warn', 'Cancel requested — releasing resources');
        }
        return this.view(job);
    }
    isActive(job) {
        return (job.status === 'probing' || job.status === 'downloading' || job.status === 'processing');
    }
    async remove(id, deleteFiles) {
        const job = this.jobs.get(id);
        if (!job)
            return false;
        if (this.isActive(job))
            this.cancel(id);
        // Wait briefly for the cancellation to settle
        for (let i = 0; i < 40 && this.isActive(this.jobs.get(id)); i++) {
            await new Promise((r) => setTimeout(r, 50));
        }
        if (deleteFiles) {
            for (const f of [job.result, ...job.extraFiles]) {
                if (!f)
                    continue;
                const reg = this.files.get(f.fileId);
                if (reg) {
                    await rm(reg.path, { force: true }).catch(() => { });
                    this.files.delete(f.fileId);
                }
            }
        }
        this.jobs.delete(id);
        this.order = this.order.filter((x) => x !== id);
        this.persist();
        return true;
    }
    getJob(id) {
        const job = this.jobs.get(id);
        return job ? this.view(job) : null;
    }
    listJobs() {
        return this.order.map((id) => this.jobs.get(id)).filter(Boolean).map((j) => this.view(j));
    }
    getFile(fileId) {
        return this.files.get(fileId) ?? null;
    }
    /* ------------------------------ runner ------------------------------ */
    async runJob(job) {
        job.ac = new AbortController();
        const signal = job.ac.signal;
        const t0 = Date.now();
        try {
            /* ---------- stage 1: probe ---------- */
            this.setStage(job, 'probing', 'Resolving media', KIND_WEIGHTS[job.request.kind].probe);
            const probeStart = Date.now();
            const result = await probeUrl(job.request.url, { signal });
            job.timings.probeMs = Date.now() - probeStart;
            job.media = {
                id: result.media.id,
                title: result.media.title,
                thumbnail: result.media.thumbnail,
                durationSec: result.media.durationSec,
                author: result.media.author,
            };
            this.pushEvent(job, 'info', `Resolved: ${result.media.title}${result.media.durationSec ? ` (${result.media.durationSec}s)` : ''}`);
            job.weightBase += KIND_WEIGHTS[job.request.kind].probe;
            job.currentFraction = 0;
            if (result.streams.size === 0) {
                throw new Error(result.media.note ??
                    'No downloadable formats for this media (see the analysis note in the interface)');
            }
            switch (job.request.kind) {
                case 'subtitle':
                    await this.runSubtitleJob(job, result, signal);
                    break;
                case 'audio':
                    await this.runAudioJob(job, result, signal);
                    break;
                case 'video':
                    await this.runVideoJob(job, result, signal);
                    break;
            }
            job.status = 'completed';
            job.stage = 'Completed';
            job.weightBase = 1;
            job.currentWeight = 0;
            job.currentFraction = 1;
            job.timings.totalMs = Date.now() - t0;
            job.finishedAt = Date.now();
            this.pushEvent(job, 'info', `Done in ${(job.timings.totalMs / 1000).toFixed(1)}s${job.timings.directCopy ? ' · zero-transcode path' : ''}`);
        }
        catch (e) {
            const aborted = signal.aborted || (e instanceof Error && /abort|cancel/i.test(e.message));
            job.status = aborted ? 'canceled' : 'failed';
            job.stage = aborted ? 'Canceled' : 'Failed';
            job.error = aborted
                ? 'Canceled by user'
                : e instanceof Error
                    ? e.message
                    : 'Unknown error';
            job.finishedAt = Date.now();
            job.timings.totalMs = Date.now() - t0;
            this.pushEvent(job, aborted ? 'warn' : 'error', job.error);
        }
        finally {
            // Always sweep the job's temp workspace — outputs have already been
            // renamed into the file registry, siblings are never needed again.
            await rm(join(tmpDir(), job.id), { recursive: true, force: true }).catch(() => { });
        }
        this.onUpdate?.(job.id);
    }
    /* --------------------------- stage helpers -------------------------- */
    setStage(job, status, label, weight) {
        job.status = status;
        job.stage = label;
        job.currentWeight = weight;
        job.currentFraction = 0;
        this.onUpdate?.(job.id);
    }
    completeStage(job) {
        job.weightBase += job.currentWeight;
        job.currentWeight = 0;
        job.currentFraction = 0;
    }
    pushEvent(job, level, msg) {
        job.events.push({ t: Date.now(), level, msg });
        if (job.events.length > EVENT_LIMIT)
            job.events.shift();
        this.onUpdate?.(job.id);
    }
    /** Shared speed/progress accumulator for one or more parallel streams. */
    makeProgress(job, totalBytes) {
        let downloaded = 0;
        return {
            onBytes: (delta) => {
                downloaded += delta;
                job.downloadedBytes = downloaded;
                const now = Date.now();
                const last = job.lastSpeedSample;
                if (!last || now - last.t >= 250) {
                    if (last && now > last.t) {
                        const inst = ((downloaded - last.bytes) * 1000) / (now - last.t);
                        job.speedBps = job.speedBps ? job.speedBps * 0.7 + inst * 0.3 : inst;
                    }
                    job.lastSpeedSample = { t: now, bytes: downloaded };
                }
                if (totalBytes) {
                    job.currentFraction = Math.min(1, downloaded / totalBytes);
                    job.etaSec =
                        job.speedBps && job.speedBps > 1 ? (totalBytes - downloaded) / job.speedBps : undefined;
                }
            },
            total: totalBytes,
        };
    }
    /* ------------------------------ video ------------------------------- */
    async runVideoJob(job, result, signal) {
        const req = job.request;
        const subs = req.subtitles;
        const subLangs = (subs?.languages ?? []).filter((l) => result.captions.has(l));
        if (subs && subs.languages.length > 0 && subLangs.length === 0) {
            throw new Error(`None of the requested subtitle tracks exist (available: ${result.media.subtitleTracks.map((t) => t.id).join(', ') || 'none'})`);
        }
        const needSubs = subLangs.length > 0;
        const burn = subs?.mode === 'burn' && needSubs;
        const plan = planVideo(result.media, {
            qualityLabel: req.videoQuality,
            container: req.container,
            preferCodec: req.preferCodec,
            burnSubs: burn,
            needSubs,
        });
        for (const n of plan.notes)
            this.pushEvent(job, 'info', n);
        const vf = plan.video;
        this.pushEvent(job, 'info', `Selected ${vf.label} ${vf.codecFamily}${plan.audio ? ` + ${plan.audio.codec} audio` : ''}${plan.progressive && !needSubs ? ' (progressive stream — no remux needed)' : ` → ${plan.container}`}`);
        const tmp = join(tmpDir(), job.id);
        await ensureDir(tmp);
        /* ---------- stage 2: download ---------- */
        this.setStage(job, 'downloading', 'Downloading streams', KIND_WEIGHTS.video.download);
        const dlStart = Date.now();
        const videoRef = result.streams.get(vf.itag);
        if (!videoRef)
            throw new Error(`Stream itag ${vf.itag} missing from provider result`);
        const audioRef = plan.audio ? result.streams.get(plan.audio.itag) : undefined;
        const spec = profileSpec(this.cfg);
        const totalBytes = (videoRef.sizeBytes ?? 0) + (audioRef?.sizeBytes ?? 0) || undefined;
        const progress = this.makeProgress(job, totalBytes);
        job.totalBytes = totalBytes;
        const videoPath = join(tmp, `video.${vf.container}`);
        const audioPath = audioRef ? join(tmp, `audio.${plan.audio.container}`) : undefined;
        const downloads = [
            downloadStream({
                url: videoRef.url,
                dest: videoPath,
                expectedSize: videoRef.sizeBytes,
                headers: videoRef.headers,
                maxSegments: spec.maxSegments,
                segmentBytes: spec.segmentBytes,
                onBytes: progress.onBytes,
                signal,
                label: `${vf.label} video`,
            }),
        ];
        if (audioRef && audioPath) {
            downloads.push(downloadStream({
                url: audioRef.url,
                dest: audioPath,
                expectedSize: audioRef.sizeBytes,
                headers: audioRef.headers,
                maxSegments: spec.maxSegments,
                segmentBytes: spec.segmentBytes,
                onBytes: progress.onBytes,
                signal,
                label: 'audio',
            }));
        }
        job.stage = downloads.length > 1 ? 'Downloading video + audio' : 'Downloading video';
        await Promise.all(downloads);
        job.timings.downloadMs = Date.now() - dlStart;
        this.pushEvent(job, 'info', `Downloaded ${(job.downloadedBytes / 1048576).toFixed(1)} MB in ${(job.timings.downloadMs / 1000).toFixed(1)}s (${((job.downloadedBytes / 1048576) / (job.timings.downloadMs / 1000)).toFixed(1)} MB/s avg)`);
        this.completeStage(job);
        /* ---------- stage 3: subtitles ---------- */
        let subFiles = [];
        if (needSubs) {
            this.setStage(job, 'processing', 'Fetching subtitles', KIND_WEIGHTS.video.subs);
            subFiles = await this.fetchSubtitles(job, result, subLangs, subs.format, tmp, signal);
            this.completeStage(job);
        }
        /* ---------- stage 4: process ---------- */
        const baseName = sanitizeFilename(result.media.title);
        const ext = plan.progressive && !needSubs
            ? extname(videoPath).slice(1) || 'mp4'
            : plan.container;
        const fileName = `${baseName} [${vf.label}].${ext}`;
        if (plan.progressive && subs?.mode !== 'embed' && !burn) {
            // Zero-ffmpeg fast path: the progressive file IS the output
            const file = await this.registerFile(videoPath, fileName);
            job.result = file;
            job.timings.directCopy = true;
            if (needSubs && subs) {
                // sidecar subtitles alongside
                job.extraFiles = await this.registerSidecars(job, result, subLangs, subs.format, tmp);
            }
            this.pushEvent(job, 'info', 'Progressive stream used directly — ffmpeg skipped entirely');
            return;
        }
        this.setStage(job, 'processing', burn ? 'Burning-in subtitles (re-encode)' : 'Muxing streams', KIND_WEIGHTS.video.process);
        const procStart = Date.now();
        const outPath = join(tmp, `out.${plan.container}`);
        await runMux({
            videoPath: 'video.' + (vf.container),
            audioPath: audioPath ? 'audio.' + plan.audio.container : undefined,
            subtitlePaths: subFiles.map((f) => f.split('/').pop()),
            subtitleLangs: subLangs,
            subtitleFormat: subs?.format ?? 'srt',
            container: plan.container,
            transcode: plan.transcode,
            burn,
            outPath: 'out.' + plan.container,
            cwd: tmp,
            durationSec: result.media.durationSec,
            threads: spec.transcodeThreads,
            onProgress: (f) => {
                job.currentFraction = f;
            },
            signal,
        });
        job.timings.processMs = Date.now() - procStart;
        this.completeStage(job);
        job.result = await this.registerFile(outPath, fileName);
        if (needSubs && subs?.mode === 'sidecar') {
            job.extraFiles = await this.registerSidecars(job, result, subLangs, subs.format, tmp);
        }
        job.timings.directCopy = !plan.transcode && !burn;
    }
    /* ------------------------------ audio ------------------------------- */
    async runAudioJob(job, result, signal) {
        const req = job.request;
        const plan = planAudio(result.media, req.audioFormat ?? 'source', req.audioBitrateKbps ?? 192);
        for (const n of plan.notes)
            this.pushEvent(job, 'info', n);
        const af = plan.source;
        this.pushEvent(job, 'info', `Source: ${af.codec} ${Math.round(af.bitrate / 1000)}k → target ${plan.target}${plan.directCopy ? ' (stream copy — zero processing)' : plan.remux ? ' (remux)' : ' (transcode)'}`);
        const tmp = join(tmpDir(), job.id);
        await ensureDir(tmp);
        this.setStage(job, 'downloading', 'Downloading audio', KIND_WEIGHTS.audio.download);
        const dlStart = Date.now();
        const ref = result.streams.get(af.itag);
        if (!ref)
            throw new Error(`Audio stream itag ${af.itag} missing`);
        const spec = profileSpec(this.cfg);
        const progress = this.makeProgress(job, ref.sizeBytes);
        job.totalBytes = ref.sizeBytes;
        const srcPath = join(tmp, `audio-src.${af.container}`);
        await downloadStream({
            url: ref.url,
            dest: srcPath,
            expectedSize: ref.sizeBytes,
            headers: ref.headers,
            maxSegments: spec.maxSegments,
            segmentBytes: spec.segmentBytes,
            onBytes: progress.onBytes,
            signal,
            label: 'audio',
        });
        job.timings.downloadMs = Date.now() - dlStart;
        this.completeStage(job);
        const baseName = sanitizeFilename(result.media.title);
        const tag = plan.target === 'source' ? plan.ext : plan.target;
        const fileName = `${baseName} [${tag}${plan.bitrateKbps ? ` ${plan.bitrateKbps}k` : ''}].${plan.ext}`;
        if (plan.directCopy) {
            job.result = await this.registerFile(srcPath, fileName);
            job.timings.directCopy = true;
            this.pushEvent(job, 'info', 'Container already matches target — file used as-is');
            return;
        }
        this.setStage(job, 'processing', `Converting to ${plan.target}`, KIND_WEIGHTS.audio.process);
        const procStart = Date.now();
        const outPath = join(tmp, `out.${plan.ext}`);
        await runAudioExtract({
            srcPath: 'audio-src.' + af.container,
            plan,
            outPath: 'out.' + plan.ext,
            cwd: tmp,
            thumbnailPath: await this.fetchThumbnail(job, result.media, tmp, signal),
            mediaTitle: result.media.title,
            durationSec: result.media.durationSec,
            threads: spec.transcodeThreads,
            onProgress: (f) => {
                job.currentFraction = f;
            },
            signal,
        });
        job.timings.processMs = Date.now() - procStart;
        this.completeStage(job);
        job.result = await this.registerFile(outPath, fileName);
        job.timings.directCopy = plan.remux;
    }
    /* ---------------------------- subtitles ----------------------------- */
    async runSubtitleJob(job, result, signal) {
        const req = job.request;
        const format = req.subtitles?.format ?? 'srt';
        const langs = (req.subtitles?.languages ?? []).filter((l) => result.captions.has(l));
        if (!langs.length) {
            throw new Error(`No downloadable subtitle tracks (available: ${result.media.subtitleTracks.map((t) => t.id).join(', ') || 'none'})`);
        }
        const tmp = join(tmpDir(), job.id);
        await ensureDir(tmp);
        this.setStage(job, 'downloading', 'Fetching captions', KIND_WEIGHTS.subtitle.subs);
        const files = await this.fetchSubtitles(job, result, langs, format, tmp, signal);
        this.completeStage(job);
        const baseName = sanitizeFilename(result.media.title);
        const outFiles = [];
        for (let i = 0; i < langs.length; i++) {
            const fileName = `${baseName}.${langs[i]}.${format}`;
            outFiles.push(await this.registerFile(join(tmp, files[i]), fileName));
        }
        job.result = outFiles[0];
        job.extraFiles = outFiles.slice(1);
    }
    /** Download selected caption tracks into tmp; returns relative filenames. */
    async fetchSubtitles(job, result, langs, format, tmp, signal) {
        const names = [];
        for (let i = 0; i < langs.length; i++) {
            const lang = langs[i];
            const baseUrl = result.captions.get(lang);
            const { content, cueCount } = await downloadCaption(baseUrl, format, signal);
            const name = `sub-${i}-${lang.replace(/[^a-z0-9-]/gi, '')}.${format}`;
            await writeFile(join(tmp, name), content, 'utf8');
            names.push(name);
            job.currentFraction = (i + 1) / langs.length;
            this.pushEvent(job, 'info', `Subtitles ${lang}: ${cueCount} cues → ${format.toUpperCase()}`);
        }
        return names;
    }
    async registerSidecars(job, result, langs, format, tmp) {
        const baseName = sanitizeFilename(result.media.title);
        const out = [];
        for (let i = 0; i < langs.length; i++) {
            const name = `sub-${i}-${langs[i].replace(/[^a-z0-9-]/gi, '')}.${format}`;
            const p = join(tmp, name);
            if (!existsSync(p))
                continue;
            out.push(await this.registerFile(p, `${baseName}.${langs[i]}.${format}`));
        }
        return out;
    }
    /** Cover art for MP3 (from provider thumbnails). */
    async fetchThumbnail(job, media, tmp, signal) {
        try {
            if (media.source === 'demo' && media.id) {
                const local = demoThumbPath(media.id);
                if (existsSync(local)) {
                    await copyFile(local, join(tmp, 'cover.jpg'));
                    return 'cover.jpg';
                }
                return undefined;
            }
            if (media.thumbnail?.startsWith('http')) {
                for (const u of [
                    media.thumbnail.replace('mqdefault', 'maxresdefault'),
                    media.thumbnail,
                ]) {
                    const res = await fetch(u, { signal });
                    if (res.ok) {
                        const buf = new Uint8Array(await res.arrayBuffer());
                        if (buf.length > 1000) {
                            await writeFile(join(tmp, 'cover.jpg'), buf);
                            return 'cover.jpg';
                        }
                    }
                }
            }
        }
        catch {
            /* cover art is best-effort */
        }
        return undefined;
    }
    /* --------------------------- file registry -------------------------- */
    async registerFile(tmpPath, fileName) {
        const ext = extname(fileName).slice(1) || extname(tmpPath).slice(1) || 'bin';
        const fileId = randomId('f');
        const dest = join(filesDir(), `${fileId}.${ext}`);
        await ensureDir(filesDir());
        await rename(tmpPath, dest).catch(async () => {
            await copyFile(tmpPath, dest);
        });
        const size = (await stat(dest)).size;
        const entry = {
            fileId,
            path: dest,
            fileName,
            sizeBytes: size,
            mimeType: mimeFor(fileName),
        };
        this.files.set(fileId, entry);
        return { fileId, fileName, sizeBytes: size, mimeType: entry.mimeType };
    }
    /* ------------------------------ views ------------------------------- */
    view(job) {
        const progress = job.status === 'completed'
            ? 1
            : Math.min(0.999, job.weightBase + job.currentWeight * job.currentFraction);
        return {
            id: job.id,
            request: job.request,
            status: job.status,
            stage: job.stage,
            progress,
            downloadedBytes: job.downloadedBytes,
            totalBytes: job.totalBytes,
            speedBps: job.speedBps,
            etaSec: job.etaSec,
            media: job.media,
            error: job.error,
            result: job.result,
            extraFiles: job.extraFiles.length ? job.extraFiles : undefined,
            events: job.events,
            createdAt: job.createdAt,
            startedAt: job.startedAt,
            finishedAt: job.finishedAt,
            timings: job.timings,
        };
    }
    /* --------------------------- persistence ---------------------------- */
    async persist() {
        try {
            const jobs = this.order
                .map((id) => this.jobs.get(id))
                .filter(Boolean)
                .filter((j) => j.status === 'completed' || j.status === 'failed' || j.status === 'canceled')
                .slice(0, 100)
                .map((j) => ({
                id: j.id,
                request: j.request,
                media: j.media,
                status: j.status,
                error: j.error,
                result: j.result,
                extraFiles: j.extraFiles,
                timings: j.timings,
                createdAt: j.createdAt,
                finishedAt: j.finishedAt,
                events: j.events.slice(-5),
            }));
            const files = [...this.files.values()];
            const state = { jobs, files };
            await writeFile(join(tmpDir(), 'state.json.tmp'), JSON.stringify(state), 'utf8');
            await rename(join(tmpDir(), 'state.json.tmp'), statePath());
        }
        catch {
            /* persistence is best-effort */
        }
    }
    async loadState() {
        try {
            const p = statePath();
            if (!existsSync(p))
                return;
            const state = JSON.parse(await readFile(p, 'utf8'));
            for (const f of state.files ?? []) {
                if (existsSync(f.path))
                    this.files.set(f.fileId, f);
            }
            for (const j of (state.jobs ?? []).slice().reverse()) {
                const job = {
                    id: j.id,
                    request: j.request,
                    status: j.status,
                    stage: j.status === 'completed' ? 'Completed' : j.status === 'canceled' ? 'Canceled' : 'Failed',
                    weightBase: 1,
                    currentWeight: 0,
                    currentFraction: 0,
                    downloadedBytes: 0,
                    media: j.media,
                    error: j.error,
                    result: j.result && this.files.has(j.result.fileId) ? j.result : undefined,
                    extraFiles: (j.extraFiles ?? []).filter((f) => this.files.has(f.fileId)),
                    events: j.events ?? [],
                    timings: j.timings ?? {},
                    createdAt: j.createdAt,
                    finishedAt: j.finishedAt,
                };
                if (!job.result && !job.extraFiles.length && job.status === 'completed')
                    continue;
                this.jobs.set(job.id, job);
                this.order.unshift(job.id);
            }
        }
        catch {
            /* fresh start */
        }
    }
    /* ------------------------------ analyze ----------------------------- */
    async analyze(urls, signal) {
        return analyzeInputs(urls, { signal });
    }
    async diskUsage() {
        return dirSize(filesDir());
    }
}
