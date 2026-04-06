import { env } from "../../config.js";

const resolutions = ["2160", "1440", "1080", "720", "480", "360", "240", "144"];

const authUrl = "https://api.vk.ru/method/auth.getAnonymToken";
const videoApiUrl = "https://api.vkvideo.ru/method/video.get";

const clientId = "51552953";
const clientSecret = "qgr0yWwXCrsxA1jnRtRX";
const clientVersion = "5.274";

// used in stream/shared.js for accessing media files
export const vkClientAgent = "com.vk.vkvideo.prod/1955 (iPhone, iOS 16.7.15, iPhone10,4, Scale/2.0) SAK/1.135";

const cachedToken = {
    token: "",
    expiry: 0,
    device_id: "",
};

const getToken = async () => {
    if (cachedToken.expiry - 10 > Math.floor(new Date().getTime() / 1000)) {
        return cachedToken.token;
    }

    const randomDeviceId = crypto.randomUUID().toUpperCase();

    const anonymOauth = new URL(authUrl);
    anonymOauth.searchParams.set("client_id", clientId);
    anonymOauth.searchParams.set("client_secret", clientSecret);
    anonymOauth.searchParams.set("device_id", randomDeviceId);
    anonymOauth.searchParams.set("v", clientVersion);

    const oauthResponse = await fetch(anonymOauth.toString(), {
        headers: {
            "user-agent": vkClientAgent,
        }
    }).then(r => {
        if (r.status === 200) {
            return r.json();
        }
    });

    if (!oauthResponse || !oauthResponse.response) return;

    const res = oauthResponse.response;

    if (res.token && res.expired_at && typeof res.expired_at === "number") {
        cachedToken.token = res.token;
        cachedToken.expiry = res.expired_at;
        cachedToken.device_id = randomDeviceId;
    }

    if (!cachedToken.token) return;

    return cachedToken.token;
}

const getVideo = async (ownerId, videoId, accessKey) => {
    const video = await fetch(videoApiUrl, {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf-8",
            "user-agent": vkClientAgent,
        },
        body: new URLSearchParams({
            anonymous_token: cachedToken.token,
            device_id: cachedToken.device_id,
            lang: "en",
            v: clientVersion,
            videos: `${ownerId}_${videoId}${accessKey ? `_${accessKey}` : ''}`
        }).toString()
    })
    .then(r => {
        if (r.status === 200) {
            return r.json();
        }
    });

    return video;
}

export default async function ({ ownerId, videoId, accessKey, quality, subtitleLang }) {
    const token = await getToken();
    if (!token) return { error: "fetch.fail" };

    const videoGet = await getVideo(ownerId, videoId, accessKey);

    if (!videoGet || !videoGet.response || videoGet.response.items.length !== 1) {
        return { error: "fetch.empty" };
    }

    const video = videoGet.response.items[0];

    if (video.restriction) {
        const title = video.restriction.title;
        if (title.endsWith("country") || title.endsWith("region.")) {
            return { error: "content.video.region" };
        }
        if (title === "Processing video") {
            return { error: "fetch.empty" };
        }
        return { error: "content.video.unavailable" };
    }

    if (!video.files || !video.duration) {
        return { error: "fetch.fail" };
    }

    if (video.duration > env.durationLimit) {
        return { error: "content.too_long" };
    }

    const userQuality = quality === "max" ? resolutions[0] : quality;
    let pickedQuality;

    for (const resolution of resolutions) {
        if (video.files[`mp4_${resolution}`] && +resolution <= +userQuality) {
            pickedQuality = resolution;
            break
        }
    }

    const url = video.files[`mp4_${pickedQuality}`];

    if (!url) return { error: "fetch.fail" };

    const fileMetadata = {
        title: video.title.trim(),
    }

    let subtitles;
    if (subtitleLang && video.subtitles?.length) {
        const subtitle = video.subtitles.find(
            s => s.title.endsWith(".vtt") && s.lang.startsWith(subtitleLang)
        );
        if (subtitle) {
            subtitles = subtitle.url;
            fileMetadata.sublanguage = subtitleLang;
        }
    }

    return {
        urls: url,
        subtitles,
        fileMetadata,
        filenameAttributes: {
            service: "vk",
            id: `${ownerId}_${videoId}${accessKey ? `_${accessKey}` : ''}`,
            title: fileMetadata.title,
            resolution: `${pickedQuality}p`,
            qualityLabel: `${pickedQuality}p`,
            extension: "mp4"
        }
    }
}
