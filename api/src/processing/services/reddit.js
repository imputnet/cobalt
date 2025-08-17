import { resolveRedirectingURL } from "../url.js";
import { genericUserAgent, env } from "../../config.js";
import { getCookie, updateCookieValues } from "../cookie/manager.js";

async function getAccessToken() {
    /* "cookie" in cookiefile needs to contain:
     * client_id, client_secret, refresh_token
     * e.g. client_id=bla; client_secret=bla; refresh_token=bla
     *
     * you can get these by making a reddit app and
     * authenticating an account against reddit's oauth2 api
     * see: https://github.com/reddit-archive/reddit/wiki/OAuth2
     *
     * any additional cookie fields are managed by this code and you
     * should not touch them unless you know what you're doing. **/
    const cookie = await getCookie('reddit');
    if (!cookie) return;

    const values = cookie.values(),
          needRefresh = !values.access_token
                        || !values.expiry
                        || Number(values.expiry) < new Date().getTime();
    if (!needRefresh) return values.access_token;

    const data = await fetch('https://www.reddit.com/api/v1/access_token', {
        method: 'POST',
        headers: {
            'authorization': `Basic ${Buffer.from(
                [values.client_id, values.client_secret].join(':')
            ).toString('base64')}`,
            'content-type': 'application/x-www-form-urlencoded',
            'user-agent': genericUserAgent,
            'accept': 'application/json'
        },
        body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(values.refresh_token)}`
    }).then(r => r.json()).catch(() => {});
    if (!data) return;

    const { access_token, refresh_token, expires_in } = data;
    if (!access_token) return;

    updateCookieValues(cookie, {
        ...cookie.values(),
        access_token, refresh_token,
        expiry: new Date().getTime() + (expires_in * 1000),
    });

    return access_token;
}

export default async function(obj) {
    let params = obj;
    const accessToken = await getAccessToken();
    const headers = {
        'user-agent': genericUserAgent,
        authorization: accessToken && `Bearer ${accessToken}`,
        accept: 'application/json'
    };

    if (params.shortId) {
        params = await resolveRedirectingURL(
            `https://www.reddit.com/video/${params.shortId}`,
            obj.dispatcher, headers
        );
    }

    if (!params.id && params.shareId) {
        params = await resolveRedirectingURL(
            `https://www.reddit.com/r/${params.sub}/s/${params.shareId}`,
            obj.dispatcher, headers
        );
    }

    if (!params?.id) return { error: "fetch.short_link" };

    const url = new URL(`https://www.reddit.com/comments/${params.id}.json`);

    if (accessToken) url.hostname = 'oauth.reddit.com';

    let data = await fetch(
        url, { headers }
    ).then(r => r.json()).catch(() => {});

    if (!data || !Array.isArray(data)) {
        return { error: "fetch.fail" }
    }

    data = data[0]?.data?.children[0]?.data;

    let sourceId;
    if (params.sub || params.user) {
        sourceId = `${String(params.sub || params.user).toLowerCase()}_${params.id}`;
    } else {
        sourceId = params.id;
    }

    if (data?.url?.endsWith('.gif')) return {
        typeId: "redirect",
        urls: data.url,
        filename: `reddit_${sourceId}.gif`,
    }

    if (!data.secure_media?.reddit_video)
        return { error: "fetch.empty" };

    if (data.secure_media?.reddit_video?.duration > env.durationLimit)
        return { error: "content.too_long" };

    const video = data.secure_media?.reddit_video?.fallback_url?.split('?')[0];

    let audio = false,
        audioFileLink = `${data.secure_media?.reddit_video?.fallback_url?.split('DASH')[0]}audio`;

    if (video.match('.mp4')) {
        audioFileLink = `${video.split('_')[0]}_audio.mp4`
    }

    // test the existence of audio
    await fetch(audioFileLink, { method: "HEAD" }).then(r => {
        if (Number(r.status) === 200) {
            audio = true
        }
    }).catch(() => {})

    // fallback for videos with variable audio quality
    if (!audio) {
        audioFileLink = `${video.split('_')[0]}_AUDIO_128.mp4`
        await fetch(audioFileLink, { method: "HEAD" }).then(r => {
            if (Number(r.status) === 200) {
                audio = true
            }
        }).catch(() => {})
    }

    if (!audio) return {
        typeId: "redirect",
        urls: video
    }

    return {
        typeId: "tunnel",
        type: "merge",
        urls: [video, audioFileLink],
        audioFilename: `reddit_${sourceId}_audio`,
        filename: `reddit_${sourceId}.mp4`
    }
}
