/**
 * YTubeDL Engine — Demo Origin.
 *
 * A faithful local stand-in for YouTube's streaming CDN, used when the host
 * cannot reach YouTube (datacenter IPs are commonly bot-flagged). The origin
 * serves REAL generated media over REAL HTTP with Range support, so the entire
 * engine pipeline — segmented parallel downloads, adaptive stream muxing,
 * audio transcoding, caption conversion, subtitle embedding — is exercised
 * end-to-end exactly as it would be against YouTube.
 *
 * Catalog: three sample videos covering H.264/VP9/AV1, 144p→2160p, 60fps,
 * AAC/Opus audio, and multi-language captions (including an auto-generated
 * track with real-world ASR quirks). Media is generated once with ffmpeg and
 * cached on disk.
 */
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createServer } from 'node:http';
import { runFfmpeg } from './download/ffmpeg.js';
import { demoDir, demoOriginPort } from './config.js';
import { nodeRequestToWeb, sendWebResponse } from './node-bridge.js';
import { serveFileResponse, jsonError } from './serve.js';
import { ensureDir } from './util.js';
/* ------------------------- encoder availability ----------------------- */
const FFMPEG_BIN = process.env.YTUBEDL_FFMPEG ?? 'ffmpeg';
let encodersCache = null;
/**
 * Encoder names supported by the ffmpeg binary in use (probed once).
 * Not every build ships libsvtav1 / libvpx-vp9 — demo generation skips
 * formats whose encoder is missing instead of failing the whole catalog.
 */
