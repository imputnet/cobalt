import { env } from "../../config.js";

const resolutions = ["2160", "1440", "1080", "720", "480", "360", "240", "144"];

const oauthUrl = "https://oauth.vk.com/oauth/get_anonym_token";
const apiUrl = "https://api.vk.com/method";

const clientId = "51552953";
const clientSecret = "qgr0yWwXCrsxA1jnRtRX";

// used in stream/shared.js for accessing media files
export const vkClientAgent = "com.vk.vkvideo.prod/822 (iPhone, iOS 16.7.7, iPhone10,4, Scale/2.0) SAK/1.119";

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

    const anonymOauth = new URL(oauthUrl);
    anonymOauth.searchParams.set("client_id", clientId);
    anonymOauth.searchParams.set("client_secret", clientSecret);
    anonymOauth.searchParams.set("device_id", randomDeviceId);

    const oauthResponse = await fetch(anonymOauth.toString(), {
        headers: {
            "user-agent": vkClientAgent,
        }
    }).then(r => {
        if (r.status === 200) {
            return r.json();
        }
    });

    if (!oauthResponse) return;

    if (oauthResponse?.token && oauthResponse?.expired_at && typeof oauthResponse?.expired_at === "number") {
        cachedToken.token = oauthResponse.token;
        cachedToken.expiry = oauthResponse.expired_at;
        cachedToken.device_id = randomDeviceId;
    }

    if (!cachedToken.token) return;

    return cachedToken.token;
}

const getVideo = async (ownerId, videoId, accessKey) => {
    const video = await fetch(`${apiUrl}/video.get`, {
        method: "POST",
        headers: {
            "content-type": "application/x-www-form-urlencoded; charset=utf-8",
            "user-agent": vkClientAgent,
        },
        body: new URLSearchParams({
            anonymous_token: cachedToken.token,
            device_id: cachedToken.device_id,
            lang: "en",
            v: "5.244",
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

export default async function ({ ownerId, videoId, accessKey, quality }) {
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

    return {
        urls: url,
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
