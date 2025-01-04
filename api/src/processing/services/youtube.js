import youtubedl from 'youtube-dl-exec';
import { env } from '../../config.js';
import * as fs from 'fs';

const videoQualities = [144, 240, 360, 480, 720, 1080, 1440, 2160, 4320];

const codecList = {
    h264: {
        videoCodec: "avc1",
        audioCodec: "mp4a",
        container: "mp4"
    },
    av1: {
        videoCodec: "av01",
        audioCodec: "opus",
        container: "webm"
    },
    vp9: {
        videoCodec: "vp9",
        audioCodec: "opus",
        container: "webm"
    }
};

const hlsCodecList = {
    h264: {
        videoCodec: "avc1",
        audioCodec: "mp4a",
        container: "mp4"
    },
    vp9: {
        videoCodec: "vp09",
        audioCodec: "mp4a",
        container: "webm"
    }
};

export default async function(o) {
    let useHLS = o.youtubeHLS;

    if (useHLS && o.format === "av1") {
        useHLS = false;
    }

    const quality = o.quality === "max" ? 9000 : Number(o.quality);

    const normalizeQuality = res => {
        const shortestSide = res.height > res.width ? res.width : res.height;
        return videoQualities.find(qual => qual >= shortestSide);
    };

    let codec = o.format || "h264";

    try {
        const output = await youtubedl(`https://www.youtube.com/watch?v=${o.id}`, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            addHeader: [
                'referer:youtube.com',
                'user-agent:googlebot'
            ],
            downloader: 'ffmpeg',
            hlsUseMpegts: true,
            //getUrl: true,
        });

        const { is_live, duration, formats, title } = output;

        if (is_live) {
            return { error: "content.video.live" };
        }

        if (duration > env.durationLimit) {
            return { error: "content.too_long" };
        }

        if (formats.length === 0) {
            return { error: "youtube.no_matching_format" };
        }

        const matchHlsCodec = codecs => (
            codecs.includes(hlsCodecList[codec]?.videoCodec || codecList.h264.videoCodec)
        );

        const variants = formats.map(format => ({
            url: format.url,
            codecs: format.vcodec,
            resolution: { width: format.width, height: format.height }
        }));

        const best = variants.find(i => matchHlsCodec(i.codecs));

        const preferred = variants.find(i =>
            matchHlsCodec(i.codecs) && normalizeQuality(i.resolution) === quality
        );

        let selected = preferred || best;

        if (!selected) {
            codec = "h264";
            selected = variants.find(i => matchHlsCodec(i.codecs));
        }

        if (!selected) {
            return { error: "youtube.no_matching_format" };
        }

        // download
        // youtubedl(selected.url, {
        //     output: `${title}.${hlsCodecList[codec]?.container || 'mp4'}`,
        //     format: 'best'
        // });

        return {
            type: "video",
            urls: [selected.url],
            filenameAttributes: {
                service: 'youtube',
                title: title,
                id: o.id,
                extension: hlsCodecList[codec]?.container || 'mp4'
            },
            fileMetadata: {
                codecs: selected.codecs,
                resolution: selected.resolution
            },
            isHLS: false,
        };
    } catch (e) {
        console.error(e);

        if (e.message.includes("This video is unavailable")) {
            return { error: "content.video.unavailable" };
        }

        if (e.message.includes("Private video")) {
            return { error: "content.video.private" };
        }

        if (e.message.includes("age verification")) {
            return { error: "content.video.age" };
        }

        return { error: "fetch.fail" };
    }
}
