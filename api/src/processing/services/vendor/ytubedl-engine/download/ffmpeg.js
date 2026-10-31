/**
 * YTubeDL Engine — ffmpeg process wrapper.
 *
 * Zero-copy philosophy: callers pass -c copy whenever possible so ffmpeg
 * only remuxes (I/O bound, near-zero CPU). Progress is parsed from
 * `-progress pipe:1` key=value blocks; stderr carries errors only.
 *
 * Uses node:child_process — works identically on Node.js and Bun.
 */
import { spawn } from 'node:child_process';
import { errMessage } from '../util.js';
const FFMPEG_BIN = process.env.YTUBEDL_FFMPEG ?? process.env.YTUBEDL_FFMPEG ?? 'ffmpeg';
function spawnProc(args, cwd) {
    const child = spawn(FFMPEG_BIN, args, {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
    });
    const exitCode = new Promise((resolve) => {
        child.on('exit', (code) => resolve(code ?? -1));
        child.on('error', () => resolve(-1));
    });
    return { exitCode, stdout: child.stdout, stderr: child.stderr, kill: () => child.kill('SIGKILL') };
}
/** Collect a readable into lines (no cap — outputs are tiny at loglevel error). */
async function collectLines(stream, onLine) {
    const lines = [];
    const decoder = new TextDecoder();
    let buf = '';
    for await (const chunk of stream) {
        buf += decoder.decode(chunk, { stream: true });
        let nl;
        while ((nl = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, nl).trim();
            buf = buf.slice(nl + 1);
            if (line) {
                lines.push(line);
                onLine?.(line);
            }
        }
    }
    return lines;
}
let ffmpegVersionCache;
export async function ffmpegVersion() {
    if (ffmpegVersionCache !== undefined)
        return ffmpegVersionCache;
    try {
        const proc = spawnProc(['-version']);
        const [lines, code] = await Promise.all([collectLines(proc.stdout), proc.exitCode]);
        if (code !== 0 && !lines.length)
            throw new Error('ffmpeg not runnable');
        const m = lines[0]?.match(/ffmpeg version (\S+)/);
        ffmpegVersionCache = m ? m[1] : 'unknown';
    }
    catch {
        ffmpegVersionCache = null;
    }
    return ffmpegVersionCache;
}
export async function runFfmpeg(args, opts = {}) {
    // `-progress pipe:1` emits machine-readable key=value progress blocks on
    // stdout (errors stay on stderr) → live fraction during remux/transcode.
    const fullArgs = [
        '-hide_banner',
        '-nostdin',
        '-loglevel',
        'error',
        '-y',
        '-progress',
        'pipe:1',
        '-nostats',
        ...args,
    ];
    const proc = spawnProc(fullArgs, opts.cwd);
    let aborted = false;
    const onAbort = () => {
        aborted = true;
        try {
            proc.kill();
        }
        catch {
            /* already dead */
        }
    };
    opts.signal?.addEventListener('abort', onAbort, { once: true });
    const stderrLinesPromise = collectLines(proc.stderr);
    const parseProgress = collectLines(proc.stdout, (line) => {
        if (line.startsWith('out_time_us=')) {
            const us = Number(line.slice('out_time_us='.length));
            if (Number.isFinite(us) && opts.onProgress && opts.totalDurationSec) {
                const outSec = us / 1e6;
                opts.onProgress(Math.min(1, outSec / opts.totalDurationSec), outSec);
            }
        }
        else if (line === 'progress=end') {
            opts.onProgress?.(1, opts.totalDurationSec ?? 0);
        }
    });
    try {
        const [exitCode] = await Promise.all([proc.exitCode, stderrLinesPromise, parseProgress]);
        if (aborted)
            throw new Error('ffmpeg canceled');
        if (exitCode !== 0) {
            const detail = (await stderrLinesPromise).slice(-8).join('\n');
            throw new Error(`${opts.label ?? 'ffmpeg'} failed (exit ${exitCode})${detail ? `: ${detail}` : ''}`);
        }
    }
    finally {
        opts.signal?.removeEventListener('abort', onAbort);
        if (aborted) {
            try {
                proc.kill();
            }
            catch {
                /* noop */
            }
        }
    }
}
/** True when an ffmpeg invocation includes re-encoding of the video stream. */
export function argsTranscodeVideo(args) {
    const hasSubsFilter = args.some((a) => a.startsWith('subtitles=') || a.startsWith('vf'));
    const copyVideo = args.includes('-c:v') && args[args.indexOf('-c:v') + 1] === 'copy';
    const copyAll = args.includes('-c') && args[args.indexOf('-c') + 1] === 'copy';
    return hasSubsFilter || !(copyVideo || copyAll);
}
export { errMessage };
