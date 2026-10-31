const EXT_MIME = {
    mp4: { mime: 'video/mp4', video: true },
    m4v: { mime: 'video/mp4', video: true },
    webm: { mime: 'video/webm', video: true },
    mkv: { mime: 'video/x-matroska', video: true },
    mov: { mime: 'video/quicktime', video: true },
    avi: { mime: 'video/x-msvideo', video: true },
    '3gp': { mime: 'video/3gpp', video: true },
    m4a: { mime: 'audio/mp4', video: false },
    opus: { mime: 'audio/opus', video: false },
    mp3: { mime: 'audio/mpeg', video: false },
    wav: { mime: 'audio/wav', video: false },
    flac: { mime: 'audio/flac', video: false },
    ogg: { mime: 'audio/ogg', video: false },
    aac: { mime: 'audio/aac', video: false },
};
export class DirectProvider {
    name = 'direct';
    async probe(url, opts) {
        const res = await fetch(url, {
            headers: { Range: 'bytes=0-1', 'User-Agent': 'YTubeDL-Engine/1.0' },
            signal: opts?.signal,
        });
        if (!res.ok && res.status !== 206) {
            throw new Error(`URL unreachable (HTTP ${res.status})`);
        }
        const contentType = res.headers.get('content-type')?.split(';')[0] ?? '';
        const cr = res.headers.get('content-range');
        const size = cr ? Number(cr.split('/')[1]) : Number(res.headers.get('content-length') ?? NaN);
        await res.body?.cancel().catch(() => { });
        let pathname = url;
        try {
            pathname = new URL(url).pathname;
        }
        catch {
            /* keep raw */
        }
        const ext = (pathname.split('.').pop() ?? '').toLowerCase();
        const known = EXT_MIME[ext];
        const isVideo = known?.video ?? contentType.startsWith('video/') ?? /octet-stream/.test(contentType);
        const fileName = decodeURIComponent(pathname.split('/').pop() || 'download');
        if (!known && !/^(video|audio|application\/octet-stream)/.test(contentType)) {
            throw new Error(`Not a media URL (content-type ${contentType || 'unknown'}). ` +
                'Supported: direct links to mp4/webm/mkv/mp3/m4a/opus/wav/flac/ogg files.');
        }
        const media = {
            id: `direct-${Buffer.from(fileName).toString('base64url').slice(0, 16)}`,
            url,
            title: fileName.replace(/\.[a-z0-9]+$/i, ''),
            author: new URL(url).hostname,
            durationSec: undefined,
            thumbnail: undefined,
            isLive: false,
            videoFormats: isVideo
                ? [
                    {
                        itag: -1,
                        label: 'original',
                        codec: 'source',
                        codecFamily: 'other',
                        container: (ext === 'webm' ? 'webm' : ext === 'mkv' ? 'webm' : 'mp4'),
                        bitrate: 0,
                        sizeBytes: Number.isFinite(size) ? size : undefined,
                        hasAudio: true,
                    },
                ]
                : [],
            audioFormats: isVideo
                ? []
                : [
                    {
                        itag: -1,
                        codec: ext === 'm4a' || ext === 'aac' ? 'aac' : 'opus',
                        container: ext === 'm4a' || ext === 'aac' ? 'm4a' : 'webm',
                        bitrate: 0,
                        sizeBytes: Number.isFinite(size) ? size : undefined,
                        sampleRate: undefined,
                        channels: undefined,
                    },
                ],
            subtitleTracks: [],
            qualities: isVideo ? ['original'] : [],
            source: 'direct',
            note: 'Direct media URL — single available stream',
        };
        return {
            media,
            streams: new Map([[-1, { url, sizeBytes: Number.isFinite(size) ? size : undefined }]]),
            captions: new Map(),
        };
    }
}
