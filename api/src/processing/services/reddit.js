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

async function resolveShortLink(url) {
    try {
        const response = await fetch(url, { method: 'HEAD', redirect: 'manual' });
        return response.headers.get('location');
    } catch {
        return null;
    }
}

export default async function(obj) {
    let url;

    if (obj.shortLink) {
        const resolvedUrl = await resolveShortLink(obj.shortLink);
        if (!resolvedUrl) return { error: "fetch.short_link" };
        url = new URL(resolvedUrl);
    } else {
        url = new URL(`https://www.reddit.com/r/${obj.sub}/comments/${obj.id}.json`);
        if (obj.user) {
            url.pathname = `/user/${obj.user}/comments/${obj.id}.json`;
        }
    }

    const accessToken = await getAccessToken();
    if (accessToken) url.hostname = 'oauth.reddit.com';

    let data = await fetch(
        url, {
            headers: {
                'User-Agent': genericUserAgent,
                accept: 'application/json',
                authorization: accessToken && `Bearer ${accessToken}`
            }
        }
    ).then(r => r.json()).catch(() => {});

    if (!data || !Array.isArray(data)) {
        return { error: "fetch.fail" }
    }

    data = data[0]?.data?.children[0]?.data;

    const id = `${String(obj.sub).toLowerCase()}_${obj.id}`;

    if (data?.url?.endsWith('.gif')) return {
        typeId: "redirect",
        urls: data.url,
        filename: `reddit_${id}.gif`,
    }

    if (!data.secure_media?.reddit_video)
        return { error: "fetch.empty" };

    if (data.secure_media?.reddit_video?.duration > env.durationLimit)
        return { error: "content.too_long" };

    let audio = false,
        video = data.secure_media?.reddit_video?.fallback_url?.split('?')[0],
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
        audioFilename: `reddit_${id}_audio`,
        filename: `reddit_${id}.mp4`
    }
}