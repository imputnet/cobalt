/**
 * YTubeDL Engine — small shared utilities (zero dependencies).
 *
 * Every helper is runtime-agnostic: Node.js 18+ and Bun.
 */
import { dirname } from 'node:path';
import { mkdir, readdir, stat } from 'node:fs/promises';
export const MB = 1024 * 1024;
export function randomId(prefix, len = 12) {
    const bytes = crypto.getRandomValues(new Uint8Array(len));
    const hex = Buffer.from(bytes).toString('hex').slice(0, len);
    return `${prefix}_${hex}`;
}
export function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
}
/** Windows-safe filename */
export function sanitizeFilename(name, maxLen = 120) {
    const cleaned = name
        .replace(/[\u0000-\u001f<>:"/\\|?*]+/g, '-')
        .replace(/\s+/g, ' ')
        .replace(/^[\s.]+|[\s.]+$/g, '')
        .slice(0, maxLen)
        .trim();
    return cleaned || 'download';
}
export function formatBytes(bytes) {
    if (bytes === undefined || Number.isNaN(bytes))
        return '—';
    if (bytes < 1024)
        return `${bytes} B`;
    const units = ['KB', 'MB', 'GB', 'TB'];
    let v = bytes / 1024;
    let i = 0;
    while (v >= 1024 && i < units.length - 1) {
        v /= 1024;
        i++;
    }
    return `${v >= 100 ? v.toFixed(0) : v.toFixed(1)} ${units[i]}`;
}
export function formatDuration(sec) {
    if (sec === undefined || Number.isNaN(sec) || sec < 0)
        return '—';
    const s = Math.floor(sec % 60);
    const m = Math.floor((sec / 60) % 60);
    const h = Math.floor(sec / 3600);
    const pad = (n) => String(n).padStart(2, '0');
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}
export const MIME_BY_EXT = {
    mp4: 'video/mp4',
    m4v: 'video/mp4',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    mov: 'video/quicktime',
    avi: 'video/x-msvideo',
    '3gp': 'video/3gpp',
    m4a: 'audio/mp4',
    opus: 'audio/opus',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    flac: 'audio/flac',
    ogg: 'audio/ogg',
    srt: 'application/x-subrip',
    vtt: 'text/vtt',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
};
export function mimeFor(fileName) {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}
export async function ensureDir(path) {
    await mkdir(path, { recursive: true });
}
/** Recursive directory size (portable — no runtime-specific glob). */
export async function dirSize(path) {
    let total = 0;
    let entries;
    try {
        entries = await readdir(path, { withFileTypes: true });
    }
    catch {
        return 0;
    }
    for (const e of entries) {
        const p = `${path}/${e.name}`;
        try {
            if (e.isDirectory())
                total += await dirSize(p);
            else if (e.isFile())
                total += (await stat(p)).size;
        }
        catch {
            /* file vanished */
        }
    }
    return total;
}
/** JSON.stringify for error objects so messages survive logs */
export function errMessage(e) {
    if (e instanceof Error)
        return e.message;
    if (typeof e === 'string')
        return e;
    try {
        return JSON.stringify(e);
    }
    catch {
        return String(e);
    }
}
/** Build a Content-Disposition value with RFC 5987 UTF-8 fallback */
export function contentDisposition(fileName, inline = false) {
    const type = inline ? 'inline' : 'attachment';
    const ascii = fileName.replace(/[^\x20-\x7e]+/g, '_').replace(/"/g, "'");
    return `${type}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(fileName)}`;
}
export function fileDirOf(path) {
    return dirname(path);
}
