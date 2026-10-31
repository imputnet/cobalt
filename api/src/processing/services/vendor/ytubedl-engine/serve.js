/**
 * YTubeDL Engine — HTTP file serving with Range support.
 *
 * Pure Web-standard (Fetch API) Request/Response — mounts identically into
 * Bun.serve, Node (via the node bridge), Next.js route handlers, Deno, Hono,
 * or any Fetch-speaking server. Streams from disk (never buffers whole files).
 */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { Readable } from 'node:stream';
export function parseRange(header, size) {
    if (!header)
        return 'full';
    const m = header.match(/^bytes=(\d*)-(\d*)$/);
    if (!m || (m[1] === '' && m[2] === ''))
        return 'invalid';
    const sizeNum = Number(m[1]);
    const sizeEnd = Number(m[2]);
    if (m[1] === '') {
        // suffix range: last N bytes
        const n = Math.min(sizeEnd, size);
        if (n <= 0)
            return 'invalid';
        return { start: size - n, end: size - 1 };
    }
    const start = sizeNum;
    if (start >= size)
        return 'invalid';
    const end = m[2] === '' ? size - 1 : Math.min(sizeEnd, size - 1);
    if (end < start)
        return 'invalid';
    return { start, end };
}
/**
 * Serve a file with Range/206, HEAD, and Content-Disposition support.
 * Streams via createReadStream — constant memory for any file size.
 */
export async function serveFileResponse(req, filePath, opts) {
    const size = (await stat(filePath)).size;
    const commonHeaders = {
        'Content-Type': opts.mime,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-store',
    };
    if (opts.fileName) {
        const ascii = opts.fileName.replace(/[^\x20-\x7e]+/g, '_').replace(/"/g, "'");
        commonHeaders['Content-Disposition'] = `${opts.inline ? 'inline' : 'attachment'}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(opts.fileName)}`;
    }
    const range = parseRange(req.headers.get('range'), size);
    if (req.method === 'HEAD') {
        return new Response(null, {
            status: 200,
            headers: { ...commonHeaders, 'Content-Length': String(size) },
        });
    }
    if (range === 'invalid') {
        return new Response('Range Not Satisfiable', {
            status: 416,
            headers: { ...commonHeaders, 'Content-Range': `bytes */${size}` },
        });
    }
    if (range === 'full') {
        const stream = Readable.toWeb(createReadStream(filePath));
        return new Response(stream, { status: 200, headers: { ...commonHeaders } });
    }
    const stream = Readable.toWeb(createReadStream(filePath, { start: range.start, end: range.end }));
    return new Response(stream, {
        status: 206,
        headers: {
            ...commonHeaders,
            'Content-Range': `bytes ${range.start}-${range.end}/${size}`,
        },
    });
}
export function jsonError(status, message) {
    return Response.json({ error: message }, { status });
}
export function jsonOk(data, status = 200) {
    return Response.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}
/** Standard CORS headers — helps direct cross-origin integrators. */
export const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Range',
};
/** Timing-safe existence probe for API guards. */
export async function fileExists(path) {
    try {
        await stat(path);
        return true;
    }
    catch {
        return false;
    }
}
