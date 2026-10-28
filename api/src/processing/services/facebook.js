import { genericUserAgent } from "../../config.js";

const headers = {
    'User-Agent': genericUserAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
}

// m.facebook serves a lightweight photo page (with og:image) to mobile
// user agents without requiring a login, unlike www/mbasic
const photoHeaders = {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G960F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.181 Mobile Safari/537.36',
    'Accept': headers.Accept,
    'Accept-Language': headers['Accept-Language'],
}

const resolveUrl = (url, dispatcher) => {
    return fetch(url, { headers, dispatcher })
        .then(r => {
            if (r.headers.get('location')) {
                return decodeURIComponent(r.headers.get('location'));
            }
            if (r.headers.get('link')) {
                const linkMatch = r.headers.get('link').match(/<(.*?)\/>/);
                return decodeURIComponent(linkMatch[1]);
            }
            return false;
        })
        .catch(() => false);
}

const getPhoto = async (photoId, dispatcher) => {
    let html = await fetch(`https://web.facebook.com/photo/?fbid=${photoId}`, {
        headers, dispatcher
    }).then(r => r.text())
    .catch(() => false);

    let image;
    if (html) {
        // the signed photo url is embedded in the page right
        // after the graphql node of the photo itself
        const node = html.indexOf(`"__isNode":"Photo","id":"${photoId}"`);
        if (node !== -1) {
            image = html.slice(node, node + 3000)
                .match(/"(?:image|prefetch_uris_v2)":(?:\[\{|\{)"uri":"([^"]+)"/)?.[1];
        }
    }

    if (!image) {
        // fallback: m.facebook photo page (mobile user agent)
        html = await fetch(`https://m.facebook.com/photo.php?fbid=${photoId}`, {
            headers: photoHeaders, dispatcher
        }).then(r => r.text())
        .catch(() => false);
        image = html?.match?.(/<meta property="og:image" content="([^"]+)"/)?.[1];
    }

    if (!image) return { error: "fetch.empty" };

    // decode escaped url params and strip the /sNNNxNNN/ size
    // transform some fbcdn urls carry, to get the original image
    const url = image
        .replace(/\\u002[fF]/g, '/')
        .replace(/\\\//g, '/')
        .replace(/\\u0026/g, '&')
        .replace(/&amp;/g, '&')
        .replace(/\/s\d+x\d+\//g, '/');

    // fbcdn's stp=dst-jpg transform re-encodes any source to jpeg while
    // keeping the original path extension, so it decides the extension
    const ext = url.includes('stp=dst-jpg')
        ? 'jpg'
        : url.match(/\.(png|webp|jpe?g)(\?|$)/i)?.[1] || 'jpg';

    return {
        isPhoto: true,
        urls: url,
        filename: `facebook_${photoId}.${ext}`,
    };
}

export default async function({ id, shareType, shortLink, photoId, dispatcher }) {
    if (photoId) return getPhoto(photoId, dispatcher);

    let url = `https://www.facebook.com/reel/${id}`;

    if (shareType) url = `https://www.facebook.com/share/${shareType}/${id}`;
    if (shortLink) url = await resolveUrl(`https://fb.watch/${shortLink}`, dispatcher);

    const html = await fetch(url, { headers, dispatcher })
        .then(r => r.text())
        .catch(() => false);

    if (!html && shortLink) return { error: "fetch.short_link" }
    if (!html) return { error: "fetch.fail" };

    const urls = [];
    const hd = html.match('"browser_native_hd_url":(".*?")');
    const sd = html.match('"browser_native_sd_url":(".*?")');

    if (hd?.[1]) urls.push(JSON.parse(hd[1]));
    if (sd?.[1]) urls.push(JSON.parse(sd[1]));

    if (!urls.length) {
        return { error: "fetch.empty" };
    }

    const baseFilename = `facebook_${id || shortLink}`;

    return {
        urls: urls[0],
        filename: `${baseFilename}.mp4`,
        audioFilename: `${baseFilename}_audio`,
    };
}
