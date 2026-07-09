import { env, genericUserAgent } from "../../config.js";
import { resolveRedirectingURL } from "../url.js";

// TO-DO: higher quality downloads (currently requires an account)

const BILIBILI_HEADERS = {
    "user-agent": genericUserAgent,
    "accept": "application/json, text/plain, */*",
    "accept-language": "en-US,en;q=0.9",
    "referer": "https://www.bilibili.com/",
    "origin": "https://www.bilibili.com",
};

function getBest(content) {
    return content?.filter(v => v.baseUrl || v.url)
                .map(v => (v.baseUrl = v.baseUrl || v.url, v))
                .reduce((a, b) => a?.bandwidth > b?.bandwidth ? a : b);
}

function extractBestQuality(dashData) {
    const bestVideo = getBest(dashData.video),
          bestAudio = getBest(dashData.audio);

    if (!bestVideo || !bestAudio) return [];
    return [ bestVideo, bestAudio ];
}

async function getVideoInfo(bvid) {
    const url = new URL('https://api.bilibili.com/x/web-interface/view');
    url.searchParams.set('bvid', bvid);

    const json = await fetch(url, {
        headers: BILIBILI_HEADERS,
    })
    .then(r => r.json())
    .catch(() => {});

    if (!json || json.code !== 0 || !json?.data) {
        return { error: "fetch.fail" };
    }

    const data = json.data;
    return {
        aid: data.aid,
        bvid: data.bvid,
        title: data.title,
        duration: data.duration,
        pages: data.pages?.map(p => ({
            cid: p.cid,
            page: p.page,
            part: p.part,
            duration: p.duration,
        })) || [],
    };
}

async function getPlayinfo(bvid, cid) {
    const url = new URL('https://api.bilibili.com/x/player/playurl');
    url.searchParams.set('bvid', bvid);
    url.searchParams.set('cid', cid);
    url.searchParams.set('fnval', '16');
    url.searchParams.set('fnver', '0');
    url.searchParams.set('qn', '64');

    const json = await fetch(url, {
        headers: BILIBILI_HEADERS,
    })
    .then(r => r.json())
    .catch(() => {});

    if (!json || json.code !== 0 || !json?.data?.dash) {
        return { error: "fetch.empty" };
    }

    return { streamData: json.data };
}

async function com_download(id, partId) {
    const info = await getVideoInfo(id);
    if (info.error) return { error: info.error };

    if (!info.pages?.length) {
        return { error: "fetch.empty" };
    }

    const targetPage = partId
        ? info.pages.find(p => String(p.page) === String(partId))
        : info.pages[0];

    if (!targetPage) {
        return { error: "content.video.unavailable" };
    }

    const playinfo = await getPlayinfo(id, targetPage.cid);
    if (playinfo.error) return { error: playinfo.error };

    const { streamData } = playinfo;

    if (streamData.timelength > env.durationLimit * 1000) {
        return { error: "content.too_long" };
    }

    const [ video, audio ] = extractBestQuality(streamData.dash);
    if (!video || !audio) {
        return { error: "fetch.empty" };
    }

    let filenameBase = `bilibili_${id}`;
    if (partId) {
        filenameBase += `_${partId}`;
    }

    return {
        urls: [video.baseUrl, audio.baseUrl],
        audioFilename: `${filenameBase}_audio`,
        filename: `${filenameBase}_${video.width}x${video.height}.mp4`,
        headers: BILIBILI_HEADERS,
    };
}

async function tv_download(id) {
    const url = new URL(
        'https://api.bilibili.tv/intl/gateway/web/playurl'
        + '?s_locale=en_US&platform=web&qn=64&type=0&device=wap'
        + '&tf=0&spm_id=bstar-web.ugc-video-detail.0.0&from_spm_id='
    );

    url.searchParams.set('aid', id);

    const { data } = await fetch(url).then(a => a.json());
    if (!data?.playurl?.video) {
        return { error: "fetch.empty" };
    }

    const [ video, audio ] = extractBestQuality({
        video: data.playurl.video.map(s => s.video_resource)
                                 .filter(s => s.codecs.includes('avc1')),
        audio: data.playurl.audio_resource
    });

    if (!video || !audio) {
        return { error: "fetch.empty" };
    }

    if (video.duration > env.durationLimit * 1000) {
        return { error: "content.too_long" };
    }

    return {
        urls: [video.url, audio.url],
        audioFilename: `bilibili_tv_${id}_audio`,
        filename: `bilibili_tv_${id}.mp4`
    };
}

export default async function({ comId, tvId, comShortLink, partId }) {
    if (comShortLink) {
        const patternMatch = await resolveRedirectingURL(`https://b23.tv/${comShortLink}`);
        comId = patternMatch?.comId;
    }

    if (comId) {
        return com_download(comId, partId);
    } else if (tvId) {
        return tv_download(tvId);
    }

    return { error: "fetch.fail" };
}
