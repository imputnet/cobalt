import psl from "@imput/psl";

const LEGACY_API = 'https://api.tumblr.com';
const NEW_API = 'https://api-http2.tumblr.com';
const API_KEY = 'jrsCWX1XDuVxAFO4GkK147syAoN8BJZ5voz8tS80bPcj26Vc5Z';

async function fetchLegacy(domain, id, type) {
    const url = new URL(`/v2/blog/${domain}/posts`, LEGACY_API);
    url.searchParams.set('id', id);
    if (type) url.searchParams.set('type', type);
    url.searchParams.set('api_key', API_KEY);

    try {
        const res = await fetch(url.toString(), {
            headers: { 'User-Agent': 'Tumblr/iPhone/33.3/333010/17.3.1/tumblr' }
        });
        return await res.json();
    } catch {
        return null;
    }
}

async function fetchNew(domain, id) {
    const url = new URL(`/v2/blog/${domain}/posts/${id}`, NEW_API);
    url.searchParams.set('api_key', API_KEY);
    url.searchParams.set('fields[blogs]', 'uuid,name,avatar,?description,?can_message,?can_be_followed,?is_adult,?reply_conditions,' +
        '?theme,?title,?url,?is_blocked_from_primary,?placement_id,?primary,?updated,?followed,' +
        '?ask,?can_subscribe,?paywall_access,?subscription_plan,?is_blogless_advertiser,?tumblrmart_accessories');

    try {
        const res = await fetch(url.toString(), {
            headers: {
                'User-Agent': 'Tumblr/iPhone/33.3/333010/17.3.1/tumblr',
                'X-Version': 'iPhone/33.3/333010/17.3.1/tumblr'
            }
        });
        return await res.json();
    } catch {
        return null;
    }
}

export default async function(input) {
    let { subdomain } = psl.parse(input.url.hostname);

    if (subdomain?.includes('.')) return { error: "link.unsupported" };
    else if (subdomain === 'www' || subdomain === 'at') subdomain = undefined;

    const domain = `${subdomain ?? input.user}.tumblr.com`;

    let data = await fetchLegacy(domain, input.id, 'audio');
    let post = data?.response?.posts?.[0];

    if (post && post.type === 'audio') {
        const audioUrl = post.audio_url || post.audio_source_url;
        const title = post.caption ? post.caption.replace(/<[^>]+>/g, '').slice(0, 100) : '';
        return {
            urls: audioUrl,
            filenameAttributes: {
                service: 'tumblr',
                id: input.id,
                title,
                author: post.blog_name
            },
            isAudioOnly: true,
            bestAudio: "mp3"
        };
    }

    data = await fetchLegacy(domain, input.id, 'video');
    post = data?.response?.posts?.[0];

    if (post && post.type === 'video') {
        const videoUrl = post.video_url || post.media?.find(m => m.type === 'video')?.url;
        return {
            urls: videoUrl,
            filename: `tumblr_${input.id}.mp4`,
            audioFilename: `tumblr_${input.id}_audio`
        };
    }

    data = await fetchNew(domain, input.id);
    const element = data?.response?.timeline?.elements?.[0];
    if (!element) return { error: "fetch.empty" };

    const contents = [
        ...element.content,
        ...element?.trail?.map(t => t.content).flat()
    ];

    const audio = contents.find(c => c.type === 'audio');
    if (audio && audio.provider === 'tumblr') {
        return {
            urls: audio.media.url,
            filenameAttributes: {
                service: 'tumblr',
                id: input.id,
                title: audio?.title,
                author: audio?.artist
            },
            isAudioOnly: true,
            bestAudio: "mp3",
        };
    }

    const video = contents.find(c => c.type === 'video');
    if (video && video.provider === 'tumblr') {
        return {
            urls: video.media.url,
            filename: `tumblr_${input.id}.mp4`,
            audioFilename: `tumblr_${input.id}_audio`
        };
    }

    return { error: "link.unsupported" };
}
