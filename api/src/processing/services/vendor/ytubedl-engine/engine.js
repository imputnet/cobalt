import { ENGINE_VERSION } from './types.js';
import { JobManager } from './queue.js';
import { probeUrl } from './providers/index.js';
import { youtubeHealth } from './providers/youtube.js';
import { demoState, ensureDemoMedia, startDemoOrigin } from './demo-origin.js';
import { ffmpegVersion } from './download/ffmpeg.js';
import { downloadCaption } from './subtitles.js';
import { ensureDataDirs, filesDir, setDataRoot } from './config.js';
export class YTubeDL {
    jobs;
    listeners = new Map();
    bootedAt = Date.now();
    initOpts;
    constructor(cfg) {
        this.jobs = new JobManager();
        this.initOpts = cfg;
        if (cfg?.dataDir)
            setDataRoot(cfg.dataDir);
    }
    on(event, fn) {
        if (!this.listeners.has(event))
            this.listeners.set(event, new Set());
        this.listeners.get(event).add(fn);
        return () => this.listeners.get(event)?.delete(fn);
    }
    emit(event, jobId) {
        for (const fn of this.listeners.get(event) ?? [])
            fn(jobId);
    }
    /**
     * Boot: data dirs, demo origin, job queue + persisted state restore.
     * Options passed here override constructor options.
     */
    async init(opts) {
        const merged = { ...this.initOpts, ...opts };
        if (merged.dataDir)
            setDataRoot(merged.dataDir);
        await ensureDataDirs();
        await startDemoOrigin();
        // Job updates carry the changed job's id ('*' for bulk events).
        await this.jobs.init((jobId) => this.emit('job-update', jobId ?? '*'));
        if (merged.concurrency !== undefined || merged.profile !== undefined) {
            await this.jobs.updateConfig({
                ...(merged.concurrency !== undefined ? { concurrency: merged.concurrency } : {}),
                ...(merged.profile !== undefined ? { profile: merged.profile } : {}),
            });
        }
        // Demo media generation runs in the background; health reflects progress.
        void ensureDemoMedia().catch(() => { });
        void youtubeHealth().catch(() => { });
    }
    /** Probe a single URL into media metadata (throws on hard failure). */
    async probe(url) {
        const result = await probeUrl(url);
        return result.media;
    }
    /** Analyze a batch of links (playlists expand; failures never fail the batch). */
    analyze(urls, signal) {
        return this.jobs.analyze(urls, signal);
    }
    /** Enqueue a download job; returns its live view immediately. */
    enqueue(request) {
        return this.jobs.enqueue(request);
    }
    /** Standalone subtitle download (independent feature — no job queue). */
    async downloadSubtitles(url, languages, format) {
        const result = await probeUrl(url);
        const out = [];
        for (const lang of languages) {
            const baseUrl = result.captions.get(lang);
            if (!baseUrl)
                continue;
            const { content, cueCount } = await downloadCaption(baseUrl, format);
            out.push({ language: lang, content, cueCount });
        }
        return out;
    }
    async health(forceYoutubeCheck = false) {
        const stats = this.jobs.stats();
        const [ffv, yt] = await Promise.all([
            ffmpegVersion(),
            youtubeHealth(forceYoutubeCheck),
        ]);
        return {
            ok: true,
            version: ENGINE_VERSION,
            uptimeSec: Math.floor((Date.now() - this.bootedAt) / 1000),
            ffmpeg: ffv ? { ok: true, version: ffv } : { ok: false },
            youtube: yt,
            demo: {
                ready: demoState.ready,
                progress: demoState.ready ? 1 : demoState.progress,
                detail: demoState.error ?? demoState.detail,
            },
            config: {
                concurrency: this.jobs.getConfig().concurrency,
                profile: this.jobs.getConfig().profile,
                downloadDir: filesDir(),
                jobsActive: stats.jobsActive,
                jobsQueued: stats.jobsQueued,
                filesBytes: stats.filesBytes,
            },
        };
    }
    get uptimeSec() {
        return Math.floor((Date.now() - this.bootedAt) / 1000);
    }
}
/**
 * Backwards-compatible alias of {@link YTubeDL}.
 * @deprecated Use `YTubeDL` instead.
 */
