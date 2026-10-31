import { copyFile } from 'node:fs/promises';
import { runFfmpeg } from './ffmpeg.js';
import { errMessage } from '../util.js';
export function planVideo(media, opts) {
    const notes = [];
    let candidates = media.videoFormats.filter((f) => f.container !== '3gp');
    if (!candidates.length)
        throw new Error('No downloadable video formats available');
    // --- quality clamp (exact label → same height any fps → next lower → best)
    const wanted = opts.qualityLabel && opts.qualityLabel !== 'best' ? opts.qualityLabel : null;
    if (wanted) {
        const exact = candidates.find((f) => f.label === wanted);
        const height = parseInt(wanted, 10);
        let pick = exact ??
            candidates.find((f) => f.height === height) ??
            candidates
                .slice()
                .sort((a, b) => (b.height ?? 0) - (a.height ?? 0))
                .find((f) => (f.height ?? 0) <= height);
        if (!pick) {
            pick = candidates[candidates.length - 1];
            notes.push(`Requested ${wanted} unavailable → using ${pick.label}`);
        }
        else if (!exact && pick.label !== wanted) {
            notes.push(`Requested ${wanted} unavailable → using ${pick.label}`);
        }
        candidates = [pick];
    }
    else {
        // best = highest height, then fps, then bitrate
        candidates = [candidates[0]];
    }
    // --- codec preference
    if (opts.preferCodec && opts.preferCodec !== 'any') {
        const family = opts.preferCodec;
        const matching = candidates.filter((f) => f.codecFamily === family);
        if (matching.length)
            candidates = matching;
        else
            notes.push(`No ${family} format at this quality → using ${candidates[0].codecFamily}`);
    }
    const video = candidates[0];
    // --- burn-in always re-encodes to H.264 MP4 (broad compatibility)
    if (opts.burnSubs) {
        return {
            video,
            audio: pickAudioFor(media, video.container === 'webm' ? 'opus' : 'aac'),
            container: 'mp4',
            transcode: true,
            progressive: false,
            notes,
        };
    }
    // --- container resolution
    let container;
    let transcode = false;
    const userContainer = opts.container ?? 'auto';
    if (userContainer === 'auto') {
        // Match source codec → guarantees stream-copy remux
        container =
            video.codecFamily === 'vp9'
                ? 'webm'
                : video.codecFamily === 'other'
                    ? 'mkv' // unknown codec → matroska accepts anything
                    : 'mp4';
        if (opts.needSubs)
            container = 'mkv'; // best soft-sub support
        if (video.hasAudio) {
            // progressive file already plays; keep as-is unless subs force mkv
            return { video, container, transcode: false, progressive: true, notes };
        }
    }
    else {
        container = userContainer;
        if (video.hasAudio) {
            const srcExt = video.container;
            if (srcExt !== container && container !== 'mkv') {
                // progressive in a different container → remux (copy) if mkv, else re-encode path
                if (container === 'mp4' || container === 'webm') {
                    notes.push(`Progressive stream is ${srcExt}; remuxing to ${container}`);
                }
                return {
                    video,
                    container,
                    transcode: container === 'mp4' || container === 'webm',
                    progressive: false,
                    notes,
                };
            }
            return { video, container, transcode: false, progressive: true, notes };
        }
        // adaptive → check codec compatibility with target container
        const compatible = container === 'mkv' ||
            video.codecFamily === 'other' ||
            (container === 'mp4' && (video.codecFamily === 'h264' || video.codecFamily === 'av1')) ||
            (container === 'webm' && (video.codecFamily === 'vp9' || video.codecFamily === 'av1'));
        if (!compatible) {
            transcode = true;
            notes.push(`${video.codecFamily} is not natively ${container} → video will be re-encoded (slower)`);
        }
    }
    const audio = video.hasAudio
        ? undefined
        : pickAudioFor(media, container === 'webm' ? 'opus' : 'aac');
    return { video, audio, container, transcode, progressive: video.hasAudio && !opts.needSubs, notes };
}
function pickAudioFor(media, wantCodec) {
    if (!media.audioFormats.length)
        return undefined;
    const byCodec = media.audioFormats.filter((f) => f.codec === wantCodec);
    return byCodec[0] ?? media.audioFormats[0];
}
export function planAudio(media, target = 'source', bitrateKbps = 192) {
    const notes = [];
    if (!media.audioFormats.length)
        throw new Error('No downloadable audio formats available');
    const source = media.audioFormats[0]; // best bitrate first
    switch (target) {
        case 'source':
        case 'm4a':
            if (source.codec === 'aac') {
                return { source, target: 'm4a', directCopy: true, remux: false, ext: 'm4a', notes };
            }
            if (target === 'm4a') {
                notes.push('Transcoding opus → aac (re-encode)');
                break;
            }
            // source is opus → cheap remux to .opus (ogg opus)
            return { source, target: 'opus', directCopy: false, remux: true, ext: 'opus', notes };
        case 'opus':
            if (source.codec === 'opus') {
                return { source, target: 'opus', directCopy: false, remux: true, ext: 'opus', notes };
            }
            notes.push('Transcoding aac → opus (re-encode)');
            break;
        case 'mp3':
        case 'wav':
        case 'flac':
        case 'ogg':
            notes.push(`Transcoding ${source.codec} → ${target} (re-encode)`);
            break;
    }
    return {
        source,
        target,
        directCopy: false,
        remux: false,
        ext: target,
        bitrateKbps: target === 'mp3' || target === 'ogg' ? bitrateKbps : undefined,
        notes,
    };
}
/** Mux video+audio(+embedded subtitles) into one file. */
export async function runMux(o) {
    const args = [];
    const hasV = !!o.videoPath;
    const hasA = !!o.audioPath;
    const subs = o.subtitlePaths ?? [];
    const burn = !!o.burn && subs.length > 0;
    if (o.videoPath)
        args.push('-i', o.videoPath);
    if (o.audioPath)
        args.push('-i', o.audioPath);
    for (const s of subs)
        args.push('-i', s);
    const inputCount = (hasV ? 1 : 0) + (hasA ? 1 : 0) + subs.length;
    if (inputCount === 1 && !subs.length && hasV) {
        // Single video input, no subs → plain remux/copy
        args.push('-c', 'copy');
    }
    else {
        // Explicit stream mapping: video, audio, then (soft) subtitles
        let idx = 0;
        if (hasV)
            args.push('-map', String(idx++));
        if (hasA)
            args.push('-map', String(idx++));
        if (!burn)
            for (let i = 0; i < subs.length; i++)
                args.push('-map', String(idx + i));
        if (burn && hasV) {
            // Burn-in: subtitles ride along as a video filter (re-encode required)
            const sub = subs[0].split('/').pop();
            args.push('-vf', `subtitles=${sub}:force_style='FontName=DejaVu Sans,Fontsize=18,OutlineColour=&H80000000,BorderStyle=3'`, '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p');
            if (hasA)
                args.push('-c:a', 'copy');
        }
        else if (o.transcode && hasV) {
            args.push('-c:v', o.container === 'webm' ? 'libvpx-vp9' : 'libx264', ...(o.container === 'webm'
                ? ['-deadline', 'realtime', '-cpu-used', '5']
                : ['-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p']));
            if (hasA)
                args.push('-c:a', 'copy');
        }
        else {
            args.push('-c', 'copy');
        }
        if (subs.length && !burn) {
            args.push('-c:s', o.container === 'mp4' ? 'mov_text' : o.subtitleFormat === 'vtt' ? 'webvtt' : 'srt');
            subs.forEach((_, i) => {
                const lang = o.subtitleLangs?.[i];
                if (lang)
                    args.push(`-metadata:s:s:${i}`, `language=${lang.replace('-auto', '')}`);
            });
        }
    }
    if (o.container === 'mp4')
        args.push('-movflags', '+faststart');
    // Cap encoder threads on re-encode paths (power-saver profile) — remuxes
    // are I/O bound and never reach this.
    if (o.threads && o.threads > 0 && (burn || o.transcode)) {
        args.push('-threads', String(o.threads));
    }
    args.push(o.outPath);
    await runFfmpeg(args, {
        cwd: o.cwd,
        label: 'mux',
        totalDurationSec: o.durationSec,
        onProgress: o.onProgress,
        signal: o.signal,
    });
}
/** Extract / convert an audio stream per plan (copy / remux / transcode). */
export async function runAudioExtract(o) {
    const { plan } = o;
    if (plan.directCopy) {
        // Zero-ffmpeg path: the downloaded file already IS the target format.
        // copyFile uses copy_file_range(2) on Linux — kernel-accelerated zero copy.
        await copyFile(o.srcPath, o.outPath);
        return;
    }
    const args = ['-i', o.srcPath];
    if (plan.target === 'mp3' && o.thumbnailPath) {
        args.push('-i', o.thumbnailPath);
    }
    switch (plan.target) {
        case 'opus':
            args.push('-c:a', 'copy'); // webm(matroska) → ogg opus remux
            break;
        case 'mp3': {
            args.push('-c:a', 'libmp3lame', '-b:a', `${plan.bitrateKbps ?? 192}k`);
            if (o.thumbnailPath) {
                args.push('-map', '0:a', '-map', '1:v', '-c:v', 'copy', '-disposition:v', 'attached_pic', '-id3v2_version', '3', '-metadata:s:v', 'title="Album cover"', '-metadata:s:v', 'comment="Cover (front)"');
            }
            if (o.mediaTitle)
                args.push('-metadata', `title=${o.mediaTitle}`);
            break;
        }
        case 'wav':
            args.push('-c:a', 'pcm_s16le');
            break;
        case 'flac':
            args.push('-c:a', 'flac', '-compression_level', '5');
            break;
        case 'ogg':
            args.push('-c:a', 'libvorbis', '-q:a', '6');
            break;
        case 'm4a':
            args.push('-c:a', 'aac', '-b:a', `${Math.max(128, Math.round(plan.source.bitrate / 1000))}k`);
            break;
    }
    // Cap encoder threads for transcodes (power-saver profile)
    if (o.threads && o.threads > 0 && !plan.remux) {
        args.push('-threads', String(o.threads));
    }
    args.push(o.outPath);
    await runFfmpeg(args, {
        cwd: o.cwd,
        label: `audio ${plan.target}`,
        totalDurationSec: o.durationSec,
        onProgress: o.onProgress,
        signal: o.signal,
    });
}
export { errMessage };
