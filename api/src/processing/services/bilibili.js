import { env } from "../../config.js";
import { resolveRedirectingURL } from "../url.js";

// TO-DO: higher quality downloads (currently requires an account)

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

function extractStreamDataFromHTML(html) {
    const rawStreamData = html.split('<script>window.__playinfo__=')[1]?.split('</script>')[0];
    if (!rawStreamData) return;

    const data = JSON.parse(rawStreamData);
    if (data.code !== 0) return;

    return data; 
}

async function fetchStreamDataFromAPI(html) {
    // initial state has required aid and cid (bvid doesn't seem to be required)
    const initialStateHtml = html.split('<script>window.__INITIAL_STATE__=')[1]?.split(';(function()')[0];
    if (!initialStateHtml) return;
    const { aid, bvid, cid } = JSON.parse(initialStateHtml);
    
    const params = new URLSearchParams({
        aid,
        bvid,
        cid,
        fnval: 4048, // unlocks higher qualities
    })

    const playinfo = await fetch(`https://api.bilibili.com/x/player/wbi/playurl?${params.toString()}`, {
        headers: {
            "referer": `https://www.bilibili.com/video/${bvid}/`,
            "user-agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)"
        }
    }).then(r => r.json()).catch(() => {});
    if (!playinfo || playinfo.code !== 0) return;
    
    return playinfo;
}

async function com_download(id, partId) {
    const url = new URL(`https://bilibili.com/video/${id}`);

    if (partId) {
        url.searchParams.set('p', partId);
    }

    const html = await fetch(url, {
        headers: {
            "user-agent": "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        }
    })
    .then(r => r.text())
    .catch(() => {});

    if (!html) {
        return { error: "fetch.fail" }
    }

    let streamData = extractStreamDataFromHTML(html)
        ?? await fetchStreamDataFromAPI(html);

    if (!streamData) {
        return { error: "fetch.empty" };
    }

    if (streamData.data.timelength > env.durationLimit * 1000) {
        return { error: "content.too_long" };
    }

    const [ video, audio ] = extractBestQuality(streamData.data.dash);
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
