// YTubeDL engine adapter — translates the vendored engine's provider results
// into the extraction JSON the youtube service consumes (the same shape the
// old newpipe-bridge emitted), so the service's format-selection logic stays
// untouched.
//
// the adapter never rejects: every failure resolves to an
// { ok: false, errorClass, error } object the service maps onto a cobalt error.

import { fetch } from "undici";

import { probeUrl } from "../services/vendor/ytubedl-engine/providers/index.js";
import { getCookie } from "../cookie/manager.js";

const probeTimeoutMs = 45_000;

// map InnerTube playability failure strings onto the bridge-style exception
// names the youtube service knows how to classify. order matters: bot-check
// reasons also contain "sign in", so they must be matched before age checks.
const classifyFailures = (failures) => {
    const hay = failures.join("\n").toLowerCase();

    if (hay.includes("not a bot")) return "ReCaptchaException";
    if (hay.includes("drm")) return "DrmException";
    if (hay.includes("confirm your age") || hay.includes("age-restricted")) {
        return "AgeRestrictedContentException";
    }
    if (hay.includes("private video")) return "PrivateContentException";
    if (hay.includes("country") || hay.includes("region")) {
        return "GeographicRestrictionException";
    }
    if (hay.includes("premium") || hay.includes("paid") || hay.includes("rental")) {
        return "PaidContentException";
    }
    if (hay.includes("account associated") || hay.includes("terminated")) {
        return "AccountTerminatedException";
    }
    if (hay.includes("unavailable") || hay.includes("removed")) {
        return "ContentNotAvailableException";
    }
    return "ContentNotSupportedException";
};

// the service matches codec families ("avc1" / "vp9" / "av01") inside the
// mimeType + codec haystack; vp9's full InnerTube name ("vp09.00.51.03")
// would never match, so formats carry the family alias instead
const codecAlias = { h264: "avc1", vp9: "vp9", av1: "av01" };

const videoEntry = (f, streams) => {
    const alias = codecAlias[f.codecFamily] ?? f.codec;
    return {
        itag: f.itag,
        url: f.url ?? streams.get(f.itag)?.url,
        mimeType: `video/${f.container}; codecs="${alias}"`,
        codec: alias,
        width: f.width,
        height: f.height,
        fps: f.fps,
        bitrate: f.bitrate,
        contentLength: f.sizeBytes ?? 0,
        deliveryMethod: "PROGRESSIVE_HTTP",
    };
};

const audioEntry = (f, streams) => {
    const entry = {
        itag: f.itag,
        url: f.url ?? streams.get(f.itag)?.url,
        mimeType: f.container === "webm"
            ? 'audio/webm; codecs="opus"'
            : 'audio/mp4; codecs="mp4a.40.2"',
        codec: f.codec === "opus" ? "opus" : "mp4a",
        bitrate: f.bitrate,
        contentLength: f.sizeBytes ?? 0,
        deliveryMethod: "PROGRESSIVE_HTTP",
    };

    if (f.audioTrack) {
        entry.audioTrackId = f.audioTrack.id;
        entry.audioTrackName = f.audioTrack.name;
        if (f.audioTrack.isDefault) entry.audioTrackType = "ORIGINAL";
        // track ids look like "en.0" / "es.3": the prefix is the locale
        entry.audioLocale = (f.audioTrack.id ?? "").split(".")[0];
    }

    return entry;
};

const toServiceJson = ({ media, streams, captions }) => ({
    ok: true,
    id: media.id,
    title: media.title ?? "",
    uploader: media.author ?? "",
    description: media.description ?? "",
    duration: media.durationSec ?? 0,
    thumbnail: media.thumbnail,
    live: media.isLive === true,
    hls: media.hlsManifestUrl ?? null,
    // old cobalt never used muxed formats, so progressive entries stay out
    videoOnly: media.videoFormats
        .filter(f => !f.hasAudio && (f.url || streams.has(f.itag)))
        .map(f => videoEntry(f, streams)),
    audio: media.audioFormats
        .filter(f => f.url || streams.has(f.itag))
        .map(f => audioEntry(f, streams)),
    subtitles: media.subtitleTracks
        // po_token-locked captions reject ffmpeg's fetch; dropping them beats
        // failing the whole merge over a subtitle
        .filter(t => {
            const url = captions.get(t.id);
            return url && !url.includes("exp=xpe");
        })
        .map(t => {
            const baseUrl = captions.get(t.id);
            return {
                language: t.languageCode,
                auto: t.auto,
                // ffmpeg fetches this url itself when embedding; of youtube's
                // timedtext formats only vtt is demuxable
                url: `${baseUrl}${baseUrl.includes("?") ? "&" : "?"}fmt=vtt`,
            };
        }),
});

export const callYTubeDL = async (url, {
    probe = probeUrl,
    dispatcher,
    // rotated per request from cobalt's cookies.json; undefined leaves the
    // engine on its YTUBEDL_COOKIES file (or no cookies at all)
    cookie = getCookie('youtube')?.toString(),
} = {}) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), probeTimeoutMs);

    // the engine fetches with global fetch; this injects cobalt's per-request
    // dispatcher (freebind IP binding) without teaching the engine about undici
    const fetchImpl = dispatcher
        ? (input, init) => fetch(input, { ...init, dispatcher })
        : undefined;

    let probeResult;
    try {
        probeResult = await probe(url, {
            signal: controller.signal,
            cookieHeader: cookie,
            fetch: fetchImpl,
        });
    } catch (e) {
        if (controller.signal.aborted) {
            return {
                ok: false,
                errorClass: "EngineTimeoutException",
                error: `engine probe exceeded ${probeTimeoutMs}ms`,
            };
        }

        const failures = Array.isArray(e?.failures) ? e.failures : [];
        if (failures.length) {
            return {
                ok: false,
                errorClass: classifyFailures(failures),
                error: failures[failures.length - 1],
            };
        }

        return { ok: false, errorClass: "EngineException", error: e?.message || String(e) };
    } finally {
        clearTimeout(timer);
    }

    const { media, streams, failures = [] } = probeResult ?? {};

    if (!media) {
        return { ok: false, errorClass: "EngineException", error: "probe returned no media" };
    }

    // every client failed and only oEmbed metadata came back — there is
    // nothing downloadable, so this is a content-level failure
    if (!streams?.size) {
        return {
            ok: false,
            errorClass: classifyFailures([media.note ?? "", ...failures]),
            error: media.note ?? "no playable formats",
        };
    }

    return toServiceJson(probeResult);
};
