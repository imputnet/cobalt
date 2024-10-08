import { genericUserAgent } from "../../config.js";
import { createStream } from "../../stream/manage.js";
import { getCookie, updateCookie } from "../cookie/manager.js";

const graphqlURL = 'https://api.x.com/graphql/I9GDzyCGZL2wSoYFFrrTVw/TweetResultByRestId';
const tokenURL = 'https://api.x.com/1.1/guest/activate.json';

const tweetFeatures = JSON.stringify({"creator_subscriptions_tweet_preview_api_enabled":true,"communities_web_enable_tweet_community_results_fetch":true,"c9s_tweet_anatomy_moderator_badge_enabled":true,"articles_preview_enabled":true,"tweetypie_unmention_optimization_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"view_counts_everywhere_api_enabled":true,"longform_notetweets_consumption_enabled":true,"responsive_web_twitter_article_tweet_consumption_enabled":true,"tweet_awards_web_tipping_enabled":false,"creator_subscriptions_quote_tweet_preview_enabled":false,"freedom_of_speech_not_reach_fetch_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":true,"rweb_video_timestamps_enabled":true,"longform_notetweets_rich_text_read_enabled":true,"longform_notetweets_inline_media_enabled":true,"rweb_tipjar_consumption_enabled":true,"responsive_web_graphql_exclude_directive_enabled":true,"verified_phone_label_enabled":false,"responsive_web_graphql_skip_user_profile_image_extensions_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":true,"responsive_web_enhance_cards_enabled":false});

const tweetFieldToggles = JSON.stringify({"withArticleRichContentState":true,"withArticlePlainText":false,"withGrokAnalyze":false});

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
            tweetId,
            withCommunity: false,
            includePromotedContent: false,
            withVoice: false
        })
    );
    graphqlTweetURL.searchParams.set('features', tweetFeatures);
    graphqlTweetURL.searchParams.set('fieldToggles', tweetFieldToggles);

    let result = await fetch(graphqlTweetURL, { headers, dispatcher });
    updateCookie(cookie, result.headers);

    // we might have been missing the `ct0` cookie, retry
    if (result.status === 403 && result.headers.get('set-cookie')) {
        result = await fetch(graphqlTweetURL, {
            headers: {
                ...headers,
                'x-csrf-token': cookie.values().ct0
            },
            dispatcher
        });
    }

    return result
}

export default async function({ id, index, toGif, dispatcher, alwaysProxy }) {
    const cookie = await getCookie('twitter');

    let guestToken = await getGuestToken(dispatcher);
    if (!guestToken) return { error: "fetch.fail" };

    let tweet = await requestTweet(dispatcher, id, guestToken);

    // get new token & retry if old one expired
    if ([403, 429].includes(tweet.status)) {
        guestToken = await getGuestToken(dispatcher, true);
        tweet = await requestTweet(dispatcher, id, guestToken)
    }

    tweet = await tweet.json();

    let tweetTypename = tweet?.data?.tweetResult?.result?.__typename;

    if (!tweetTypename) {
        return { error: "fetch.empty" }
    }

    if (tweetTypename === "TweetUnavailable") {
        const reason = tweet?.data?.tweetResult?.result?.reason;
        switch(reason) {
            case "Protected":
                return { error: "content.post.private" }
            case "NsfwLoggedOut":
                if (cookie) {
                    tweet = await requestTweet(dispatcher, id, guestToken, cookie);
                    tweet = await tweet.json();
                    tweetTypename = tweet?.data?.tweetResult?.result?.__typename;
                } else return { error: "content.post.age" }
        }
    }

    if (!["Tweet", "TweetWithVisibilityResults"].includes(tweetTypename)) {
        return { error: "content.post.unavailable" }
    }

    let tweetResult = tweet.data.tweetResult.result,
        baseTweet = tweetResult.legacy,
        repostedTweet = baseTweet?.retweeted_status_result?.result.legacy.extended_entities;

    if (tweetTypename === "TweetWithVisibilityResults") {
        baseTweet = tweetResult.tweet.legacy;
        repostedTweet = baseTweet?.retweeted_status_result?.result.tweet.legacy.extended_entities;
    }

    let media = (repostedTweet?.media || baseTweet?.extended_entities?.media);

    // check if there's a video at given index (/video/<index>)
    if (index >= 0 && index < media?.length) {
        media = [media[index]]
    }

    const getFileExt = (url) => new URL(url).pathname.split(".", 2)[1];

    const proxyMedia = (u, filename) => createStream({
        service: "twitter",
        type: "proxy",
        u, filename,
    })

    switch (media?.length) {
        case undefined:
        case 0:
            return {
                error: "fetch.empty"
            }
        case 1:
            if (media[0].type === "photo") {
                return {
                    type: "proxy",
                    isPhoto: true,
                    filename: `twitter_${id}.${getFileExt(media[0].media_url_https)}`,
                    urls: `${media[0].media_url_https}?name=4096x4096`
                }
            }

            return {
                type: needsFixing(media[0]) ? "remux" : "proxy",
                urls: bestQuality(media[0].video_info.variants),
                filename: `twitter_${id}.mp4`,
                audioFilename: `twitter_${id}_audio`,
                isGif: media[0].type === "animated_gif"
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
                const videoFilename = `twitter_${id}_${i + 1}.mp4`;

                let type = "video";
                if (shouldRenderGif) type = "gif";

                if (needsFixing(content) || shouldRenderGif) {
                    url = createStream({
                        service: "twitter",
                        type: shouldRenderGif ? "gif" : "remux",
                        u: url,
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
