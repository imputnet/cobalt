/**
 * YTubeDL Engine — segmented parallel HTTP downloader.
 *
 * Power-efficient by design:
 *  - Event-driven streams (zero polling, zero busy-wait; idle workers cost nothing)
 *  - Keep-alive connections (Bun's pooled fetch) → fewer TLS handshakes
 *  - Bounded memory: fixed 512 KiB coalescing buffers, no whole-file buffering
 *  - Positional pwrite-style writes at segment offsets → no intermediate files
 *  - Parallel range requests sized to amortize overhead (profile-controlled)
 *  - Segment-level retry resumes from the exact byte offset (never restarts a file)
 *  - Abort propagates instantly; sockets close, file handle releases
 */
import { open, rm } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { dirname } from 'node:path';
import { ensureDir, MB } from '../util.js';
const RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);
const CHUNK_BUFFER = 512 * 1024;
class CanceledError extends Error {
    constructor() {
        super('download canceled');
    }
}
/** Coalescing positional writer — batches small network chunks into fewer syscalls. */
class SegmentWriter {
    fh;
    onBytes;
    buf;
    len = 0;
    pos;
    constructor(fh, segmentStart, onBytes) {
        this.fh = fh;
        this.onBytes = onBytes;
        this.buf = Buffer.allocUnsafe(CHUNK_BUFFER);
        this.pos = segmentStart;
    }
    async write(chunk) {
        if (this.len + chunk.length > this.buf.length)
            await this.flush();
        if (chunk.length >= this.buf.length) {
            await this.fh.write(chunk, 0, chunk.length, this.pos);
            this.pos += chunk.length;
            this.onBytes?.(chunk.length);
        }
        else {
            chunk.copy(this.buf, this.len);
            this.len += chunk.length;
        }
    }
    async flush() {
        if (this.len === 0)
            return;
        await this.fh.write(this.buf, 0, this.len, this.pos);
        this.pos += this.len;
        this.onBytes?.(this.len);
        this.len = 0;
    }
    get offset() {
        return this.pos + this.len; // logical position including pending buffer
    }
}
async function headRequest(url, headers, signal) {
    // A 2-byte ranged GET is more reliable than HEAD across CDNs
    try {
        const res = await fetch(url, {
            headers: { ...headers, Range: 'bytes=0-1' },
            signal,
        });
        if (res.ok || res.status === 206) {
            const cr = res.headers.get('content-range'); // "bytes 0-1/123456"
            const ar = (res.headers.get('accept-ranges') ?? '').includes('bytes');
            const size = cr ? Number(cr.split('/')[1]) : undefined;
            const ranged = res.status === 206 && !!cr;
            await res.body?.cancel().catch(() => { });
            return { size: Number.isFinite(size) ? size : undefined, acceptsRanges: ar || ranged, finalUrl: url };
        }
        await res.body?.cancel().catch(() => { });
    }
    catch (e) {
        if (signal?.aborted)
            throw new CanceledError();
        throw e;
    }
    return { acceptsRanges: false, finalUrl: url };
}
async function downloadRange(url, seg, writer, headers, signal) {
    const maxAttempts = 4;
    let attempt = 0;
    // Resume point advances as bytes land, so retries only fetch what's missing.
    let logicalStart = writer.offset;
    for (;;) {
        attempt++;
        try {
            const from = Math.max(seg.start, logicalStart);
            const rangeHeaders = from >= seg.end
                ? headers
                : { ...headers, Range: `bytes=${from}-${seg.end}` };
            const res = await fetch(url, { headers: rangeHeaders, signal });
            if (res.status === 416 && from > seg.start) {
                // Already complete
                await res.body?.cancel().catch(() => { });
                return;
            }
            if (!res.ok && res.status !== 206) {
                await res.body?.cancel().catch(() => { });
                if (RETRYABLE.has(res.status) && attempt <= maxAttempts) {
                    await backoff(attempt, signal);
                    continue;
                }
                throw new Error(`HTTP ${res.status} while downloading range ${from}-${seg.end}`);
            }
            if (res.status === 200 && from > seg.start) {
                // Server ignored the range → cannot resume; restart this segment.
                await res.body?.cancel().catch(() => { });
                logicalStart = seg.start;
                continue;
            }
            const body = res.body;
            if (!body)
                throw new Error('empty response body');
            for await (const chunk of Readable.fromWeb(body)) {
                await writer.write(chunk);
                logicalStart = writer.offset;
            }
            if (writer.offset - 1 < seg.end && writer.offset <= seg.end) {
                // Short read — retry the remainder
                if (attempt <= maxAttempts) {
                    await backoff(attempt, signal);
                    continue;
                }
                throw new Error(`short read: got ${writer.offset - seg.start} of ${seg.end - seg.start + 1} bytes`);
            }
            await writer.flush();
            return;
        }
        catch (e) {
            if (signal?.aborted)
                throw new CanceledError();
            if (attempt > maxAttempts)
                throw e;
            await backoff(attempt, signal);
        }
    }
}
function backoff(attempt, signal) {
    const ms = Math.min(2_000, 200 * 2 ** (attempt - 1)) + Math.random() * 150;
    return new Promise((resolve, reject) => {
        const t = setTimeout(resolve, ms);
        signal?.addEventListener('abort', () => {
            clearTimeout(t);
            reject(new CanceledError());
        }, { once: true });
    });
}
async function singleStream(url, fh, opts, startedAt) {
    const res = await fetch(url, { headers: opts.headers, signal: opts.signal });
    if (!res.ok)
        throw new Error(`HTTP ${res.status} downloading ${opts.label ?? 'stream'}`);
    const writer = new SegmentWriter(fh, 0, opts.onBytes);
    for await (const chunk of Readable.fromWeb(res.body)) {
        await writer.write(chunk);
    }
    await writer.flush();
    const size = writer.offset;
    return { sizeBytes: size, ms: Date.now() - startedAt, avgSpeedBps: size / ((Date.now() - startedAt) / 1000) };
}
/**
 * Download `url` to `dest`.
 * Uses parallel ranged segments when the server supports them and the file is
 * large enough to justify the extra connections; otherwise a single stream.
 */
