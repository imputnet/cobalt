import { services } from "./config.js";
import { strict as assert } from "node:assert";
import psl from "psl";

export function aliasURL(url) {
    assert(url instanceof URL);

    const host = psl.parse(url.hostname);
    const parts = url.pathname.split('/');

    switch (host.sld) {
        case "youtube":
            if (url.pathname.startsWith('/live/') || url.pathname.startsWith('/shorts/')) {
                url.pathname = '/watch';
                // ['', 'live' || 'shorts', id, ...rest]
                url.search = `?v=${encodeURIComponent(parts[2])}`
            }
            break;
        case "youtu":
            if (url.hostname === 'youtu.be' && parts.length === 2) {
                /* youtu.be urls can be weird, e.g. https://youtu.be/<id>//asdasd// still works
                ** but we only care about the 1st segment of the path */
                url = new URL(`https://youtube.com/watch?v=${
                    encodeURIComponent(parts[1])
                }`)
            }
            break;

        case "vxtwitter":
        case "x":
            if (['x.com', 'vxtwitter.com'].includes(url.hostname)) {
                url.hostname = 'twitter.com'
            }
            break;

        case "tumblr":
            if (!url.pathname.includes("/blog/view")) {
                if (url.pathname.endsWith('/'))
                    url.pathname = url.pathname.slice(0, -1);
                url.pathname = url.pathname.replace(parts[5], '')
            }
            break;

        case "twitch":
            if (url.hostname === 'clips.twitch.tv' && parts.length >= 2) {
                url = new URL(`https://twitch.tv/_/clip/${parts[1]}`);
            }
            break;
    }

    return { url, host: host.sld }
}

export function cleanURL({ url, host }) {
    assert(url instanceof URL);
    let stripQuery = true;

    if (host === 'pinterest') {
        url.hostname = 'pinterest.com'
    } else if (host === 'vk' && url.pathname.includes('/clip')) {
        if (url.searchParams.get('z'))
            url.search = '?z=' + encodeURIComponent(url.searchParams.get('z'));
        stripQuery = false;
    } else if (host === 'youtube' && url.searchParams.get('v')) {
        url.search = '?v=' + encodeURIComponent(url.searchParams.get('v'));
        stripQuery = false;
    }

    if (stripQuery) {
        url.search = url.hash = ''
    }

    if (url.pathname.endsWith('/'))
        url.pathname = url.pathname.slice(0, -1);

    return url
}

export function normalizeURL(url) {
    return cleanURL(
        aliasURL(
            new URL(url.replace(/^https\/\//, 'https://'))
        )
    );
}

export function hasValidHostname(url) {
    const host = psl.parse(url.hostname);
    if (host.error) return false;

    const service = services[host.sld];
    if (!service) return false;
    
    if ((service.tld ?? 'com') !== host.tld) return false;

    const anySubdomainAllowed = service.subdomains === '*';
    const validSubdomain = [null, 'www', ...(service.subdomains ?? [])].includes(host.subdomain);
    if (!validSubdomain && !anySubdomainAllowed)
        return false;

    return true;
}