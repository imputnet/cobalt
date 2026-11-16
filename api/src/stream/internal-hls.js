import HLS from "hls-parser";
import { createInternalStream } from "./manage.js";
import { request } from "undici";

function getURL(url) {
    try {
        return new URL(url);
    } catch {
        return null;
    }
}

// decode the cloudfront policy of a signed playlist url and return the
// resource prefixes it covers (wildcard resources up to the "*", plus
// exact resources). anything unparsable means "covers nothing".
function signedResourceScopes(base) {
    try {
        const policy = base.searchParams.get("Policy");
        if (!policy) return [];

        const text = Buffer.from(policy, "base64url").toString("utf8");
        const doc = JSON.parse(text.slice(0, text.lastIndexOf("}") + 1));
        const statements = Array.isArray(doc?.Statement) ? doc.Statement : [];

        return statements
            .map(st => st?.Resource)
            .filter(r => typeof r === "string");
    } catch {
        return [];
    }
}

export function isCoveredBySignature(base, child) {
    const target = child.toString();

    for (const resource of signedResourceScopes(base)) {
        const wildcard = resource.indexOf("*");
        if (wildcard === -1 ? target === resource : target.startsWith(resource.slice(0, wildcard))) {
            return true;
        }
    }

    return false;
}

export function resolveHlsUri(streamInfo, uri) {
    if (getURL(uri)) {
        return new URL(uri);
    }

    const fullUrl = new URL(uri, streamInfo.url);

    // loom signs its master playlist with a cloudfront wildcard policy.
    // propagate the signature query to a relative child uri only when the
    // child is confirmed to be covered by that signature: the service is
    // loom, the child is same-origin (a protocol-relative //other-host/...
    // child never inherits), carries no query of its own, and its resolved
    // url stays inside the policy's resource scope (no ../ escapes).
    if (streamInfo.service === "loom" && !fullUrl.search) {
        const base = getURL(streamInfo.url);
        if (base?.search && fullUrl.origin === base.origin
            && isCoveredBySignature(base, fullUrl)) {
            fullUrl.search = base.search;
        }
    }

    return fullUrl;
}

function transformObject(streamInfo, hlsObject) {
    if (hlsObject === undefined) {
        return (object) => transformObject(streamInfo, object);
    }

    const fullUrl = resolveHlsUri(streamInfo, hlsObject.uri);

    if (fullUrl.hostname !== '127.0.0.1') {
        hlsObject.uri = createInternalStream(fullUrl.toString(), streamInfo);

        if (hlsObject.map) {
            hlsObject.map = transformObject(streamInfo, hlsObject.map);
        }
    }

    return hlsObject;
}

function transformMasterPlaylist(streamInfo, hlsPlaylist) {
    const makeInternalStream = transformObject(streamInfo);

    const makeInternalVariants = (variant) => {
        variant = transformObject(streamInfo, variant);
        variant.video = variant.video.map(makeInternalStream);
        variant.audio = variant.audio.map(makeInternalStream);
        return variant;
    };
    hlsPlaylist.variants = hlsPlaylist.variants.map(makeInternalVariants);

    return hlsPlaylist;
}

function transformMediaPlaylist(streamInfo, hlsPlaylist) {
    const makeInternalSegments = transformObject(streamInfo);
    hlsPlaylist.segments = hlsPlaylist.segments.map(makeInternalSegments);
    hlsPlaylist.prefetchSegments = hlsPlaylist.prefetchSegments.map(makeInternalSegments);
    return hlsPlaylist;
}

const HLS_MIME_TYPES = ["application/vnd.apple.mpegurl", "audio/mpegurl", "application/x-mpegurl"];

export function isHlsResponse(req, streamInfo) {
    // some cdns (e.g. loom's cloudfront) append a charset parameter and
    // mime types are case-insensitive, so compare normalized bare types
    const contentType = req.headers['content-type']?.split(';')[0].trim().toLowerCase();
    return HLS_MIME_TYPES.includes(contentType)
        // bluesky's cdn responds with wrong content-type for the hls playlist,
        // so we enforce it here until they fix it
        || (streamInfo.service === 'bsky' && streamInfo.url.endsWith('.m3u8'));
}

export async function handleHlsPlaylist(streamInfo, req, res) {
    let hlsPlaylist = await req.body.text();
    hlsPlaylist = HLS.parse(hlsPlaylist);

    hlsPlaylist = hlsPlaylist.isMasterPlaylist
        ? transformMasterPlaylist(streamInfo, hlsPlaylist)
        : transformMediaPlaylist(streamInfo, hlsPlaylist);

    hlsPlaylist = HLS.stringify(hlsPlaylist);

    res.send(hlsPlaylist);
}

async function getSegmentSize(url, config) {
    const segmentResponse = await request(url, {
        ...config,
        throwOnError: true
    });

    if (segmentResponse.headers['content-length']) {
        segmentResponse.body.dump();
        return +segmentResponse.headers['content-length'];
    }

    // if the response does not have a content-length
    // header, we have to compute it ourselves
    let size = 0;

    for await (const data of segmentResponse.body) {
        size += data.length;
    }

    return size;
}

export async function probeInternalHLSTunnel(streamInfo) {
    const { url, headers, dispatcher, signal } = streamInfo;

    // remove all falsy headers
    Object.keys(headers).forEach(key => {
        if (!headers[key]) delete headers[key];
    });

    const config = { headers, dispatcher, signal, maxRedirections: 16 };

    const manifestResponse = await fetch(url, config);

    const manifest = HLS.parse(await manifestResponse.text());
    // master playlists have no segments, only variants
    if (!manifest.segments?.length)
        return -1;

    const segmentSamples = await Promise.all(
        Array(5).fill().map(async () => {
            const manifestIdx = Math.floor(Math.random() * manifest.segments.length);
            const randomSegment = manifest.segments[manifestIdx];
            if (!randomSegment.uri)
                throw "segment is missing URI";

            let segmentUrl;

            if (getURL(randomSegment.uri)) {
                segmentUrl = new URL(randomSegment.uri);
            } else {
                segmentUrl = new URL(randomSegment.uri, streamInfo.url);
            }

            const segmentSize = await getSegmentSize(segmentUrl, config) / randomSegment.duration;
            return segmentSize;
        })
    );

    const averageBitrate = segmentSamples.reduce((a, b) => a + b) / segmentSamples.length;
    const totalDuration = manifest.segments.reduce((acc, segment) => acc + segment.duration, 0);

    return averageBitrate * totalDuration;
}
