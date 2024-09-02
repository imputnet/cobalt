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
import vine from "./services/vine.js";
import pinterest from "./services/pinterest.js";
import streamable from "./services/streamable.js";
import twitch from "./services/twitch.js";
import rutube from "./services/rutube.js";
import dailymotion from "./services/dailymotion.js";
import snapchat from "./services/snapchat.js";
import loom from "./services/loom.js";
import facebook from "./services/facebook.js";
import bluesky from "./services/bluesky.js";

let freebind;

export default async function({ host, patternMatch, params }) {
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

        switch (host) {
            case "twitter":
                r = await twitter({
                    id: patternMatch.id,
                    index: patternMatch.index - 1,
                    toGif: !!params.twitterGif,
                    alwaysProxy: params.alwaysProxy,
                    dispatcher
                });
                break;

            case "vk":
                r = await vk({
                    userId: patternMatch.userId,
                    videoId: patternMatch.videoId,
                    quality: params.videoQuality
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
                    id: patternMatch.id.slice(0, 11),
                    quality: params.videoQuality,
                    format: params.youtubeVideoCodec,
                    isAudioOnly,
                    isAudioMuted,
                    dubLang: params.youtubeDubLang,
                    dispatcher
                }

                if (url.hostname === "music.youtube.com" || isAudioOnly) {
                    fetchInfo.quality = "max";
                    fetchInfo.format = "vp9";
                    fetchInfo.isAudioOnly = true;
                    fetchInfo.isAudioMuted = false;
                }

                r = await youtube(fetchInfo);
                break;

            case "reddit":
                r = await reddit({
                    sub: patternMatch.sub,
                    id: patternMatch.id,
                    user: patternMatch.user
                });
                break;

            case "tiktok":
                r = await tiktok({
                    postId: patternMatch.postId,
                    id: patternMatch.id,
                    fullAudio: params.tiktokFullAudio,
                    isAudioOnly,
                    h265: params.tiktokH265,
                    alwaysProxy: params.alwaysProxy,
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
                });
                break;

            case "soundcloud":
                isAudioOnly = true;
                isAudioMuted = false;
                r = await soundcloud({
                    url,
                    author: patternMatch.author,
                    song: patternMatch.song,
                    format: params.audioFormat,
                    shortLink: patternMatch.shortLink || false,
                    accessKey: patternMatch.accessKey || false
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

            case "vine":
                r = await vine({
                    id: patternMatch.id
                });
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
                    id: patternMatch.id
                });
                break;

            case "facebook":
                r = await facebook({
                    ...patternMatch
                });
                break;

            case "bsky":
                r = await bluesky({
                    ...patternMatch,
                    alwaysProxy: params.alwaysProxy
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
                        limit: env.durationLimit / 60,
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

        return matchAction({
            r,
            host,
            audioFormat: params.audioFormat,
            isAudioOnly,
            isAudioMuted,
            disableMetadata: params.disableMetadata,
            filenameStyle: params.filenameStyle,
            twitterGif: params.twitterGif,
            requestIP,
            audioBitrate: params.audioBitrate,
            alwaysProxy: params.alwaysProxy,
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
