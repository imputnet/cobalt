import youtubedl from 'youtube-dl-exec';
import { env } from '../../config.js';

export default async function(o) {
    try {
        const output = await youtubedl(`https://www.youtube.com/watch?v=${o.id}`, {
            dumpSingleJson: true,
            noCheckCertificates: true,
            noWarnings: true,
            addHeader: [
                'referer:youtube.com',
                'user-agent:googlebot'
            ]
        });

        const { is_live, duration, formats, title } = output;

        if (is_live) {
            return { error: "content.video.live" };
        }

        if (duration > env.durationLimit) {
            return { error: "content.too_long" };
        }

        const videoFormats = formats.filter(format => 
            format.vcodec !== 'none' && 
            format.acodec !== 'none'
        );

        if (videoFormats.length === 0) {
            return { error: "youtube.no_matching_format" };
        }

        const qualityDict = videoFormats.reduce((acc, format) => {
            const qualityLabel = format.height ? `${format.height}p` : "unknown";
            acc[qualityLabel] = {
                url: format.url,
                extension: format.ext,
                resolution: format.height ? `${format.height}p` : "unknown",
                youtubeFormat: format.ext
            };
            return acc;
        }, {});

        return {
            type: "merge",
            urls: qualityDict,
            filenameAttributes: {
                title,
            },
            fileMetadata: {},
            isHLS: true,
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
