import { createStream } from "../../stream/manage.js";
import { genericUserAgent } from "../../config.js";
import { getCookie, updateCookie } from '../cookie/manager.js';

export default async function(obj) {
    let data;
    try {
        const url = new URL('https://www.instagram.com/graphql/query/');
        url.searchParams.set('query_hash', 'b3055c01b4b222b8a47dc12b090e4e64')
        url.searchParams.set('variables', JSON.stringify({
            child_comment_count: 3,
            fetch_comment_count: 40,
            has_threaded_comments: true,
            parent_comment_count: 24,
            shortcode: obj.id
        }))

        const cookie = getCookie('instagram');

        data = await fetch(url, {
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
                'User-Agent': genericUserAgent,
                'X-Ig-App-Id': '936619743392459',
                'X-Asbd-Id': '129477',
                'x-ig-www-claim': cookie?._wwwClaim || '0',
                'x-csrftoken': cookie?.values()?.csrftoken,
                'x-requested-with': 'XMLHttpRequest',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'upgrade-insecure-requests': '1',
                'accept-encoding': 'gzip, deflate, br',
                'accept-language': 'en-US,en;q=0.9,en;q=0.8',
                cookie
            }
        })

        if (data.headers.get('X-Ig-Set-Www-Claim') && cookie) {
            cookie._wwwClaim = data.headers.get('X-Ig-Set-Www-Claim');
        }

        updateCookie(cookie, data.headers);
        data = (await data.json()).data;
    } catch (e) {
        data = false;
    }

    if (!data) return { error: 'ErrorCouldntFetch' };

    let single, multiple = [];
    const sidecar = data?.shortcode_media?.edge_sidecar_to_children;
    if (sidecar) {
        sidecar.edges.forEach(e => {
            if (e.node?.is_video) {
                multiple.push({
                    type: "video",
                    // thumbnails have `Cross-Origin-Resource-Policy` set to `same-origin`, so we need to proxy them
                    thumb: createStream({
                        service: "instagram",
                        type: "default",
                        u: e.node?.display_url,
                        filename: "image.jpg"
                    }),
                    url: e.node?.video_url
                })
            } else {
                multiple.push({
                    type: "photo",
                    thumb: createStream({
                        service: "instagram",
                        type: "default",
                        u: e.node?.display_url,
                        filename: "image.jpg"
                    }),
                    url: e.node?.display_url
                })
            }
        })
    } else if (data?.shortcode_media?.video_url) {
        single = data.shortcode_media.video_url
    } else if (data?.shortcode_media?.display_url) {
        return {
            urls: data?.shortcode_media?.display_url,
            isPhoto: true
        }
    } else {
        return { error: 'ErrorEmptyDownload' }
    }

    if (single) {
        return {
            urls: single,
            filename: `instagram_${obj.id}.mp4`,
            audioFilename: `instagram_${obj.id}_audio`
        }
    } else if (multiple.length) {
        return { picker: multiple }
    } else {
        return { error: 'ErrorEmptyDownload' }
    }
}
