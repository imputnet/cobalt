import HLS from "hls-parser";
import { genericUserAgent } from "../../config.js";
import { createStream } from "../../stream/manage.js";
import { getCookie, updateCookie } from "../cookie/manager.js";

const graphqlURL = 'https://api.x.com/graphql/4Siu98E55GquhG52zHdY5w/TweetDetail';
const tokenURL = 'https://api.x.com/1.1/guest/activate.json';

const tweetFeatures = JSON.stringify({"rweb_video_screen_enabled":false,"payments_enabled":false,"rweb_xchat_enabled":false,"profile_label_improvements_pcf_label_in_post_enabled":true,"rweb_tipjar_consumption_enabled":true,"verified_phone_label_enabled":false,"creator_subscriptions_tweet_preview_api_enabled":true,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"premium_content_api_read_enabled":false,"communities_web_enable_tweet_community_results_fetch":true,"c9s_tweet_anatomy_moderator_badge_enabled":true,"responsive_web_grok_analyze_button_fetch_trends_enabled":false,"responsive_web_grok_analyze_post_followups_enabled":true,"responsive_web_jetfuel_frame":true,"responsive_web_grok_share_attachment_enabled":true,"articles_preview_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"responsive_web_grok_show_grok_translated_post":false,"responsive_web_grok_analysis_button_from_backend":true,"creator_subscriptions_quote_tweet_preview_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"responsive_web_grok_image_annotation_enabled":true,"responsive_web_grok_imagine_annotation_enabled":true,"responsive_web_grok_community_note_auto_translation_is_enabled":false,"responsive_web_enhance_cards_enabled":false});

const tweetFieldToggles = JSON.stringify({"withArticleRichContentState":true,"withArticlePlainText":false,"withGrokAnalyze":false,"withDisallowedReplyControls":false});

const commonHeaders = {
    "user-agent": genericUserAgent,
    "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
    "x-twitter-client-language": "en",
    "x-twitter-active-user": "yes",
    "accept-language": "en"
}

// fix all videos affected by the container bug in twitter muxer (took them over two weeks to fix it????)
const TWITTER_EPOCH = 1288834974657n;
const badContainerStart = new Date(1701446400000);
const badContainerEnd = new Date(1702605600000);

function needsFixing(media) {
    const representativeId = media.source_status_id_str ?? media.id_str;

    // syndication api doesn't have media ids in its response,
    // so we just assume it's all good
    if (!representativeId) return false;

    const mediaTimestamp = new Date(
        Number((BigInt(representativeId) >> 22n) + TWITTER_EPOCH)
    );
    return mediaTimestamp > badContainerStart && mediaTimestamp < badContainerEnd
}

function bestQuality(arr) {
    return arr.filter(v => v.content_type === "video/mp4")
        .reduce((a, b) => Number(a?.bitrate) > Number(b?.bitrate) ? a : b)
        .url
}

let _cachedToken;
const getGuestToken = async (dispatcher, forceReload = false) => {
    if (_cachedToken && !forceReload) {
        return _cachedToken;
    }

    const tokenResponse = await fetch(tokenURL, {
        method: 'POST',
        headers: commonHeaders,
        dispatcher
    }).then(r => r.status === 200 && r.json()).catch(() => {})

    if (tokenResponse?.guest_token) {
        return _cachedToken = tokenResponse.guest_token
    }
}

const requestSyndication = async(dispatcher, tweetId) => {
    // thank you
    // https://github.com/yt-dlp/yt-dlp/blob/05c8023a27dd37c49163c0498bf98e3e3c1cb4b9/yt_dlp/extractor/twitter.py#L1334
    const token = (id) => ((Number(id) / 1e15) * Math.PI).toString(36).replace(/(0+|\.)/g, '');
    const syndicationUrl = new URL("https://cdn.syndication.twimg.com/tweet-result");

    syndicationUrl.searchParams.set("id", tweetId);
    syndicationUrl.searchParams.set("token", token(tweetId));

    const result = await fetch(syndicationUrl, {
        headers: {
            "user-agent": genericUserAgent
        },
        dispatcher
    });

    return result;
}

