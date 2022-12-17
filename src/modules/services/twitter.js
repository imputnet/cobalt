import { genericUserAgent } from "../config.js";

function bestQuality(arr) {
    return arr.filter((v) => { if (v["content_type"] === "video/mp4") return true; }).sort((a, b) => Number(b.bitrate) - Number(a.bitrate))[0]["url"].split("?")[0]
}
const apiURL = "https://api.twitter.com/1.1"

export default async function(obj) {
    try {
        let _headers = {
            "user-agent": genericUserAgent,
            "authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
            "host": "api.twitter.com"
        };
        let req_act = await fetch(`${apiURL}/guest/activate.json`, {
            method: "POST",
            headers: _headers
        }).then(async (r) => { return r.status == 200 ? r.json() : false;}).catch(() => {return false});
        
        if (!req_act) return { error: 'ErrorCouldntFetch' };
        _headers["x-guest-token"] = req_act["guest_token"];
        let showURL = `${apiURL}/statuses/show/${obj.id}.json?tweet_mode=extended&include_user_entities=0&trim_user=1&include_entities=0&cards_platform=Web-12&include_cards=1`
        if (!obj.spaceId) {
            let req_status = await fetch(showURL, { headers: _headers }).then(async (r) => { return r.status == 200 ? r.json() : false;}).catch((e) => { return false});
            if (!req_status) {
                _headers.authorization = "Bearer AAAAAAAAAAAAAAAAAAAAAPYXBAAAAAAACLXUNDekMxqa8h%2F40K4moUkGsoc%3DTYfbDKbT3jJPCEVnMYqilB28NHfOPqkca3qaAxGfsyKCs0wRbw";
                delete _headers["x-guest-token"]

                req_act = await fetch(`${apiURL}/guest/activate.json`, {
                    method: "POST",
                    headers: _headers
                }).then(async (r) => { return r.status == 200 ? r.json() : false;}).catch(() => {return false});
                if (!req_act) return { error: 'ErrorCouldntFetch' };

                _headers["x-guest-token"] = req_act["guest_token"];
                req_status = await fetch(showURL, { headers: _headers }).then(async (r) => { return r.status == 200 ? r.json() : false;}).catch(() => {return false});
            }
            if (!req_status) return { error: 'ErrorCouldntFetch' }
            if (req_status["extended_entities"] && req_status["extended_entities"]["media"]) {
                let single, multiple = [], media = req_status["extended_entities"]["media"];
                media = media.filter((i) => { if (i["type"] === "video" || i["type"] === "animated_gif") return true })
                if (media.length > 1) {
                    for (let i in media) { multiple.push({type: "video", thumb: media[i]["media_url_https"], url: bestQuality(media[i]["video_info"]["variants"])}) }
                } else if (media.length > 0) {
                    single = bestQuality(media[0]["video_info"]["variants"])
                } else {
                    return { error: 'ErrorNoVideosInTweet' }
                }
                if (single) {
                    return { urls: single, filename: `twitter_${obj.id}.mp4`, audioFilename: `twitter_${obj.id}_audio` }
                } else if (multiple) {
                    return { picker: multiple }
                } else {
                    return { error: 'ErrorNoVideosInTweet' }
                }
            } else {
                return { error: 'ErrorNoVideosInTweet' }
            }
        } else {
            _headers["host"] = "twitter.com"
            _headers["content-type"] = "application/json"
            let query = {
                variables: {"id": obj.spaceId,"isMetatagsQuery":true,"withSuperFollowsUserFields":true,"withDownvotePerspective":false,"withReactionsMetadata":false,"withReactionsPerspective":false,"withSuperFollowsTweetFields":true,"withReplays":true}, features: {"spaces_2022_h2_clipping":true,"spaces_2022_h2_spaces_communities":true,"verified_phone_label_enabled":false,"tweetypie_unmention_optimization_enabled":true,"responsive_web_uc_gql_enabled":true,"vibe_api_enabled":true,"responsive_web_edit_tweet_api_enabled":true,"graphql_is_translatable_rweb_tweet_is_translatable_enabled":true,"standardized_nudges_misinfo":true,"tweet_with_visibility_results_prefer_gql_limited_actions_policy_enabled":false,"responsive_web_graphql_timeline_navigation_enabled":false,"interactive_text_enabled":true,"responsive_web_text_conversations_enabled":false,"responsive_web_enhance_cards_enabled":true}
            }

            let AudioSpaceById = await fetch(`https://twitter.com/i/api/graphql/wJ5g4zf7v8qPHSQbaozYuw/AudioSpaceById?variables=${new URLSearchParams(JSON.stringify(query.variables)).toString().slice(0, -1)}&features=${new URLSearchParams(JSON.stringify(query.features)).toString().slice(0, -1)}`, { headers: _headers }).then(async (r) => {
                return r.status == 200 ? r.json() : false;
            }).catch((e) => {return false});

            if (AudioSpaceById) {
                if (AudioSpaceById.data.audioSpace.metadata.is_space_available_for_replay === true) {
                    let streamStatus = await fetch(`https://twitter.com/i/api/1.1/live_video_stream/status/${AudioSpaceById.data.audioSpace.metadata.media_key}`, { headers: _headers }).then(async (r) => {return r.status == 200 ? r.json() : false;}).catch(() => {return false;});
                    if (!streamStatus) return { error: 'ErrorCouldntFetch' };
    
                    let participants = AudioSpaceById.data.audioSpace.participants.speakers
                    let listOfParticipants = `Twitter Space speakers: `
                    for (let i in participants) {
                        listOfParticipants += `@${participants[i]["twitter_screen_name"]}, `
                    }
                    listOfParticipants = listOfParticipants.slice(0, -2);
                    return {
                        urls: streamStatus.source.noRedirectPlaybackUrl,
                        audioFilename: `twitterspaces_${obj.spaceId}`,
                        isAudioOnly: true,
                        fileMetadata: {
                            title: AudioSpaceById.data.audioSpace.metadata.title,
                            artist: `Twitter Space by @${AudioSpaceById.data.audioSpace.metadata.creator_results.result.legacy.screen_name}`,
                            comment: listOfParticipants,
                            // cover: AudioSpaceById.data.audioSpace.metadata.creator_results.result.legacy.profile_image_url_https.replace("_normal", "")
                        }
                    }
                } else {
                    return { error: 'TwitterSpaceWasntRecorded' };
                }
            } else {
                return { error: 'ErrorEmptyDownload' }
            }
        }
    } catch (err) {
        return { error: 'ErrorBadFetch' };
    }
}
