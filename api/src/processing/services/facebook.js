import { genericUserAgent } from "../../config.js";

const headers = {
    'User-Agent': genericUserAgent,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
}

const resolveUrl = (url) => {
    return fetch(url, { headers })
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

export default async function({ id, shareType, shortLink }) {
    let url = `https://web.facebook.com/i/videos/${id}`;

    if (shareType) url = `https://web.facebook.com/share/${shareType}/${id}`;
    if (shortLink) url = await resolveUrl(`https://fb.watch/${shortLink}`);

    const html = await fetch(url, { headers })
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