const requestTweet = async(dispatcher, tweetId, token, cookie) => {
    const graphqlTweetURL = new URL(graphqlURL);

    let headers = {
        ...commonHeaders,
        'content-type': 'application/json',
        'x-guest-token': token,
        cookie: `guest_id=${encodeURIComponent(`v1:${token}`)}`
    }

    if (cookie) {
        headers = {
            ...commonHeaders,
            'content-type': 'application/json',
            'X-Twitter-Auth-Type': 'OAuth2Session',
            'x-csrf-token': cookie.values().ct0,
            cookie
        }
    }

    graphqlTweetURL.searchParams.set('variables',
        JSON.stringify({
            focalTweetId: tweetId,
            with_rux_injections: false,
            rankingMode: "Relevance",
            includePromotedContent: true,
            withCommunity: true,
            withQuickPromoteEligibilityTweetFields: true,
            withBirdwatchNotes: true,
            withVoice: true
        })
    );
    graphqlTweetURL.searchParams.set('features', tweetFeatures);
    graphqlTweetURL.searchParams.set('fieldToggles', tweetFieldToggles);

    let result = await fetch(graphqlTweetURL, { headers, dispatcher });
    updateCookie(cookie, result.headers);

    // we might have been missing the ct0 cookie, retry
    if (result.status === 403 && result.headers.get('set-cookie')) {
        const cookieValues = cookie?.values();
        if (cookieValues?.ct0) {
            result = await fetch(graphqlTweetURL, {
                headers: {
                    ...headers,
                    'x-csrf-token': cookieValues.ct0
                },
                dispatcher
            });
        }
    }

    return result
}

const parseCard = (cardOuter) => {
    const card = JSON.parse(
      (cardOuter?.legacy?.binding_values[0].value
       || cardOuter?.binding_values?.unified_card)?.string_value,
    );

    if (!["video_website", "image_website"].includes(card?.type)
        || !card?.media_entities
        || card?.component_objects?.media_1?.type !== "media") {
      return;
    }

    const mediaId = card.component_objects?.media_1?.data?.id;
    return [card.media_entities[mediaId]];
};

const extractGraphqlMedia = async (thread, dispatcher, id, guestToken, cookie) => {
    const addInsn = thread?.data?.threaded_conversation_with_injections_v2?.instructions?.find(
        insn => insn.type === 'TimelineAddEntries'
    );

    const tweetResult = addInsn?.entries?.find(
        entry => entry.entryId === `tweet-${id}`
    )?.content?.itemContent?.tweet_results?.result;

    let tweetTypename = tweetResult?.__typename;

    if (!tweetTypename) {
        return { error: "fetch.empty" }
    }

    if (tweetTypename === "TweetUnavailable" || tweetTypename === "TweetTombstone") {
        const reason = tweetResult?.result?.reason;
        if (reason === 'Protected') {
            return { error: "content.post.private" };
        } else if (reason === "NsfwLoggedOut" || tweetResult?.tombstone?.text?.text?.startsWith('Age-restricted')) {
            if (!cookie) {
                return { error: "content.post.age" };
            }

            const tweet = await requestTweet(dispatcher, id, guestToken, cookie).then(t => t.json());
            return extractGraphqlMedia(tweet, dispatcher, id, guestToken);
        }
    }

    if (!["Tweet", "TweetWithVisibilityResults"].includes(tweetTypename)) {
        return { error: "content.post.unavailable" }
    }

    let baseTweet = tweetResult.legacy,
        repostedTweet = baseTweet?.retweeted_status_result?.result.legacy.extended_entities;

    if (tweetTypename === "TweetWithVisibilityResults") {
        baseTweet = tweetResult.tweet.legacy;
        repostedTweet = baseTweet?.retweeted_status_result?.result.tweet.legacy.extended_entities;
    }

    if (tweetResult.card?.legacy?.binding_values?.length) {
        return parseCard(tweetResult.card);
    }

    return (repostedTweet?.media || baseTweet?.extended_entities?.media);
}

