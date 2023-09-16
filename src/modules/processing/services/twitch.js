import { maxVideoDuration } from "../../config.js";
import { getM3U8Formats } from "../../sub/utils.js";

const gqlURL = "https://gql.twitch.tv/gql";
const m3u8URL = "https://usher.ttvnw.net";
const clientIdHead = { "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko" };

async function getClip(obj) {
    let req_metadata = await fetch(gqlURL, {
        method: "POST",
        headers: clientIdHead,
        body: JSON.stringify({
            query: `{
            clip(slug: "${obj.clipId}") {
                broadcaster {
                    login
                }
                createdAt
                curator {
                    login
                }
                durationSeconds
                id
                medium: thumbnailURL(width: 480, height: 272)
                title
                videoQualities {
                    quality
                    sourceURL
                }
            }
        }`
        })
    }).then((r) => { return r.status === 200 ? r.json() : false; }).catch(() => { return false });
    if (!req_metadata) return { error: 'ErrorCouldntFetch' };

    let clipMetadata = req_metadata.data.clip;

    if (clipMetadata.durationSeconds > maxVideoDuration / 1000) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };
    if (!clipMetadata.videoQualities || !clipMetadata.broadcaster) return { error: 'ErrorEmptyDownload' };

    let req_token = await fetch(gqlURL, {
        method: "POST",
        headers: clientIdHead,
        body: JSON.stringify([
            {
                "operationName": "VideoAccessToken_Clip",
                "variables": {
                    "slug": obj.clipId
                },
                "extensions": {
                    "persistedQuery": {
                        "version": 1,
                        "sha256Hash": "36b89d2507fce29e5ca551df756d27c1cfe079e2609642b4390aa4c35796eb11"
                    }
                }
            }
        ])
    }).then((r) => { return r.status === 200 ? r.json() : false; }).catch(() => { return false });

    if (!req_token) return { error: 'ErrorCouldntFetch' };

    let formats = clipMetadata.videoQualities;
    let format = formats.find(f => f.quality === obj.quality) || formats[0];

    return {
        type: "bridge",
        urls: `${format.sourceURL}?${new URLSearchParams({
            sig: req_token[0].data.clip.playbackAccessToken.signature,
            token: req_token[0].data.clip.playbackAccessToken.value
        })}`,
        fileMetadata: {
            title: clipMetadata.title,
            artist: `Twitch Clip by @${clipMetadata.broadcaster.login}, clipped by @${clipMetadata.curator.login}`,
        },
        filename: `twitchclip_${clipMetadata.id}_${format.quality}p.mp4`,
        audioFilename: `twitchclip_${clipMetadata.id}_audio`
    }
}
async function getVideo(obj) {
    let req_metadata = await fetch(gqlURL, {
        method: "POST",
        headers: clientIdHead,
        body: JSON.stringify([
            {
                "operationName": "VideoMetadata",
                "variables": {
                    "channelLogin": "",
                    "videoID": obj.vodId
                },
                "extensions": {
                    "persistedQuery": {
                        "version": 1,
                        "sha256Hash": "226edb3e692509f727fd56821f5653c05740242c82b0388883e0c0e75dcbf687"
                    }
                }
            }
        ])
    }).then((r) => { return r.status === 200 ? r.json() : false; }).catch(() => { return false });
    if (!req_metadata) return { error: 'ErrorCouldntFetch' };

    let vodMetadata = req_metadata[0].data.video;

    if (vodMetadata.previewThumbnailURL.endsWith('/404_processing_{width}x{height}.png')) return { error: 'ErrorLiveVideo' };
    if (vodMetadata.lengthSeconds > maxVideoDuration / 1000) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };
    if (!vodMetadata.owner) return { error: 'ErrorEmptyDownload' };

    let req_token = await fetch(gqlURL, {
        method: "POST",
        headers: clientIdHead,
        body: JSON.stringify({
            query: `{
                videoPlaybackAccessToken(
                    id: "${obj.vodId}",
                    params: {
                        platform: "web",
                        playerBackend: "mediaplayer",
                        playerType: "site"
                    }
                )
                {
                    value
                    signature
                }
            }`
        })
    }).then((r) => { return r.status === 200 ? r.json() : false; }).catch(() => { return false });
    if (!req_token) return { error: 'ErrorCouldntFetch' };

    let req_m3u8 = await fetch(
        `${m3u8URL}/vod/${obj.vodId}.m3u8?${
            new URLSearchParams({
                allow_source: 'true',
                allow_audio_only: 'true',
                allow_spectre: 'true',
                player: 'twitchweb',
                playlist_include_framerate: 'true',
                nauth: req_token.data.videoPlaybackAccessToken.value,
                nauthsig: req_token.data.videoPlaybackAccessToken.signature
            }
        )}`, {
            headers: clientIdHead
        }
    ).then((r) => { return r.status === 200 ? r.text() : false; }).catch(() => { return false });

    if (!req_m3u8) return { error: 'ErrorCouldntFetch' };

    let formats = getM3U8Formats(req_m3u8);
    let generalMeta = {
        title: vodMetadata.title,
        artist: `Twitch Broadcast by @${vodMetadata.owner.login}`,
    }
    if (obj.isAudioOnly) {
        return {
            type: "render",
            isM3U8: true,
            time: vodMetadata.lengthSeconds * 1000,
            urls: formats.find(f => f.id === 'audio_only').url,
            audioFilename: `twitchvod_${obj.vodId}_audio`,
            fileMetadata: generalMeta
        }
    } else {
        let format = formats.find(f => f.resolution && f.resolution[1] === obj.quality) || formats[0];
        return {
            urls: format.url,
            isM3U8: true,
            time: vodMetadata.lengthSeconds * 1000,
            filename: `twitchvod_${obj.vodId}_${format.resolution[0]}x${format.resolution[1]}.mp4`,
            fileMetadata: generalMeta
        }
    }
}
export default async function (obj) {
    let response = { error: 'ErrorEmptyDownload' };
    if (obj.clipId) {
        response = await getClip(obj)
    } else if (obj.vodId) {
        response = await getVideo(obj)
    }
    return response
}
