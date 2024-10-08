import { genericUserAgent } from "../../config.js";
import { createStream } from "../../stream/manage.js";
import { getCookie, updateCookie } from "../cookie/manager.js";

const commonHeaders = {
    "user-agent": genericUserAgent,
    "sec-gpc": "1",
    "sec-fetch-site": "same-origin",
    "x-ig-app-id": "936619743392459"
}
const mobileHeaders = {
    "x-ig-app-locale": "en_US",
    "x-ig-device-locale": "en_US",
    "x-ig-mapped-locale": "en_US",
    "user-agent": "Instagram 275.0.0.27.98 Android (33/13; 280dpi; 720x1423; Xiaomi; Redmi 7; onclite; qcom; en_US; 458229237)",
    "accept-language": "en-US",
    "x-fb-http-engine": "Liger",
    "x-fb-client-ip": "True",
    "x-fb-server-cluster": "True",
    "content-length": "0",
}
const embedHeaders = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "Accept-Language": "en-GB,en;q=0.9",
    "Cache-Control": "max-age=0",
    "Dnt": "1",
    "Priority": "u=0, i",
    "Sec-Ch-Ua": 'Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": "macOS",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
}

const cachedDtsg = {
    value: '',
    expiry: 0
}

export default function(obj) {
    const dispatcher = obj.dispatcher;

    async function findDtsgId(cookie) {
        try {
            if (cachedDtsg.expiry > Date.now()) return cachedDtsg.value;

            const data = await fetch('https://www.instagram.com/', {
                headers: {
                    ...commonHeaders,
                    cookie
                },
                dispatcher
            }).then(r => r.text());

            const token = data.match(/"dtsg":{"token":"(.*?)"/)[1];

            cachedDtsg.value = token;
            cachedDtsg.expiry = Date.now() + 86390000;

            if (token) return token;
            return false;
        }
        catch {}
    }

    async function request(url, cookie, method = 'GET', requestData) {
        let headers = {
            ...commonHeaders,
            'x-ig-www-claim': cookie?._wwwClaim || '0',
            'x-csrftoken': cookie?.values()?.csrftoken,
            cookie
        }
        if (method === 'POST') {
            headers['content-type'] = 'application/x-www-form-urlencoded';
        }

        const data = await fetch(url, {
            method,
            headers,
            body: requestData && new URLSearchParams(requestData),
            dispatcher
        });

        if (data.headers.get('X-Ig-Set-Www-Claim') && cookie)
            cookie._wwwClaim = data.headers.get('X-Ig-Set-Www-Claim');

        updateCookie(cookie, data.headers);
        return data.json();
    }
    async function getMediaId(id, { cookie, token } = {}) {
        const oembedURL = new URL('https://i.instagram.com/api/v1/oembed/');
        oembedURL.searchParams.set('url', `https://www.instagram.com/p/${id}/`);

        const oembed = await fetch(oembedURL, {
            headers: {
                ...mobileHeaders,
                ...( token && { authorization: `Bearer ${token}` } ),
                cookie
            },
            dispatcher
        }).then(r => r.json()).catch(() => {});

        return oembed?.media_id;
    }

    async function requestMobileApi(mediaId, { cookie, token } = {}) {
        const mediaInfo = await fetch(`https://i.instagram.com/api/v1/media/${mediaId}/info/`, {
            headers: {
                ...mobileHeaders,
                ...( token && { authorization: `Bearer ${token}` } ),
                cookie
            },
            dispatcher
        }).then(r => r.json()).catch(() => {});

        return mediaInfo?.items?.[0];
    }
    async function requestHTML(id, cookie) {
        const data = await fetch(`https://www.instagram.com/p/${id}/embed/captioned/`, {
            headers: {
                ...embedHeaders,
                cookie
            },
            dispatcher
        }).then(r => r.text()).catch(() => {});

        let embedData = JSON.parse(data?.match(/"init",\[\],\[(.*?)\]\],/)[1]);

        if (!embedData || !embedData?.contextJSON) return false;

        embedData = JSON.parse(embedData.contextJSON);

        return embedData;
    }
    async function requestGQL(id, cookie) {
        let dtsgId;

        if (cookie) {
            dtsgId = await findDtsgId(cookie);
        }
        const url = new URL('https://www.instagram.com/api/graphql/');

        const requestData = {
            jazoest: '26406',
            variables: JSON.stringify({
            shortcode: id,
            __relay_internal__pv__PolarisShareMenurelayprovider: false
            }),
            doc_id: '7153618348081770'
        };
        if (dtsgId) {
            requestData.fb_dtsg = dtsgId;
        }

        return (await request(url, cookie, 'POST', requestData))
                .data
                ?.xdt_api__v1__media__shortcode__web_info
                ?.items
                ?.[0];
    }

    function extractOldPost(data, id, alwaysProxy) {
        const sidecar = data?.gql_data?.shortcode_media?.edge_sidecar_to_children;
        if (sidecar) {
            const picker = sidecar.edges.filter(e => e.node?.display_url)
                .map((e, i) => {
                    const type = e.node?.is_video ? "video" : "photo";
                    const url = type === "video" ? e.node?.video_url : e.node?.display_url;

                    let itemExt = type === "video" ? "mp4" : "jpg";

                    let proxyFile;
                    if (alwaysProxy) proxyFile = createStream({
                        service: "instagram",
                        type: "proxy",
                        u: url,
                        filename: `instagram_${id}_${i + 1}.${itemExt}`
                    });

                    return {
                        type,
                        url: proxyFile || url,
                        /* thumbnails have `Cross-Origin-Resource-Policy`
                        ** set to `same-origin`, so we need to proxy them */
                        thumb: createStream({
                            service: "instagram",
                            type: "proxy",
                            u: e.node?.display_url,
                            filename: `instagram_${id}_${i + 1}.jpg`
                        })
                    }
                });

            if (picker.length) return { picker }
        } else if (data?.gql_data?.shortcode_media?.video_url) {
            return {
                urls: data.gql_data.shortcode_media.video_url,
                filename: `instagram_${id}.mp4`,
                audioFilename: `instagram_${id}_audio`
            }
        } else if (data?.gql_data?.shortcode_media?.display_url) {
            return {
                urls: data.gql_data?.shortcode_media.display_url,
                isPhoto: true
            }
        }
    }

    function extractNewPost(data, id, alwaysProxy) {
        const carousel = data.carousel_media;
        if (carousel) {
            const picker = carousel.filter(e => e?.image_versions2)
                .map((e, i) => {
                    const type = e.video_versions ? "video" : "photo";
                    const imageUrl = e.image_versions2.candidates[0].url;

                    let url = imageUrl;
                    let itemExt = type === "video" ? "mp4" : "jpg";

                    if (type === "video") {
                        const video = e.video_versions.reduce((a, b) => a.width * a.height < b.width * b.height ? b : a);
                        url = video.url;
                    }

                    let proxyFile;
                    if (alwaysProxy) proxyFile = createStream({
                        service: "instagram",
                        type: "proxy",
                        u: url,
                        filename: `instagram_${id}_${i + 1}.${itemExt}`
                    });

                    return {
                        type,
                        url: proxyFile || url,
                        /* thumbnails have `Cross-Origin-Resource-Policy`
                        ** set to `same-origin`, so we need to always proxy them */
                        thumb: createStream({
                            service: "instagram",
                            type: "proxy",
                            u: imageUrl,
                            filename: `instagram_${id}_${i + 1}.jpg`
                        })
                    }
                });

            if (picker.length) return { picker }
        } else if (data.video_versions) {
            const video = data.video_versions.reduce((a, b) => a.width * a.height < b.width * b.height ? b : a)
            return {
                urls: video.url,
                filename: `instagram_${id}.mp4`,
                audioFilename: `instagram_${id}_audio`
            }
        } else if (data.image_versions2?.candidates) {
            return {
                urls: data.image_versions2.candidates[0].url,
                isPhoto: true,
                filename: `instagram_${id}.jpg`,
            }
        }
    }

    async function getPost(id, alwaysProxy) {
        let data, result;
        try {
            const cookie = getCookie('instagram');

            const bearer = getCookie('instagram_bearer');
            const token = bearer?.values()?.token;

            // get media_id for mobile api, three methods
            let media_id = await getMediaId(id);
            if (!media_id && token) media_id = await getMediaId(id, { token });
            if (!media_id && cookie) media_id = await getMediaId(id, { cookie });

            // mobile api (bearer)
            if (media_id && token) data = await requestMobileApi(media_id, { token });

            // mobile api (no cookie, cookie)
            if (media_id && !data) data = await requestMobileApi(media_id);
            if (media_id && cookie && !data) data = await requestMobileApi(media_id, { cookie });

            // html embed (no cookie, cookie)
            if (!data) data = await requestHTML(id);
            if (!data && cookie) data = await requestHTML(id, cookie);

            // web app graphql api (no cookie, cookie)
            if (!data) data = await requestGQL(id);
            if (!data && cookie) data = await requestGQL(id, cookie);
        } catch {}

        if (!data) return { error: "fetch.fail" };

        if (data?.gql_data) {
            result = extractOldPost(data, id, alwaysProxy)
        } else {
            result = extractNewPost(data, id, alwaysProxy)
        }

        if (result) return result;
        return { error: "fetch.empty" }
    }

    async function usernameToId(username, cookie) {
        const url = new URL('https://www.instagram.com/api/v1/users/web_profile_info/');
            url.searchParams.set('username', username);

        try {
            const data = await request(url, cookie);
            return data?.data?.user?.id;
        } catch {}
    }

    async function getStory(username, id) {
        const cookie = getCookie('instagram');
        if (!cookie) return { error: "link.unsupported" };

        const userId = await usernameToId(username, cookie);
        if (!userId) return { error: "fetch.empty" };

        const dtsgId = await findDtsgId(cookie);

        const url = new URL('https://www.instagram.com/api/graphql/');
        const requestData = {
            fb_dtsg: dtsgId,
            jazoest: '26438',
            variables: JSON.stringify({
                reel_ids_arr : [ userId ],
            }),
            server_timestamps: true,
            doc_id: '25317500907894419'
        };

        let media;
        try {
            const data = (await request(url, cookie, 'POST', requestData));
            media = data?.data?.xdt_api__v1__feed__reels_media?.reels_media?.find(m => m.id === userId);
        } catch {}

        const item = media.items.find(m => m.pk === id);
        if (!item) return { error: "fetch.empty" };

        if (item.video_versions) {
            const video = item.video_versions.reduce((a, b) => a.width * a.height < b.width * b.height ? b : a)
            return {
                urls: video.url,
                filename: `instagram_${id}.mp4`,
                audioFilename: `instagram_${id}_audio`
            }
        }

        if (item.image_versions2?.candidates) {
            return {
                urls: item.image_versions2.candidates[0].url,
                isPhoto: true
            }
        }

        return { error: "link.unsupported" };
    }

    const { postId, storyId, username, alwaysProxy } = obj;
    if (postId) return getPost(postId, alwaysProxy);
    if (username && storyId) return getStory(username, storyId);

    return { error: "fetch.empty" }
}
