/**
 * YTubeDL Engine — demo provider (local origin).
 *
 * Maps the demo catalog into MediaInfo + stream references pointing at the
 * local origin server. All sizes are REAL (read from generated files), so the
 * UI, downloader and progress reporting behave exactly as with YouTube.
 */
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { demoDir } from '../config.js';
import { DEMO_CATALOG, DEMO_PLAYLISTS, demoStreamUrl, demoCaptionUrl, demoState, ensureDemoMedia, } from '../demo-origin.js';
export class DemoProvider {
    name = 'demo';
    async probe(url, _opts) {
        const id = url.match(/v=([A-Za-z0-9_-]{11})/)?.[1] ?? '';
        const video = DEMO_CATALOG.find((v) => v.id === id);
        if (!video)
            throw new Error('Unknown demo video id');
        // Lazy per-video generation: probing one video never waits for the others
        await ensureDemoMedia(video.id);
        const streams = new Map();
        const videoFormats = [];
        const audioFormats = [];
        for (const f of video.formats) {
            const path = join(demoDir(), video.id, `itag-${f.itag}.${f.ext}`);
            const size = existsSync(path) ? statSync(path).size : undefined;
            if (f.kind === 'audio') {
                audioFormats.push({
                    itag: f.itag,
                    codec: f.codec,
                    container: f.ext === 'm4a' ? 'm4a' : 'webm',
                    bitrate: f.bitrateKbps * 1000,
                    sizeBytes: size,
                    sampleRate: f.codec === 'opus' ? 48000 : 44100,
                    channels: 2,
                });
            }
            else {
                const label = `${f.h}p${(f.fps ?? 30) > 30 ? f.fps : ''}`;
                videoFormats.push({
                    itag: f.itag,
                    label,
                    width: f.w,
                    height: f.h,
                    fps: f.fps,
                    codec: f.codec === 'h264'
                        ? 'avc1.640028'
                        : f.codec === 'vp9'
                            ? 'vp9'
                            : 'av01.0.08M.08',
                    codecFamily: f.codec,
                    container: f.ext === 'webm' ? 'webm' : 'mp4',
                    bitrate: f.bitrateKbps * 1000,
                    sizeBytes: size,
                    hasAudio: f.kind === 'progressive',
                });
            }
            streams.set(f.itag, { url: demoStreamUrl(video.id, f.itag), sizeBytes: size });
        }
        // Best-first ordering: resolution, then fps, then bitrate
        videoFormats.sort((a, b) => (b.height ?? 0) - (a.height ?? 0) ||
            (b.fps ?? 0) - (a.fps ?? 0) ||
            b.bitrate - a.bitrate);
        audioFormats.sort((a, b) => b.bitrate - a.bitrate);
        const qualities = [...new Set(videoFormats.map((f) => f.label))];
        const subtitleTracks = [];
        const captions = new Map();
        for (const c of video.captions) {
            const tid = c.auto ? `${c.lang}-auto` : c.lang;
            subtitleTracks.push({ id: tid, languageCode: c.lang, name: c.name, auto: !!c.auto });
            captions.set(tid, demoCaptionUrl(video.id, tid));
        }
        const media = {
            id: video.id,
            url: `https://demo.local/watch?v=${video.id}`,
            title: video.title,
            author: video.author,
            durationSec: video.durationSec,
            thumbnail: `/api/demo/thumb/${video.id}.jpg`,
            viewCount: 12_500 + video.formats.length * 1000,
            isLive: false,
            videoFormats,
            audioFormats,
            subtitleTracks,
            qualities,
            source: 'demo',
        };
        return { media, streams, captions };
    }
}
export function demoPlaylist(playlistId) {
    const pl = DEMO_PLAYLISTS.find((p) => p.id === playlistId);
    if (!pl)
        throw new Error('Unknown demo playlist id');
    return {
        id: pl.id,
        title: pl.title,
        videos: pl.videoIds.map((vid) => {
            const v = DEMO_CATALOG.find((x) => x.id === vid);
            return { id: v.id, title: v.title, durationSec: v.durationSec, author: v.author };
        }),
    };
}
export { demoState };
