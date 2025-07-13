import HLS from "hls-parser";
import { env } from "../../config.js";
import { merge } from '../../misc/utils.js';

const resolutionMatch = {
    "3840": 2160,
    "2732": 1440,
    "2560": 1440,
    "2048": 1080,
    "1920": 1080,
    "1366": 720,
    "1280": 720,
    "960": 480,
    "640": 360,
    "426": 240
}

const genericHeaders = {
    Accept: 'application/vnd.vimeo.*+json; version=3.4.10',
    'User-Agent': 'com.vimeo.android.videoapp (Google, Pixel 7a, google, Android 16/36 Version 11.8.1) Kotlin VimeoNetworking/3.12.0',
    Authorization: 'Basic NzRmYTg5YjgxMWExY2JiNzUwZDg1MjhkMTYzZjQ4YWYyOGEyZGJlMTp4OGx2NFd3QnNvY1lkamI2UVZsdjdDYlNwSDUrdm50YzdNNThvWDcwN1JrenJGZC9tR1lReUNlRjRSVklZeWhYZVpRS0tBcU9YYzRoTGY2Z1dlVkJFYkdJc0dMRHpoZWFZbU0reDRqZ1dkZ1diZmdIdGUrNUM5RVBySlM0VG1qcw==',
    'Accept-Language': 'en',
}

let bearer = '';

const getBearer = async (refresh = false) => {
    if (bearer && !refresh) return bearer;

    const oauthResponse = await fetch(
        'https://api.vimeo.com/oauth/authorize/client',
        {
            method: 'POST',
            body: new URLSearchParams({
                scope: 'private public create edit delete interact upload purchased stats',
                grant_type: 'client_credentials',
            }).toString(),
            headers: {
                ...genericHeaders,
                'Content-Type': 'application/x-www-form-urlencoded',
            }
        }
    )
    .then(a => a.json())
    .catch(() => {});

    if (!oauthResponse || !oauthResponse.access_token) {
        return;
    }

    return bearer = oauthResponse.access_token;
}

const requestApiInfo = (bearerToken, videoId, password) => {
    if (password) {
        videoId += `:${password}`
    }

    return fetch(
        `https://api.vimeo.com/videos/${videoId}`,
        {
            headers: {
                ...genericHeaders,
                Authorization: `Bearer ${bearerToken}`,
            }
        }
    )
    .then(a => a.json())
    .catch(() => {});
}

const compareQuality = (rendition, requestedQuality) => {
    const quality = parseInt(rendition);
    return Math.abs(quality - requestedQuality);
}

const getDirectLink = async (data, quality, subtitleLang) => {
    if (!data.files) return;

    const match = data.files
        .filter(f => f.rendition?.endsWith('p'))
        .reduce((prev, next) => {
            const delta = {
                prev: compareQuality(prev.rendition, quality),
                next: compareQuality(next.rendition, quality)
            };

            return delta.prev < delta.next ? prev : next;
        });

    if (!match) return;

    let subtitles;
    if (subtitleLang && data.config_url) {
        const config = await fetch(data.config_url)
                    .then(r => r.json())
                    .catch(() => {});

        if (config && config.request?.text_tracks?.length) {
            subtitles = config.request.text_tracks.find(
                t => t.lang.startsWith(subtitleLang)
            );
            subtitles = new URL(subtitles.url, "https://player.vimeo.com/").toString();
        }
    }

    return {
        urls: match.link,
        subtitles,
        filenameAttributes: {
            resolution: `${match.width}x${match.height}`,
            qualityLabel: match.rendition,
            extension: "mp4"
        },
        bestAudio: "mp3",
    }
}

const getHLS = async (configURL, obj) => {
    if (!configURL) return;

    const api = await fetch(configURL)
                    .then(r => r.json())
                    .catch(() => {});
    if (!api) return { error: "fetch.fail" };

    if (api.video?.duration > env.durationLimit) {
        return { error: "content.too_long" };
    }

    const urlMasterHLS = api.request?.files?.hls?.cdns?.akfire_interconnect_quic?.url;
    if (!urlMasterHLS) return { error: "fetch.fail" };

    const masterHLS = await fetch(urlMasterHLS)
                            .then(r => r.text())
                            .catch(() => {});

    if (!masterHLS) return { error: "fetch.fail" };

    const variants = HLS.parse(masterHLS)?.variants?.sort(
        (a, b) => Number(b.bandwidth) - Number(a.bandwidth)
    );
    if (!variants || variants.length === 0) return { error: "fetch.empty" };

    let bestQuality;

    if (obj.quality < resolutionMatch[variants[0]?.resolution?.width]) {
        bestQuality = variants.find(v =>
            (obj.quality === resolutionMatch[v.resolution.width])
        );
    }

    if (!bestQuality) bestQuality = variants[0];

    const expandLink = (path) => {
        return new URL(path, urlMasterHLS).toString();
    };

    let urls = expandLink(bestQuality.uri);

    const audioPath = bestQuality?.audio[0]?.uri;
    if (audioPath) {
        urls = [
            urls,
            expandLink(audioPath)
        ]
    } else if (obj.isAudioOnly) {
        return { error: "fetch.empty" };
    }

    return {
        urls,
        isHLS: true,
        filenameAttributes: {
            resolution: `${bestQuality.resolution.width}x${bestQuality.resolution.height}`,
            qualityLabel: `${resolutionMatch[bestQuality.resolution.width]}p`,
            extension: "mp4"
        },
        bestAudio: "mp3",
    }
}

export default async function(obj) {
    let quality = obj.quality === "max" ? 9000 : Number(obj.quality);
    if (quality < 240) quality = 240;
    if (!quality || obj.isAudioOnly) quality = 9000;

    const bearerToken = await getBearer();
    if (!bearerToken) {
        return { error: "fetch.fail" };
    }

    let info = await requestApiInfo(bearerToken, obj.id, obj.password);
    let response;

    // auth error, try to refresh the token
    if (info?.error_code === 8003) {
        const newBearer = await getBearer(true);
        if (!newBearer) {
            return { error: "fetch.fail" };
        }
        info = await requestApiInfo(newBearer, obj.id, obj.password);
    }

    // if there's still no info, then return a generic error
    if (!info || info.error_code) {
        return { error: "fetch.empty" };
    }

    if (obj.isAudioOnly) {
        response = await getHLS(info.config_url, { ...obj, quality });
    }

    if (!response) response = await getDirectLink(info, quality, obj.subtitleLang);
    if (!response) response = { error: "fetch.empty" };

    if (response.error) {
        return response;
    }

    const fileMetadata = {
        title: info.name,
        artist: info.user.name,
    };

    if (response.subtitles) {
        fileMetadata.sublanguage = obj.subtitleLang;
    }

    return merge(
        {
            fileMetadata,
            filenameAttributes: {
                service: "vimeo",
                id: obj.id,
                title: fileMetadata.title,
                author: fileMetadata.artist,
            }
        },
        response
    );
}
