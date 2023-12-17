import { genericUserAgent } from "../../config.js";
import { createStream } from "../../stream/manage.js";

// fix all videos affected by the container bug in twitter muxer (took them over two weeks to fix it????)
const TWITTER_EPOCH = 1288834974657n;
const badContainerStart = new Date(1701446400000);
const badContainerEnd = new Date(1702605600000);

function needsFixing(media) {
    const representativeId = media.source_status_id_str ?? media.id_str;
    const mediaTimestamp = new Date(
        Number((BigInt(representativeId) >> 22n) + TWITTER_EPOCH)
    )
    return mediaTimestamp > badContainerStart && mediaTimestamp < badContainerEnd;
}

function bestQuality(arr) {
    return arr.filter(v => v["content_type"] === "video/mp4").sort((a, b) => Number(b.bitrate) - Number(a.bitrate))[0]["url"]
}

export default async function(obj) {
    let _headers = {
        "user-agent": genericUserAgent,
        "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
        "host": "api.twitter.com",
        "x-twitter-client-language": "en",
        "x-twitter-active-user": "yes",
        "accept-language": "en"
    };

    let activateURL = `https://api.twitter.com/1.1/guest/activate.json`;
    let graphqlTweetURL = `https://twitter.com/i/api/graphql/5GOHgZe-8U2j5sVHQzEm9A/TweetResultByRestId`;

    let req_act = await fetch(activateURL, {
        method: "POST",
        headers: _headers
    }).then((r) => { return r.status === 200 ? r.json() : false }).catch(() => { return false });
    if (!req_act) return { error: 'ErrorCouldntFetch' };

    _headers["host"] = "twitter.com";
    _headers["content-type"] = "application/json";

    _headers["x-guest-token"] = req_act["guest_token"];
    _headers["cookie"] = `guest_id=v1%3A${req_act["guest_token"]}`;

    let query = {
        variables: { "tweetId": obj.id, "withCommunity": false, "includePromotedContent": false, "withVoice": false },
        features: { "creator_subscriptions_tweet_preview_api_enabled": true, "c9s_tweet_anatomy_moderator_badge_enabled": true, "tweetypie_unmention_optimization_enabled": true, "responsive_web_edit_tweet_api_enabled": true, "graphql_is_translatable_rweb_tweet_is_translatable_enabled": true, "view_counts_everywhere_api_enabled": true, "longform_notetweets_consumption_enabled": true, "responsive_web_twitter_article_tweet_consumption_enabled": false, "tweet_awards_web_tipping_enabled": false, "responsive_web_home_pinned_timelines_enabled": true, "freedom_of_speech_not_reach_fetch_enabled": true, "standardized_nudges_misinfo": true, "tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled": true, "longform_notetweets_rich_text_read_enabled": true, "longform_notetweets_inline_media_enabled": true, "responsive_web_graphql_exclude_directive_enabled": true, "verified_phone_label_enabled": false, "responsive_web_media_download_video_enabled": false, "responsive_web_graphql_skip_user_profile_image_extensions_enabled": false, "responsive_web_graphql_timeline_navigation_enabled": true, "responsive_web_enhance_cards_enabled": false }
    }
    query.variables = encodeURIComponent(JSON.stringify(query.variables));
    query.features = encodeURIComponent(JSON.stringify(query.features));
    query = `${graphqlTweetURL}?variables=${query.variables}&features=${query.features}`;

    let tweet = await fetch(query, { headers: _headers }).then((r) => {
        return r.status === 200 ? r.json() : false
    }).catch(() => { return false });

    // {"data":{"tweetResult":{"result":{"__typename":"TweetUnavailable","reason":"Protected"}}}}
    if (tweet?.data?.tweetResult?.result?.__typename !== "Tweet") {
        return { error: 'ErrorTweetUnavailable' }
    }

    let baseMedia,
        baseTweet = tweet.data.tweetResult.result.legacy;

    if (baseTweet.retweeted_status_result?.result.legacy.extended_entities.media) {
        baseMedia = baseTweet.retweeted_status_result.result.legacy.extended_entities
    } else if (baseTweet.extended_entities?.media) {
        baseMedia = baseTweet.extended_entities
    }
    if (!baseMedia) return { error: 'ErrorNoVideosInTweet' };

    let single, multiple = [], media = baseMedia["media"];
    media = media.filter((i) => { if (i["type"] === "video" || i["type"] === "animated_gif") return true });

    if (media.length === 0) {
        return { error: 'ErrorNoVideosInTweet' }
    }

    if (media.length > 1) {
        for (let i in media) {
            let downloadUrl = bestQuality(media[i]["video_info"]["variants"]);
            if (needsFixing(media[i])) {
                downloadUrl = createStream({
                    service: "twitter",
                    type: "remux",
                    u: bestQuality(media[i]["video_info"]["variants"]),
                    filename: `twitter_${obj.id}_${Number(i) + 1}.mp4`
                })
            }
            multiple.push({
                type: "video",
                thumb: media[i]["media_url_https"],
                url: downloadUrl
            })
        }
    } else {
        single = bestQuality(media[0]["video_info"]["variants"])
    }

    if (single) {
        return {
            type: needsFixing(media[0]) ? "remux" : "normal",
            urls: single,
            filename: `twitter_${obj.id}.mp4`,
            audioFilename: `twitter_${obj.id}_audio`
        }
    } else if (multiple) {
        return { picker: multiple }
    } else {
        return { error: 'ErrorNoVideosInTweet' }
    }
}
