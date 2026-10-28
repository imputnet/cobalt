import psl from "@imput/psl";

import { createStream } from "../../stream/manage.js";

const API_KEY = 'jrsCWX1XDuVxAFO4GkK147syAoN8BJZ5voz8tS80bPcj26Vc5Z';
const API_BASE = 'https://api-http2.tumblr.com';

function request(domain, id) {
    const url = new URL(`/v2/blog/${domain}/posts/${id}/permalink`, API_BASE);
    url.searchParams.set('api_key', API_KEY);
    url.searchParams.set('fields[blogs]', 'uuid,name,avatar,?description,?can_message,?can_be_followed,?is_adult,?reply_conditions,'
                                            + '?theme,?title,?url,?is_blocked_from_primary,?placement_id,?primary,?updated,?followed,'
                                            + '?ask,?can_subscribe,?paywall_access,?subscription_plan,?is_blogless_advertiser,?tumblrmart_accessories');

    return fetch(url, {
        headers: {
            'User-Agent': 'Tumblr/iPhone/33.3/333010/17.3.1/tumblr',
            'X-Version': 'iPhone/33.3/333010/17.3.1/tumblr'
        }
    }).then(a => a.json()).catch(() => {});
}

const pickImage = (content) =>
    content.media.reduce((a, b) => (a.width || 0) >= (b.width || 0) ? a : b);

// tumblr serves actual gif data for `.gifv` media variants,
// every other image variant is a jpg
const imageExtension = (media) => {
    const isGif = media.type === 'image/gif'
               || media.url.endsWith('.gif')
               || media.url.endsWith('.gifv');

    return isGif ? 'gif' : 'jpg';
}

export default async function(input) {
    let { subdomain } = psl.parse(input.url.hostname);

    if (subdomain?.includes('.')) {
        return { error: "link.unsupported" };
    } else if (subdomain === 'www' || subdomain === 'at') {
        subdomain = undefined
    }

    const domain = `${subdomain ?? input.user}.tumblr.com`;
    const data = await request(domain, input.id);

    const element = data?.response?.timeline?.elements?.[0];
    if (!element) return { error: "fetch.empty" };

    const contents = [
        ...element.content,
        ...element?.trail?.map(t => t.content).flat()
    ]

    const audio = contents.find(c => c.type === 'audio');
    if (audio && audio.provider === 'tumblr') {
        const fileMetadata = {
            title: audio?.title,
            artist: audio?.artist
        };

        return {
            urls: audio.media.url,
            filenameAttributes: {
                service: 'tumblr',
                id: input.id,
                title: fileMetadata.title,
                author: fileMetadata.artist
            },
            isAudioOnly: true,
            bestAudio: "mp3",
        }
    }

    // collect every downloadable item from the post body and
    // reblog trail: images and tumblr-hosted videos. embeds of
    // other providers are not downloadable, so they're skipped
    const media = [];
    for (const content of contents) {
        if (content.type === 'image' && content.media?.length) {
            const image = pickImage(content);
            media.push({
                type: 'photo',
                url: image.url,
                ext: imageExtension(image),
                thumbUrl: image.url
            });
        } else if (content.type === 'video' && content.provider === 'tumblr') {
            media.push({
                type: 'video',
                url: content.media.url,
                thumbUrl: content.poster?.[0]?.url || content.filmstrip?.url
            });
        }
    }

    if (media.length === 1) {
        const item = media[0];

        if (item.type === 'video') {
            return {
                urls: item.url,
                filename: `tumblr_${input.id}.mp4`,
                audioFilename: `tumblr_${input.id}_audio`
            }
        }

        return {
            urls: item.url,
            isPhoto: true,
            filename: `tumblr_${input.id}.${item.ext}`
        }
    }

    if (media.length > 1) {
        return {
            picker: media.map((item, i) => ({
                type: item.type,
                url: item.url,
                ...(item.thumbUrl && {
                    thumb: createStream({
                        service: "tumblr",
                        type: "proxy",
                        url: item.thumbUrl,
                        filename: `tumblr_${input.id}_${i + 1}.jpg`
                    })
                })
            }))
        }
    }

    return { error: "link.unsupported" }
}