export async function downloadStream(opts) {
    const startedAt = Date.now();
    await ensureDir(dirname(opts.dest));
    const fh = await open(opts.dest, 'w');
    try {
        let size = opts.expectedSize;
        let acceptsRanges = false;
        if (size === undefined || size > 2 * MB) {
            const head = await headRequest(opts.url, opts.headers ?? {}, opts.signal);
            if (size === undefined)
                size = head.size;
            acceptsRanges = head.acceptsRanges;
        }
        const worthSegmenting = acceptsRanges &&
            opts.maxSegments > 1 &&
            size !== undefined &&
            size > Math.max(opts.segmentBytes, 2 * MB);
        if (!worthSegmenting || size === undefined) {
            return await singleStream(opts.url, fh, opts, startedAt);
        }
        // Plan: workers bounded by profile, finer-grained segments for load balancing.
        const targetSegs = Math.min(opts.maxSegments * 3, Math.max(1, Math.ceil(size / opts.segmentBytes)), 64);
        const segSize = Math.ceil(size / targetSegs);
        const segments = [];
        for (let i = 0; i * segSize < size; i++) {
            segments.push({ start: i * segSize, end: Math.min(size - 1, (i + 1) * segSize - 1) });
        }
        const workerCount = Math.min(opts.maxSegments, segments.length);
        let nextSeg = 0;
        let done = 0;
        const workerErr = [];
        const worker = async () => {
            for (;;) {
                if (workerErr.length)
                    return;
                if (opts.signal?.aborted)
                    throw new CanceledError();
                const idx = nextSeg++;
                if (idx >= segments.length)
                    return;
                const seg = segments[idx];
                const writer = new SegmentWriter(fh, seg.start, opts.onBytes);
                try {
                    await downloadRange(opts.url, seg, writer, opts.headers ?? {}, opts.signal);
                    done++;
                }
                catch (e) {
                    workerErr.push(e);
                    return;
                }
            }
        };
        await Promise.all(Array.from({ length: workerCount }, () => worker()));
        if (workerErr.length)
            throw workerErr[0];
        if (done !== segments.length)
            throw new Error('segmented download incomplete');
        const ms = Date.now() - startedAt;
        return { sizeBytes: size, ms, avgSpeedBps: size / (ms / 1000) };
    }
    finally {
        await fh.close().catch(() => { });
        if (opts.signal?.aborted) {
            // Canceled → remove the partial file (keeps tmp dir clean)
            await rm(opts.dest, { force: true }).catch(() => { });
        }
    }
}