function availableEncoders() {
    if (encodersCache)
        return encodersCache;
    const names = new Set();
    try {
        const r = spawnSync(FFMPEG_BIN, ['-hide_banner', '-encoders'], { encoding: 'utf8' });
        const lines = String(r.stdout ?? '').split('\n');
        const listStart = lines.findIndex((l) => l.startsWith(' ------'));
        for (const line of lines.slice(listStart + 1)) {
            const m = /^\s*[A-Z.]{6,7}\s+(\S+)\s{2,}\S/.exec(line);
            if (m)
                names.add(m[1]);
        }
    }
    catch {
        /* empty set: video formats get skipped, generation still reports */
    }
    encodersCache = names;
    return names;
}
const FONT = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
export const DEMO_CATALOG = [
    {
        id: 'YtdlDemoV01',
        title: 'Engine Test — Color Motion (H.264 Suite)',
        author: 'YTubeDL Demo Lab',
        durationSec: 30,
        source: 'testsrc2',
        formats: [
            { itag: 160, kind: 'video', codec: 'h264', w: 256, h: 144, fps: 30, bitrateKbps: 120, ext: 'mp4', crf: 30 },
            { itag: 133, kind: 'video', codec: 'h264', w: 426, h: 240, fps: 30, bitrateKbps: 250, ext: 'mp4', crf: 29 },
            { itag: 134, kind: 'video', codec: 'h264', w: 640, h: 360, fps: 30, bitrateKbps: 500, ext: 'mp4', crf: 28 },
            { itag: 135, kind: 'video', codec: 'h264', w: 854, h: 480, fps: 30, bitrateKbps: 900, ext: 'mp4', crf: 27 },
            { itag: 136, kind: 'video', codec: 'h264', w: 1280, h: 720, fps: 30, bitrateKbps: 1500, ext: 'mp4', crf: 26 },
            { itag: 299, kind: 'video', codec: 'h264', w: 1920, h: 1080, fps: 60, bitrateKbps: 3500, ext: 'mp4', crf: 25 },
            { itag: 302, kind: 'video', codec: 'vp9', w: 1280, h: 720, fps: 60, bitrateKbps: 2200, ext: 'webm', crf: 33 },
            { itag: 248, kind: 'video', codec: 'vp9', w: 1920, h: 1080, fps: 30, bitrateKbps: 2000, ext: 'webm', crf: 34 },
            { itag: 398, kind: 'video', codec: 'av1', w: 1280, h: 720, fps: 30, bitrateKbps: 800, ext: 'mp4', crf: 45 },
            { itag: 18, kind: 'progressive', codec: 'h264', w: 640, h: 360, fps: 30, bitrateKbps: 700, ext: 'mp4', crf: 27 },
            { itag: 140, kind: 'audio', codec: 'aac', bitrateKbps: 128, ext: 'm4a' },
            { itag: 251, kind: 'audio', codec: 'opus', bitrateKbps: 135, ext: 'webm' },
        ],
        captions: [
            {
                lang: 'en',
                name: 'English',
                lines: [
                    { start: 0.2, text: 'Welcome to the YTubeDL engine test suite.' },
                    { start: 3.0, text: 'This video exercises the full download pipeline.' },
                    { start: 6.2, text: 'Segmented parallel HTTP downloads with range requests.' },
                    { start: 9.4, text: 'Adaptive streams are muxed with ffmpeg stream copy.' },
                    { start: 12.6, text: 'No transcoding means near-zero CPU overhead.' },
                    { start: 15.8, text: 'Subtitles can be downloaded, converted, or embedded.' },
                    { start: 19.0, text: 'Try SRT or VTT output in the interface.' },
                    { start: 22.2, text: 'Or merge subtitles directly into this video.' },
                    { start: 25.4, text: 'Soft-embedding keeps the original quality intact.' },
                    { start: 27.8, text: 'Thanks for testing — check the job log below.' },
                ],
            },
            {
                lang: 'es',
                name: 'Spanish',
                lines: [
                    { start: 0.2, text: 'Bienvenido a la suite de pruebas del motor YTubeDL.' },
                    { start: 3.0, text: 'Este video ejerce el pipeline completo de descarga.' },
                    { start: 6.2, text: 'Descargas paralelas por segmentos con peticiones de rango.' },
                    { start: 9.4, text: 'Las corrientes adaptables se combinan con copia de flujo.' },
                    { start: 12.6, text: 'Sin transcodificación, el uso de CPU es mínimo.' },
                    { start: 15.8, text: 'Los subtítulos se pueden descargar, convertir o incrustar.' },
                    { start: 19.0, text: 'Prueba la salida SRT o VTT en la interfaz.' },
                    { start: 22.2, text: 'O fusiona los subtítulos directamente en este video.' },
                    { start: 25.4, text: 'La incrustación suave conserva la calidad original.' },
                    { start: 27.8, text: 'Gracias por probar — revisa el registro de tareas.' },
                ],
            },
            {
                lang: 'de',
                name: 'German',
                lines: [
                    { start: 0.2, text: 'Willkommen zur YTubeDL-Engine-Testreihe.' },
                    { start: 3.0, text: 'Dieses Video testet die komplette Download-Pipeline.' },
                    { start: 6.2, text: 'Parallele Segment-Downloads mit Range-Requests.' },
                    { start: 9.4, text: 'Adaptive Streams werden per Stream-Copy gemuxt.' },
                    { start: 12.6, text: 'Ohne Transcoding bleibt die CPU-Last minimal.' },
                    { start: 15.8, text: 'Untertitel können heruntergeladen oder eingebettet werden.' },
                    { start: 19.0, text: 'Probiere SRT- oder VTT-Ausgabe in der Oberfläche.' },
                    { start: 22.2, text: 'Oder fusioniere Untertitel direkt in dieses Video.' },
                    { start: 25.4, text: 'Soft-Einbettung erhält die Originalqualität.' },
                    { start: 27.8, text: 'Danke fürs Testen — siehe Aufgaben-Protokoll.' },
                ],
            },
            {
                lang: 'fr',
                name: 'French',
                lines: [
                    { start: 0.2, text: "Bienvenue dans la suite de tests du moteur YTubeDL." },
                    { start: 3.0, text: "Cette vidéo exerce le pipeline de téléchargement complet." },
                    { start: 6.2, text: "Téléchargements parallèles par segments avec requêtes de plage." },
                    { start: 9.4, text: "Les flux adaptatifs sont multiplexés par copie de flux." },
                    { start: 12.6, text: "Sans transcodage, la charge CPU est minimale." },
                    { start: 15.8, text: "Les sous-titres peuvent être téléchargés ou intégrés." },
                    { start: 19.0, text: "Essayez la sortie SRT ou VTT dans l'interface." },
                    { start: 22.2, text: "Ou fusionnez les sous-titres dans cette vidéo." },
                    { start: 25.4, text: "L'intégration douce préserve la qualité d'origine." },
                    { start: 27.8, text: "Merci de tester — consultez le journal des tâches." },
                ],
            },
            {
                lang: 'ja',
                name: 'Japanese',
                lines: [
                    { start: 0.2, text: 'YTubeDLエンジンのテストスイートへようこそ。' },
                    { start: 3.0, text: 'この動画はダウンロードパイプラインを検証します。' },
                    { start: 6.2, text: 'レンジリクエストによるセグメント並列ダウンロード。' },
                    { start: 9.4, text: 'アダプティブストリームはストリームコピーで多重化。' },
                    { start: 12.6, text: 'トランスコードなしでCPU負荷はほぼゼロ。' },
                    { start: 15.8, text: '字幕はダウンロード・変換・埋め込みが可能です。' },
                    { start: 19.0, text: 'インターフェースでSRTやVRT出力を試してください。' },
                    { start: 22.2, text: 'またはこの動画に字幕を直接マージします。' },
                    { start: 25.4, text: 'ソフト埋め込みは元の品質を保持します。' },
                    { start: 27.8, text: 'テストありがとうございます。' },
                ],
            },
            {
                lang: 'en',
                auto: true,
                name: 'English (auto-generated)',
                lines: [
                    { start: 0.1, text: 'welcome to the yt dl engine test suite' },
                    { start: 2.9, text: 'welcome to the yt dl engine test suite' },
                    { start: 4.5, text: "this video exercises the full download [music]" },
                    { start: 6.1, text: 'segmented parallel http downloads with' },
                    { start: 7.4, text: 'range requests' },
                    { start: 9.3, text: 'adaptive streams are muxed with ffmpeg' },
                    { start: 10.8, text: 'stream copy' },
                    { start: 12.5, text: 'no transcoding means near-zero cpu' },
                    { start: 13.9, text: 'overhead' },
                    { start: 15.7, text: 'subtitles can be downloaded converted' },
                    { start: 17.2, text: 'or embedded' },
                    { start: 19.0, text: 'try srt or vtt output in the interface' },
                    { start: 22.1, text: 'or merge subtitles directly into this' },
                    { start: 23.5, text: 'video' },
                    { start: 25.3, text: 'soft embedding keeps the original quality' },
                    { start: 27.7, text: 'thanks for testing check the job log' },
                    { start: 29.0, text: 'below' },
                ],
            },
        ],
    },
    {
        id: 'YtdlDemoV02',
        title: 'Engine Test — Gradient Fields (High-Res Suite)',
        author: 'YTubeDL Demo Lab',
        durationSec: 20,
        source: 'gradients',
        formats: [
            { itag: 136, kind: 'video', codec: 'h264', w: 1280, h: 720, fps: 30, bitrateKbps: 1500, ext: 'mp4', crf: 26 },
            { itag: 137, kind: 'video', codec: 'h264', w: 1920, h: 1080, fps: 30, bitrateKbps: 3000, ext: 'mp4', crf: 25 },
            { itag: 248, kind: 'video', codec: 'vp9', w: 1920, h: 1080, fps: 30, bitrateKbps: 2000, ext: 'webm', crf: 34 },
            { itag: 271, kind: 'video', codec: 'vp9', w: 2560, h: 1440, fps: 30, bitrateKbps: 4000, ext: 'webm', crf: 33 },
            { itag: 313, kind: 'video', codec: 'vp9', w: 3840, h: 2160, fps: 30, bitrateKbps: 8000, ext: 'webm', crf: 33 },
            { itag: 140, kind: 'audio', codec: 'aac', bitrateKbps: 128, ext: 'm4a' },
            { itag: 251, kind: 'audio', codec: 'opus', bitrateKbps: 135, ext: 'webm' },
        ],
        captions: [
            {
                lang: 'en',
                name: 'English',
                lines: [
                    { start: 0.2, text: 'High-resolution gradient fields.' },
                    { start: 3.0, text: 'This catalog entry reaches up to 2160p (4K).' },
                    { start: 6.5, text: 'Select any quality — the engine clamps gracefully.' },
                    { start: 10.0, text: 'VP9 at 4K keeps files remarkably compact.' },
                    { start: 13.5, text: 'Muxing four gigabytes takes seconds, not minutes.' },
                    { start: 16.5, text: 'Power efficiency: stream copy, never re-encode.' },
                ],
            },
            {
                lang: 'es',
                name: 'Spanish',
                lines: [
                    { start: 0.2, text: 'Campos de degradado de alta resolución.' },
                    { start: 3.0, text: 'Esta entrada del catálogo llega hasta 2160p (4K).' },
                    { start: 6.5, text: 'Selecciona cualquier calidad — el motor ajusta con elegancia.' },
                    { start: 10.0, text: 'VP9 en 4K mantiene los archivos compactos.' },
                    { start: 13.5, text: 'Multiplexar toma segundos, no minutos.' },
                    { start: 16.5, text: 'Eficiencia: copia de flujo, nunca recodificación.' },
                ],
            },
            {
                lang: 'en',
                auto: true,
                name: 'English (auto-generated)',
                lines: [
                    { start: 0.1, text: 'high resolution gradient fields' },
                    { start: 2.9, text: 'this catalog entry reaches up to 2160p' },
                    { start: 6.4, text: 'select any quality the engine clamps' },
                    { start: 7.8, text: 'gracefully' },
                    { start: 9.9, text: 'vp9 at 4k keeps files remarkably' },
                    { start: 11.2, text: 'compact' },
                    { start: 13.4, text: 'muxing takes seconds not minutes' },
                    { start: 16.4, text: 'power efficiency stream copy never re-encode' },
                ],
            },
        ],
    },
    {
        id: 'YtdlDemoV03',
        title: 'Engine Test — Classic Bars (Audio Focus)',
        author: 'YTubeDL Demo Lab',
        durationSec: 25,
        source: 'testsrc',
        formats: [
            { itag: 134, kind: 'video', codec: 'h264', w: 640, h: 360, fps: 30, bitrateKbps: 500, ext: 'mp4', crf: 28 },
            { itag: 136, kind: 'video', codec: 'h264', w: 1280, h: 720, fps: 30, bitrateKbps: 1500, ext: 'mp4', crf: 26 },
            { itag: 140, kind: 'audio', codec: 'aac', bitrateKbps: 128, ext: 'm4a' },
            { itag: 250, kind: 'audio', codec: 'opus', bitrateKbps: 70, ext: 'webm' },
            { itag: 251, kind: 'audio', codec: 'opus', bitrateKbps: 135, ext: 'webm' },
        ],
        captions: [
            {
                lang: 'en',
                name: 'English',
                lines: [
                    { start: 0.2, text: 'Audio-focused test entry.' },
                    { start: 3.5, text: 'Two Opus bitrates and one AAC track are offered.' },
                    { start: 7.0, text: 'Extract audio to MP3, WAV, FLAC or OGG.' },
                    { start: 10.5, text: 'Matching source codecs are stream-copied — instant.' },
                    { start: 14.0, text: 'MP3 gains embedded cover art automatically.' },
                    { start: 17.5, text: 'The arpeggio tone helps catch encoding artifacts.' },
                    { start: 21.0, text: 'End of the test suite — happy downloading.' },
                ],
            },
            {
                lang: 'en',
                auto: true,
                name: 'English (auto-generated)',
                lines: [
                    { start: 0.1, text: 'audio focused test entry' },
                    { start: 3.4, text: 'two opus bitrates and one aac track are' },
                    { start: 4.9, text: 'offered' },
                    { start: 6.9, text: 'extract audio to mp3 wav flac or ogg' },
                    { start: 10.4, text: 'matching source codecs are stream copied' },
                    { start: 13.9, text: 'instant' },
                    { start: 16.9, text: 'mp3 gains embedded cover art automatically' },
                    { start: 20.9, text: 'end of the test suite happy downloading' },
                ],
            },
        ],
    },
];
export const DEMO_PLAYLISTS = [
    {
        id: 'PLytdlDemo001',
        title: 'YTubeDL Engine Test Suite',
        videoIds: ['YtdlDemoV01', 'YtdlDemoV02', 'YtdlDemoV03'],
    },
];
export const demoState = { ready: false, progress: 0, detail: 'not started' };
const AUDIO_EXPR = (d) => `aevalsrc=0.2*(sin(2*PI*220*t)*exp(-2*mod(t\\,1))+0.5*sin(2*PI*440*t)*exp(-2*mod(t+0.5\\,1))):s=44100:d=${d}`;
function streamPath(videoId, f) {
    return join(demoDir(), videoId, `itag-${f.itag}.${f.ext}`);
}
export function demoThumbPath(videoId) {
    return join(demoDir(), `thumb-${videoId}.jpg`);
}
function drawtextArgs(v, f) {
    const label = `${f.h}p${(f.fps ?? 30) > 30 ? f.fps : ''} - ${f.codec.toUpperCase()}`;
    const title = v.title.replace(/[—–]/g, '-').replace(/['":;,%]/g, '');
    const fs = Math.max(14, Math.round((f.h ?? 360) / 16));
    const fs2 = Math.max(12, Math.round((f.h ?? 360) / 22));
    const vf = `drawtext=fontfile=${FONT}:text='YTubeDL DEMO - ${title}'` +
        ':fontcolor=white:box=1:boxcolor=black@0.45:boxborderw=10' +
        `:fontsize=${fs2}:x=(w-tw)/2:y=24` +
        `,drawtext=fontfile=${FONT}:text='${label} - %{pts\\:hms}'` +
        ':fontcolor=white@0.9:box=1:boxcolor=black@0.45:boxborderw=8' +
        `:fontsize=${fs}:x=(w-tw)/2:y=h-th-28`;
    return ['-vf', vf];
}
/** Codec args, or null when this ffmpeg build lacks the required encoder. */
function codecArgs(f) {
    const enc = availableEncoders();
    switch (f.codec) {
        case 'h264':
            if (!enc.has('libx264'))
                return null;
            return ['-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(f.crf ?? 26), '-pix_fmt', 'yuv420p'];
        case 'vp9': {
            if (!enc.has('libvpx-vp9'))
                return null;
            // High-res VP9 uses the realtime deadline — dramatically faster, fine for demo content
            const realtime = (f.h ?? 0) >= 1440;
            return [
                '-c:v', 'libvpx-vp9', '-crf', String(f.crf ?? 34), '-b:v', '0',
                ...(realtime
                    ? ['-deadline', 'realtime', '-cpu-used', '8']
                    : ['-deadline', 'good', '-cpu-used', '8']),
                '-row-mt', '1', '-pix_fmt', 'yuv420p',
            ];
        }
        case 'av1': {
            // libsvtav1 is fastest but missing from many builds; libaom-av1 in
            // realtime usage is the portable fallback
            if (enc.has('libsvtav1')) {
                return ['-c:v', 'libsvtav1', '-preset', '12', '-crf', String(f.crf ?? 45), '-pix_fmt', 'yuv420p'];
            }
            if (enc.has('libaom-av1')) {
                return ['-c:v', 'libaom-av1', '-usage', 'realtime', '-cpu-used', '8',
                    '-crf', String(f.crf ?? 45), '-pix_fmt', 'yuv420p'];
            }
            return null;
        }
        case 'aac':
            if (!enc.has('aac'))
                return null;
            return ['-c:a', 'aac', '-b:a', `${f.bitrateKbps}k`, '-vn'];
        case 'opus':
            if (!enc.has('libopus'))
                return null;
            return ['-c:a', 'libopus', '-b:a', `${f.bitrateKbps}k`, '-vn', '-ar', '48000'];
    }
}
async function encodeFormat(v, f) {
    const out = streamPath(v.id, f);
    if (existsSync(out))
        return;
    await ensureDir(join(demoDir(), v.id));
    const args = [];
    if (f.kind === 'audio') {
        args.push('-f', 'lavfi', '-i', AUDIO_EXPR(v.durationSec));
    }
    else if (f.kind === 'progressive') {
        const enc = availableEncoders();
        if (!enc.has('libx264') || !enc.has('aac')) {
            console.warn(`[ytubedl] demo: skipping ${v.id}/${f.itag} (progressive) — encoder unavailable in this ffmpeg build`);
            return;
        }
        args.push('-f', 'lavfi', '-i', `${v.source}=size=${f.w}x${f.h}:rate=${f.fps}:duration=${v.durationSec}`, '-f', 'lavfi', '-i', AUDIO_EXPR(v.durationSec), ...drawtextArgs(v, f), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', String(f.crf ?? 27), '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', `${f.bitrateKbps - 100}k`, '-shortest');
    }
    else {
        const codec = codecArgs(f);
        if (!codec) {
            console.warn(`[ytubedl] demo: skipping ${v.id}/${f.itag} (${f.codec}) — encoder unavailable in this ffmpeg build`);
            return;
        }
        args.push('-f', 'lavfi', '-i', `${v.source}=size=${f.w}x${f.h}:rate=${f.fps}:duration=${v.durationSec}`, ...drawtextArgs(v, f), ...codec, '-an');
    }
    args.push(out);
    await runFfmpeg(args, { label: `demo ${v.id}/${f.itag}`, cwd: demoDir() });
}
async function makeThumb(v) {
    const thumb = demoThumbPath(v.id);
    if (existsSync(thumb))
        return;
    const src = streamPath(v.id, v.formats.find((f) => f.kind === 'progressive') ?? v.formats[0]);
    await runFfmpeg(['-ss', '2', '-i', src, '-frames:v', '1', '-vf', 'scale=480:-2', '-q:v', '3', thumb], { label: `demo thumb ${v.id}`, cwd: demoDir() });
}
const perVideo = new Map();
const completedVideos = new Set();
function refreshDemoState() {
    const total = DEMO_CATALOG.length;
    const done = completedVideos.size;
    if (done >= total) {
        demoState.ready = true;
        demoState.progress = 1;
        demoState.detail = 'ready';
    }
    else {
        demoState.ready = false;
        demoState.progress = done / total;
        demoState.detail = `generating (${done}/${total} videos ready)`;
    }
}
function generateVideo(v) {
    const p = (async () => {
        for (const f of v.formats) {
            await encodeFormat(v, f);
        }
        await makeThumb(v);
        completedVideos.add(v.id);
        refreshDemoState();
    })().catch((e) => {
        demoState.error = e instanceof Error ? e.message : String(e);
        demoState.detail = 'generation failed';
        perVideo.delete(v.id); // allow retry
        throw e;
    });
    return p;
}
/**
 * Ensure demo media exists. Pass a videoId to generate only that video
 * (fast first probe); omit it to generate the whole catalog (boot).
 */
export function ensureDemoMedia(videoId) {
    const targets = videoId ? DEMO_CATALOG.filter((v) => v.id === videoId) : DEMO_CATALOG;
    if (!targets.length)
        return Promise.resolve();
    refreshDemoState();
    const jobs = targets.map((v) => {
        let p = perVideo.get(v.id);
        if (!p) {
            p = generateVideo(v);
            perVideo.set(v.id, p);
        }
        return p;
    });
    return Promise.all(jobs).then(() => undefined);
}
/* ---------------------------- json3 captions ------------------------- */
function captionToJson3(track, durationSec) {
    const events = [{ tStartMs: 0, segs: [{ utf8: '\n' }] }];
    const sorted = track.lines.slice().sort((a, b) => a.start - b.start);
    sorted.forEach((line, i) => {
        const nextStart = sorted[i + 1]?.start ?? durationSec;
        const startMs = Math.round(line.start * 1000);
        let durMs = Math.round((Math.min(nextStart, line.start + 6) - line.start) * 1000);
        if (!Number.isFinite(durMs) || durMs <= 0)
            durMs = 2500;
        if (track.auto) {
            // ASR quirks: word segments with inline <c> tags, occasionally missing duration
            const words = line.text.split(' ');
            const segs = words.map((w, j) => ({
                utf8: j === 0 ? `<c> ${w}</c>` : ` ${w}`,
                tOffsetMs: j * 210,
            }));
            const ev = { tStartMs: startMs, segs };
            if (i % 3 !== 2)
                ev.dDurationMs = durMs; // some events lack durations
            events.push(ev);
        }
        else {
            events.push({ tStartMs: startMs, dDurationMs: durMs, segs: [{ utf8: line.text }] });
        }
    });
    return JSON.stringify({ events });
}
/* ---------------------------- origin server -------------------------- */
let originServer = null;
let originPort = 0;
async function originHandler(req) {
    const url = new URL(req.url);
    const parts = url.pathname.split('/').filter(Boolean);
    if (req.method === 'GET' && parts[0] === 'stream' && parts.length === 3) {
        const video = DEMO_CATALOG.find((v) => v.id === parts[1]);
        const fmt = video?.formats.find((f) => String(f.itag) === parts[2]);
        if (!video || !fmt)
            return jsonError(404, 'no such demo stream');
        const path = streamPath(video.id, fmt);
        if (!existsSync(path))
            return jsonError(503, 'demo media not generated yet');
        const mime = fmt.ext === 'mp4' ? 'video/mp4' : fmt.ext === 'webm' ? 'video/webm' : 'audio/mp4';
        if (fmt.kind === 'audio' && fmt.ext === 'm4a') {
            return serveFileResponse(req, path, { mime: 'audio/mp4' });
        }
        if (fmt.kind === 'audio' && fmt.ext === 'webm') {
            return serveFileResponse(req, path, { mime: 'audio/webm' });
        }
        return serveFileResponse(req, path, { mime });
    }
    if (req.method === 'GET' && parts[0] === 'caption' && parts.length === 3) {
        const video = DEMO_CATALOG.find((v) => v.id === parts[1]);
        const trackId = parts[2];
        const track = video?.captions.find((c) => (c.auto ? `${c.lang}-auto` : c.lang) === trackId);
        if (!video || !track)
            return jsonError(404, 'no such caption track');
        return new Response(captionToJson3(track, video.durationSec), {
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
    }
    if (req.method === 'GET' && url.pathname === '/health') {
        return Response.json({ ok: true, ready: demoState.ready });
    }
    return jsonError(404, 'not found');
}
/**
 * Start the demo origin on 127.0.0.1. Uses `YTUBEDL_DEMO_PORT` when set,
 * otherwise an OS-assigned ephemeral port — never collides with anything.
 */
export function startDemoOrigin() {
    if (originServer)
        return Promise.resolve();
    return new Promise((resolve, reject) => {
        const server = createServer((nodeReq, nodeRes) => {
            nodeRequestToWeb(nodeReq)
                .then(originHandler)
                .catch((e) => jsonError(500, e instanceof Error ? e.message : 'demo origin error'))
                .then((webRes) => sendWebResponse(nodeRes, webRes))
                .catch(() => nodeRes.destroy());
        });
        server.on('error', (e) => {
            if (e.code === 'EADDRINUSE' && demoOriginPort() !== 0) {
                // Requested port busy → fall back to an ephemeral port
                server.listen(0, '127.0.0.1', () => {
                    originServer = server;
                    originPort = server.address().port;
                    resolve();
                });
                return;
            }
            reject(e);
        });
        server.listen(demoOriginPort(), '127.0.0.1', () => {
            originServer = server;
            originPort = server.address().port;
            console.log(`[ytubedl] demo origin listening on 127.0.0.1:${originPort}`);
            resolve();
        });
    });
}
export function demoStreamUrl(videoId, itag) {
    return `http://127.0.0.1:${originPort}/stream/${videoId}/${itag}`;
}
export function demoCaptionUrl(videoId, trackId) {
    return `http://127.0.0.1:${originPort}/caption/${videoId}/${encodeURIComponent(trackId)}`;
}
