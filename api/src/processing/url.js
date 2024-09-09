import psl from "psl";
import { strict as assert } from "node:assert";

import { env } from "../config.js";
import { services } from "./service-config.js";
import { friendlyServiceName } from "./service-alias.js";

function aliasURL(url) {
    assert(url instanceof URL);

    const host = psl.parse(url.hostname);
    const parts = url.pathname.split('/');

    switch (host.sld) {
        case "youtube":
            if (url.pathname.startsWith('/live/') || url.pathname.startsWith('/shorts/')) {
                url.pathname = '/watch';
                // parts := ['', 'live' || 'shorts', id, ...rest]
                url.search = `?v=${encodeURIComponent(parts[2])}`
            }
            break;

        case "youtu":
            if (url.hostname === 'youtu.be' && parts.length >= 2) {
                /* youtu.be urls can be weird, e.g. https://youtu.be/<id>//asdasd// still works
                ** but we only care about the 1st segment of the path */
                url = new URL(`https://youtube.com/watch?v=${
                    encodeURIComponent(parts[1])
                }`)
            }
            break;

        case "pin":
            if (url.hostname === 'pin.it' && parts.length === 2) {
                url = new URL(`https://pinterest.com/url_shortener/${
                    encodeURIComponent(parts[1])
                }`)
            }
            break;

        case "vxtwitter":
        case "fixvx":
        case "x":
            if (services.twitter.altDomains.includes(url.hostname)) {
                url.hostname = 'twitter.com'
            }
            break;

        case "twitch":
            if (url.hostname === 'clips.twitch.tv' && parts.length >= 2) {
                url = new URL(`https://twitch.tv/_/clip/${parts[1]}`);
            }
            break;

        case "bilibili":
            if (host.tld === 'tv') {
                url = new URL(`https://bilibili.com/_tv${url.pathname}`);
            }
            break;

        case "b23":
            if (url.hostname === 'b23.tv' && parts.length === 2) {
                url = new URL(`https://bilibili.com/_shortLink/${parts[1]}`)
            }
            break;

        case "dai":
            if (url.hostname === 'dai.ly' && parts.length === 2) {
                url = new URL(`https://dailymotion.com/video/${parts[1]}`)
            }
            break;

        case "facebook":
        case "fb":
            if (url.searchParams.get('v')) {
                url = new URL(`https://web.facebook.com/user/videos/${url.searchParams.get('v')}`)
            }
            if (url.hostname === 'fb.watch') {
                url = new URL(`https://web.facebook.com/_shortLink/${parts[1]}`)
            }
            break;

        case "ddinstagram":
            if (services.instagram.altDomains.includes(host.domain) && [null, 'd', 'g'].includes(host.subdomain)) {
                url.hostname = 'instagram.com';
            }
            break;
    }

    return url
}

function cleanURL(url) {
    assert(url instanceof URL);
    const host = psl.parse(url.hostname).sld;

    let stripQuery = true;

    const limitQuery = (param) => {
        url.search = `?${param}=` + encodeURIComponent(url.searchParams.get(param));
        stripQuery = false;
    }

    switch (host) {
        case "pinterest":
            url.hostname = 'pinterest.com';
            break;
        case "vk":
            if (url.pathname.includes('/clip') && url.searchParams.get('z')) {
                limitQuery('z')
            }
            break;
        case "youtube":
            if (url.searchParams.get('v')) {
                limitQuery('v')
            }
            break;
        case "rutube":
            if (url.searchParams.get('p')) {
                limitQuery('p')
            }
            break;
    }

    if (stripQuery) {
        url.search = ''
    }

    url.username = url.password = url.port = url.hash = ''

    if (url.pathname.endsWith('/'))
        url.pathname = url.pathname.slice(0, -1);

    return url
}

function getHostIfValid(url) {
    const host = psl.parse(url.hostname);
    if (host.error) return;

    const service = services[host.sld];
    if (!service) return;
    if ((service.tld ?? 'com') !== host.tld) return;

    const anySubdomainAllowed = service.subdomains === '*';
    const validSubdomain = [null, 'www', ...(service.subdomains ?? [])].includes(host.subdomain);
    if (!validSubdomain && !anySubdomainAllowed) return;

    return host.sld;
}

export function normalizeURL(url) {
    return cleanURL(
        aliasURL(
            new URL(url.replace(/^https\/\//, 'https://'))
        )
    );
}

export function extract(url) {
    if (!(url instanceof URL)) {
        url = new URL(url);
    }

    const host = getHostIfValid(url);

    if (!host) {
        return { error: "link.invalid" };
    }

    if (!env.enabledServices.has(host)) {
        return { error: "service.disabled" };
    }

    let patternMatch;
    for (const pattern of services[host].patterns) {
        patternMatch = pattern.match(
            url.pathname.substring(1) + url.search
        );

        if (patternMatch) {
            break;
        }
    }

    if (!patternMatch) {
        return {
            error: "link.unsupported",
            context: {
                service: friendlyServiceName(host),
            }
        };
    }

    return { host, patternMatch };
}