export default async function({ id, index, toGif, dispatcher, alwaysProxy, subtitleLang }) {
    const cookie = await getCookie('twitter');

    let guestToken = await getGuestToken(dispatcher);
    if (!guestToken) return { error: "fetch.fail" };

    let tweet = await requestTweet(dispatcher, id, guestToken);

    if ([403, 404, 429].includes(tweet.status)) {
        // get new token & retry if old one expired
        if ([403, 429].includes(tweet.status)) {
            guestToken = await getGuestToken(dispatcher, true);
        }
        tweet = await requestTweet(dispatcher, id, guestToken, cookie);
    }

    let media;
    try {
        tweet = await tweet.json();
        media = await extractGraphqlMedia(tweet, dispatcher, id, guestToken, cookie);
    } catch {}

    // if graphql requests fail, then resort to tweet embed api
    if (!media || 'error' in media) {
        try {
            tweet = await requestSyndication(dispatcher, id);
            tweet = await tweet.json();

            if (tweet?.card) {
                media = parseCard(tweet.card);
            }
        } catch {}

        media = tweet?.mediaDetails ?? media;
    }

    if (!media || 'error' in media) {
        return { error: media?.error || "fetch.empty" };
    }

    // check if there's a video at given index (/video/<index>)
    if (index >= 0 && index < media?.length) {
        media = [media[index]]
    }

    const getFileExt = (url) => new URL(url).pathname.split(".", 2)[1];

    const proxyMedia = (url, filename) => createStream({
        service: "twitter",
        type: "proxy",
        url, filename,
    });

    const extractSubtitles = async (hlsUrl) => {
        const mainHls = await fetch(hlsUrl).then(r => r.text()).catch(() => {});
        if (!mainHls) return;

        const subtitle = HLS.parse(mainHls)?.variants[0]?.subtitles?.find(
            s => s.language.startsWith(subtitleLang)
        );
        if (!subtitle) return;

        const subtitleUrl = new URL(subtitle.uri, hlsUrl).toString();
        const subtitleHls = await fetch(subtitleUrl).then(r => r.text());
        if (!subtitleHls) return;

        const finalSubtitlePath = HLS.parse(subtitleHls)?.segments?.[0].uri;
        if (!finalSubtitlePath) return;

        const finalSubtitleUrl = new URL(finalSubtitlePath, hlsUrl).toString();

        return {
            url: finalSubtitleUrl,
            language: subtitle.language,
        };
    }

    switch (media?.length) {
        case undefined:
        case 0:
            return {
                error: "fetch.empty"
            }
        case 1:
            const mediaItem = media[0];
            if (mediaItem.type === "photo") {
                return {
                    type: "proxy",
                    isPhoto: true,
                    filename: `twitter_${id}.${getFileExt(mediaItem.media_url_https)}`,
                    urls: `${mediaItem.media_url_https}?name=4096x4096`
                }
            }

            let subtitles;
            let fileMetadata;
            if (mediaItem.type === "video" && subtitleLang) {
                const hlsVariant = mediaItem.video_info?.variants?.find(
                    v => v.content_type === "application/x-mpegURL"
                );
                if (hlsVariant) {
                    const { url, language } = await extractSubtitles(hlsVariant.url) || {};
                    subtitles = url;
                    if (language) fileMetadata = { sublanguage: language };
                }
            }

            return {
                type: subtitles || needsFixing(mediaItem) ? "remux" : "proxy",
                urls: bestQuality(mediaItem.video_info.variants),
                filename: `twitter_${id}.mp4`,
                audioFilename: `twitter_${id}_audio`,
                isGif: mediaItem.type === "animated_gif",
                subtitles,
                fileMetadata,
            }
        default:
            const proxyThumb = (url, i) =>
                proxyMedia(url, `twitter_${id}_${i + 1}.${getFileExt(url)}`);

            const picker = media.map((content, i) => {
                if (content.type === "photo") {
                    let url = `${content.media_url_https}?name=4096x4096`;
                    let proxiedImage = proxyThumb(url, i);

                    if (alwaysProxy) url = proxiedImage;

                    return {
                        type: "photo",
                        url,
                        thumb: proxiedImage,
                    }
                }

                let url = bestQuality(content.video_info.variants);
                const shouldRenderGif = content.type === "animated_gif" && toGif;
                const videoFilename = `twitter_${id}_${i + 1}.${shouldRenderGif ? "gif" : "mp4"}`;

                let type = "video";
                if (shouldRenderGif) type = "gif";

                if (needsFixing(content) || shouldRenderGif) {
                    url = createStream({
                        service: "twitter",
                        type: shouldRenderGif ? "gif" : "remux",
                        url,
                        filename: videoFilename,
                    })
                } else if (alwaysProxy) {
                    url = proxyMedia(url, videoFilename);
                }

                return {
                    type,
                    url,
                    thumb: proxyThumb(content.media_url_https, i),
                }
            });
            return { picker };
    }
}
