import { strict as assert } from "node:assert";

import { env } from "../config.js";
import { createResponse } from "../processing/request.js";

import { testers } from "./service-patterns.js";
import matchAction from "./match-action.js";

import { friendlyServiceName } from "./service-alias.js";

import bilibili from "./services/bilibili.js";
import reddit from "./services/reddit.js";
import twitter from "./services/twitter.js";
import youtube from "./services/youtube.js";
import vk from "./services/vk.js";
import ok from "./services/ok.js";
import tiktok from "./services/tiktok.js";
import tumblr from "./services/tumblr.js";
import vimeo from "./services/vimeo.js";
import soundcloud from "./services/soundcloud.js";
import instagram from "./services/instagram.js";
import pinterest from "./services/pinterest.js";
import streamable from "./services/streamable.js";
import twitch from "./services/twitch.js";
import rutube from "./services/rutube.js";
import dailymotion from "./services/dailymotion.js";
import snapchat from "./services/snapchat.js";
import loom from "./services/loom.js";
import facebook from "./services/facebook.js";
import bluesky from "./services/bluesky.js";
import xiaohongshu from "./services/xiaohongshu.js";
import newgrounds from "./services/newgrounds.js";

let freebind;

export default async function({ host, patternMatch, params, authType }) {
    const { url } = params;
    assert(url instanceof URL);
    let dispatcher, requestIP;

    if (env.freebindCIDR) {
        if (!freebind) {
            freebind = await import('freebind');
        }

        requestIP = freebind.ip.random(env.freebindCIDR);
        dispatcher = freebind.dispatcherFromIP(requestIP, { strict: false });
    }

    try {
        let r,
            isAudioOnly = params.downloadMode === "audio",
            isAudioMuted = params.downloadMode === "mute";

        if (!testers[host]) {
            return createResponse("error", {
                code: "error.api.service.unsupported"
            });
        }
        if (!(testers[host](patternMatch))) {
            return createResponse("error", {
                code: "error.api.link.unsupported",
                context: {
                    service: friendlyServiceName(host),
                }
            });
        }

        // youtubeHLS will be fully removed in the future
        let youtubeHLS = params.youtubeHLS;
        const hlsEnv = env.enableDeprecatedYoutubeHls;

        if (hlsEnv === "never" || (hlsEnv === "key" && authType !== "key")) {
            youtubeHLS = false;
        }

        const subtitleLang =
            params.subtitleLang !== "none" ? params.subtitleLang : undefined;

        switch (host) {
            case "twitter":
                r = await twitter({
                    id: patternMatch.id,
                    index: patternMatch.index - 1,
                    toGif: !!params.convertGif,
                    alwaysProxy: params.alwaysProxy,
                    dispatcher,
                    subtitleLang
                });
                break;

            case "vk":
                r = await vk({
                    ownerId: patternMatch.ownerId,
                    videoId: patternMatch.videoId,
                    accessKey: patternMatch.accessKey,
                    quality: params.videoQuality,
                    subtitleLang,
                });
                break;

            case "ok":
                r = await ok({
                    id: patternMatch.id,
                    quality: params.videoQuality
                });
                break;

            case "bilibili":
                r = await bilibili(patternMatch);
                break;

            case "youtube":
                let fetchInfo = {
                    dispatcher,
                    id: patternMatch.id.slice(0, 11),
                    quality: params.videoQuality,
                    codec: params.youtubeVideoCodec,
                    container: params.youtubeVideoContainer,
                    isAudioOnly,
                    isAudioMuted,
                    dubLang: params.youtubeDubLang,
                    youtubeHLS,
                    subtitleLang,
                }

                if (url.hostname === "music.youtube.com" || isAudioOnly) {
                    fetchInfo.quality = "1080";
                    fetchInfo.codec = "vp9";
                    fetchInfo.isAudioOnly = true;
                    fetchInfo.isAudioMuted = false;

                    if (env.ytAllowBetterAudio && params.youtubeBetterAudio) {
                        fetchInfo.quality = "max";
                    }
                }

                r = await youtube(fetchInfo);
                break;

            case "reddit":
                r = await reddit({
                    ...patternMatch,
                    dispatcher,
                });
                break;

            case "tiktok":
                r = await tiktok({
                    postId: patternMatch.postId,
                    shortLink: patternMatch.shortLink,
                    fullAudio: params.tiktokFullAudio,
                    isAudioOnly,
                    h265: params.allowH265,
                    alwaysProxy: params.alwaysProxy,
                    subtitleLang,
                });
                break;

            case "tumblr":
                r = await tumblr({
                    id: patternMatch.id,
                    user: patternMatch.user,
                    url
                });
                break;

            case "vimeo":
                r = await vimeo({
                    id: patternMatch.id.slice(0, 11),
                    password: patternMatch.password,
                    quality: params.videoQuality,
                    isAudioOnly,
                    subtitleLang,
                });
                break;

            case "soundcloud":
                isAudioOnly = true;
                isAudioMuted = false;
                r = await soundcloud({
                    ...patternMatch,
                    format: params.audioFormat,
                });
                break;

            case "instagram":
                r = await instagram({
                    ...patternMatch,
                    quality: params.videoQuality,
                    alwaysProxy: params.alwaysProxy,
                    dispatcher
                })
                break;

            case "pinterest":
                r = await pinterest({
                    id: patternMatch.id,
                    shortLink: patternMatch.shortLink || false
                });
                break;

            case "streamable":
                r = await streamable({
                    id: patternMatch.id,
                    quality: params.videoQuality,
                    isAudioOnly,
                });
                break;

            case "twitch":
                r = await twitch({
                    clipId: patternMatch.clip || false,
                    quality: params.videoQuality,
                    isAudioOnly,
                });
                break;

            case "rutube":
                r = await rutube({
                    id: patternMatch.id,
                    yappyId: patternMatch.yappyId,
                    key: patternMatch.key,
                    quality: params.videoQuality,
                    isAudioOnly,
                    subtitleLang,
                });
                break;

            case "dailymotion":
                r = await dailymotion(patternMatch);
                break;

            case "snapchat":
                r = await snapchat({
                    ...patternMatch,
                    alwaysProxy: params.alwaysProxy,
                });
                break;

            case "loom":
                r = await loom({
                    id: patternMatch.id,
                    subtitleLang,
                });
                break;

            case "facebook":
                r = await facebook({
                    ...patternMatch,
                    dispatcher
                });
                break;

            case "bsky":
                r = await bluesky({
                    ...patternMatch,
                    alwaysProxy: params.alwaysProxy,
                    dispatcher
                });
                break;

            case "xiaohongshu":
                r = await xiaohongshu({
                    ...patternMatch,
                    h265: params.allowH265,
                    isAudioOnly,
                    dispatcher,
                });
                break;

            case "newgrounds":
                r = await newgrounds({
                    ...patternMatch,
                    quality: params.videoQuality,
                });
                break;

            default:
                return createResponse("error", {
                    code: "error.api.service.unsupported"
                });
        }

        if (r.isAudioOnly) {
            isAudioOnly = true;
            isAudioMuted = false;
        }

        if (r.error && r.critical) {
            return createResponse("critical", {
                code: `error.api.${r.error}`,
            })
        }

        if (r.error) {
            let context;
            switch(r.error) {
                case "content.too_long":
                    context = {
                        limit: parseFloat((env.durationLimit / 60).toFixed(2)),
                    }
                    break;

                case "fetch.fail":
                case "fetch.rate":
                case "fetch.critical":
                case "link.unsupported":
                case "content.video.unavailable":
                    context = {
                        service: friendlyServiceName(host),
                    }
                    break;
            }

            return createResponse("error", {
                code: `error.api.${r.error}`,
                context,
            })
        }

        let localProcessing = params.localProcessing;
        const lpEnv = env.forceLocalProcessing;
        const shouldForceLocal = lpEnv === "always" || (lpEnv === "session" && authType === "session");
        const localDisabled = (!localProcessing || localProcessing === "disabled");

        if (shouldForceLocal && localDisabled) {
            localProcessing = "preferred";
        }

        return matchAction({
            r,
            host,
            audioFormat: params.audioFormat,
            isAudioOnly,
            isAudioMuted,
            disableMetadata: params.disableMetadata,
            filenameStyle: params.filenameStyle,
            convertGif: params.convertGif,
            requestIP,
            audioBitrate: params.audioBitrate,
            alwaysProxy: params.alwaysProxy || localProcessing === "forced",
            localProcessing,
        })
    } catch {
        return createResponse("error", {
            code: "error.api.fetch.critical",
            context: {
                service: friendlyServiceName(host),
            }
        })
    }
}
