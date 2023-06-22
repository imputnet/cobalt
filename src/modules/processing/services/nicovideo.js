import { genericUserAgent, maxVideoDuration } from "../../config.js";

/**
 * Regex for parsing the HTML element containing the JSON object used to
 * authenticate the request for the video stream.
 */
const JS_INITIAL_WATCH_DATA_REGEX = /<div[^>]+id="js-initial-watch-data"[^>]+data-api-data="([^"]+)"/;

/**
 * Undo html escaping. e.g. `&quot;` -> `"`
 *
 * @param {string} input Possibly escaped string
 *
 * @returns `input` with escaped characters un-escaped
 */
const unescapeHtml = input => {
    return input
        .replaceAll("&amp;", "&")
        .replaceAll("&lt;", "<")
        .replaceAll("&gt;", ">")
        .replaceAll("&quot;", "\"")
        .replaceAll("&#039;", "'");
}

export default async function(obj) {
    // Step 1: We need to retrieve a JSON object from an element with ID
    // `js-initial-watch-data`.
    const videoPageBody = await fetch(`https://www.nicovideo.jp/watch/${obj.id}`, {
        headers: { "user-agent": genericUserAgent }
    }).then(res => res.text());

    const matches = JS_INITIAL_WATCH_DATA_REGEX.exec(videoPageBody);
    if (matches?.length < 2) return { error: 'ErrorCouldntFetch' }; 

    const jsonStr = unescapeHtml(matches[1]);

    let jsInitialWatchData = null;
    try {
        jsInitialWatchData = JSON.parse(jsonStr);
    } catch (_err) {
        return { error: 'ErrorCouldntFetch' };
    }

    const { video } = jsInitialWatchData;
    if (!video || !video.duration) {
        return { error: 'ErrorCouldntFetch' };
    }
    if (video.duration > maxVideoDuration * 1000) {
        return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };
    }

    // Step 2: We use the JSON object to send an HTTP request to retrieve
    // the m3u8 for the video stream.
    const { session } = jsInitialWatchData?.media?.delivery?.movie;
    if (!session) {
        return { error: 'ErrorCouldntFetch' };
    }
    const body = {
        session: {
            client_info: {
                player_id: session.playerId,
            },
            content_auth: {
                auth_type: session.authTypes.http,
                content_key_timeout: 600000,
                service_id: "nicovideo",
                service_user_id: session.serviceUserId
            },
            content_id: session.contentId,
            content_src_id_sets: [{
                content_src_ids: [{
                    src_id_to_mux: {
                        video_src_ids: session.videos,
                        audio_src_ids: session.audios
                    }
                }]
            }],
            content_type: "movie",
            content_uri: "",
            keep_method: {
                heartbeat: {
                    lifetime: 120000
                }
            },
            priority: 0,
            protocol: {
                name: "http",
                parameters: {
                    http_parameters: {
                        parameters: {
                            hls_parameters: {
                                use_well_known_port: "yes",
                                use_ssl: "yes",
                                transfer_preset: "",
                                segment_duration: 6000
                            }
                        }
                    }
                }
            },
            recipe_id: session.recipeId,
            session_operation_auth: {
                session_operation_auth_by_signature: {
                    signature: session.signature,
                    token: session.token
                }
            },
            timing_constraint: "unlimited"
        }
    };
    const res = await fetch("https://api.dmc.nico/api/sessions?_format=json", {
        method: "POST",
        body: JSON.stringify(body)
    }).then(res => res.json());

    if (res?.meta?.status !== 201) {
        return { error: 'ErrorCouldntFetch' };
    }

    const playlistUri = res?.data?.session?.content_uri;
    if (!playlistUri) {
        return { error: 'ErrorCouldntFetch' };
    }

    return {
        urls: playlistUri,
        isM3U8: true,
        filename: `nicovideo_${obj.id}.mp4`,
        audioFilename: `nicovideo_${obj.id}_audio`
    } 
}
