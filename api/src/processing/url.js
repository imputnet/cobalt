import psl from "@imput/psl";
import { strict as assert } from "node:assert";

import { env } from "../config.js";
import { services } from "./service-config.js";
import { getRedirectingURL } from "../misc/utils.js";
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
                url.search = `?v=${encodeURIComponent(parts[2])}`;
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
                url.hostname = 'twitter.com';
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
                url = new URL(`https://bilibili.com/_shortLink/${parts[1]}`);
            }
            break;

        case "dai":
            if (url.hostname === 'dai.ly' && parts.length === 2) {
                url = new URL(`https://dailymotion.com/video/${parts[1]}`);
            }
            break;

        case "facebook":
        case "fb":
            if (url.searchParams.get('v')) {
                url = new URL(`https://web.facebook.com/user/videos/${url.searchParams.get('v')}`);
            }
            if (url.hostname === 'fb.watch') {
                url = new URL(`https://web.facebook.com/_shortLink/${parts[1]}`);
            }
            break;

        case "ddinstagram":
            if (services.instagram.altDomains.includes(host.domain) && [null, 'd', 'g'].includes(host.subdomain)) {
                url.hostname = 'instagram.com';
            }
            break;

        case "vk":
        case "vkvideo":
            if (services.vk.altDomains.includes(url.hostname)) {
                url.hostname = 'vk.com';
            }
            if (url.searchParams.get('z')) {
                url = new URL(`https://vk.com/${url.searchParams.get('z')}`);
            }
            break;

        case "xhslink":
            if (url.hostname === 'xhslink.com' && parts.length === 3) {
                url = new URL(`https://www.xiaohongshu.com/${parts[1]}/${parts[2]}`);
            }
            break;

        case "loom":
            const idPart = parts[parts.length - 1];
            if (idPart.length > 32) {
                url.pathname = `/share/${idPart.slice(-32)}`;
            }
            break;

        case "redd":
            /* reddit short video links can be treated by changing https://v.redd.it/<id>
            to https://reddit.com/video/<id>.*/
            if (url.hostname === "v.redd.it" && parts.length === 2) {
                url = new URL(`https://www.reddit.com/video/${parts[1]}`);
            }
            break;
    }

    return url;
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
                limitQuery('z');
            }
            break;
        case "youtube":
            if (url.searchParams.get('v')) {
                limitQuery('v');
            }
            break;
        case "bilibili":
        case "rutube":
            if (url.searchParams.get('p')) {
                limitQuery('p');
            }
            break;
        case "twitter":
            if (url.searchParams.get('post_id')) {
                limitQuery('post_id');
            }
            break;
        case "xiaohongshu":
            if (url.searchParams.get('xsec_token')) {
                limitQuery('xsec_token');
            }
            break;
    }

    if (stripQuery) {
        url.search = '';
    }

    url.username = url.password = url.port = url.hash = '';

    if (url.pathname.endsWith('/'))
        url.pathname = url.pathname.slice(0, -1);

    return url;
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

export function extract(url, enabledServices = env.enabledServices) {
    if (!(url instanceof URL)) {
        url = new URL(url);
    }

    const host = getHostIfValid(url);

    if (!host) {
        return { error: "link.invalid" };
    }

    if (!enabledServices.has(host)) {
        // show a different message when youtube is disabled on official instances
        // as it only happens when shit hits the fan
        if (new URL(env.apiURL).hostname.endsWith(".imput.net") && host === "youtube") {
            return { error: "youtube.temporary_disabled" };
        }
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

export async function resolveRedirectingURL(url, dispatcher, headers) {
    const originalService = getHostIfValid(normalizeURL(url));
    if (!originalService) return;

    const canonicalURL = await getRedirectingURL(url, dispatcher, headers);
    if (!canonicalURL) return;

    const { host, patternMatch } = extract(normalizeURL(canonicalURL));

    if (host === originalService) {
        return patternMatch;
    }
}
