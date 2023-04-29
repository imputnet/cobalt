import { maxVideoDuration } from "../../config.js";

const gqlURL = "https://gql.twitch.tv/gql";
const m3u8URL = "https://usher.ttvnw.net";

function parseM3U8Line(line) {
  const result = {};

  let str = '', inQuotes = false, keyName = null, escaping = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && !escaping) {
      inQuotes = !inQuotes;
      continue;
    } else if (char === ',' && !escaping && !inQuotes) {
      if (!keyName) break;
      result[keyName] = str;
      keyName = null;
      str = '';
      continue;
    } else if (char === '\\' && !escaping) {
      escaping = true;
      continue;
    } else if (char === '=' && !escaping && !inQuotes) {
      keyName = str;
      str = '';
      continue;
    }

    str += char;
    escaping = false;
  }

  if (keyName) result[keyName] = str;
  return result;
}

function getM3U8Formats(m3u8body) {
  let formats = [];
  const formatLines = m3u8body.split('\n').slice(2);

  for (let i = 0; i < formatLines.length; i += 3) {
    const mediaLine = parseM3U8Line(formatLines[i].split(':')[1]);
    const streamLine = parseM3U8Line(formatLines[i + 1].split(':')[1]);
    formats.push({
      id: mediaLine['GROUP-ID'],
      name: mediaLine.NAME,
      resolution: streamLine.RESOLUTION ? streamLine.RESOLUTION.split('x') : null,
      url: formatLines[i + 2]
    });
  }
  return formats;
};

export default async function(obj) {
    try {
        let _headers = { "client-id": "kimne78kx3ncx6brgo4mv6wki5h1ko" };

        if (!obj.clipId && !obj.vodId) return { error: 'ErrorCantGetID' };

        if (obj.vodId) {
            const req_metadata = await fetch(gqlURL, {
                method: "POST",
                headers: _headers,
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
            }).then((r) => { return r.status == 200 ? r.json() : false;}).catch(() => {return false});
            if (!req_metadata) return { error: 'ErrorCouldntFetch' };
            const vodMetadata = req_metadata[0].data.video;

            if (vodMetadata.previewThumbnailURL.endsWith('/404_processing_{width}x{height}.png')) return { error: 'ErrorLiveVideo' };
            if (vodMetadata.lengthSeconds > maxVideoDuration / 1000) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };
            if (!vodMetadata.owner) return { error: 'ErrorEmptyDownload' }; // Streamer was banned...

            const req_token = await fetch(gqlURL, {
                    method: "POST",
                    headers: _headers,
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
            }).then((r) => { return r.status == 200 ? r.json() : false;}).catch(() => {return false});
            if (!req_token) return { error: 'ErrorCouldntFetch' };

            const access_token = req_token.data.videoPlaybackAccessToken;
            const req_m3u8 = await fetch(`${m3u8URL}/vod/${obj.vodId}.m3u8?${new URLSearchParams({
                    allow_source: 'true',
                    allow_audio_only: 'true',
                    allow_spectre: 'true',
                    player: 'twitchweb',
                    playlist_include_framerate: 'true',
                    nauth: access_token.value,
                    nauthsig: access_token.signature
            })}`, {
                    headers: _headers
            }).then((r) => { return r.status == 200 ? r.text() : false;}).catch(() => {return false});
            if (!req_m3u8) return { error: 'ErrorCouldntFetch' };

            const formats = getM3U8Formats(req_m3u8);
            const generalMeta = {
                    title: vodMetadata.title,
                    artist: `Twitch Broadcast by @${vodMetadata.owner.login}`,
            }

            if (!obj.isAudioOnly) {
                const format = formats.find(f => f.resolution && f.resolution[1] == obj.quality) || formats[0];

                return {
                    urls: format.url,
                    isM3U8: true,
                    time: vodMetadata.lengthSeconds * 1000,
                    filename: `twitchvod_${obj.vodId}_${format.resolution[0]}x${format.resolution[1]}.mp4`
                };
            } else {
                return {
                    type: "render",
                    isM3U8: true,
                    time: vodMetadata.lengthSeconds * 1000,
                    urls: formats.find(f => f.id === 'audio_only').url,
                    audioFilename: `twitchvod_${obj.vodId}_audio`,
                    fileMetadata: generalMeta
                }
            }
        } else if (obj.clipId) {
            const req_metadata = await fetch(gqlURL, {
                method: "POST",
                headers: _headers,
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
            }).then((r) => { return r.status == 200 ? r.json() : false;}).catch(() => {return false});
            if (!req_metadata) return { error: 'ErrorCouldntFetch' };
            const clipMetadata = req_metadata.data.clip;
            if (clipMetadata.durationSeconds > maxVideoDuration / 1000) return { error: ['ErrorLengthLimit', maxVideoDuration / 60000] };
            if (!clipMetadata.videoQualities || !clipMetadata.broadcaster) return { error: 'ErrorEmptyDownload' }; // Streamer was banned...

            const req_token = await fetch(gqlURL, {
                method: "POST",
                headers: _headers,
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
            }).then((r) => { return r.status == 200 ? r.json() : false;}).catch(() => {return false});
            if (!req_token) return { error: 'ErrorCouldntFetch' };

            const generalMeta = {
                    title: clipMetadata.title,
                    artist: `Twitch Clip by @${clipMetadata.broadcaster.login}, clipped by @${clipMetadata.curator.login}`,
            }

            const access_token = req_token[0].data.clip.playbackAccessToken;
            const formats = clipMetadata.videoQualities;
            const format = formats.find(f => f.quality == obj.quality) || formats[0];

            return {
                type: "bridge",
                urls: `${format.sourceURL}?${new URLSearchParams({
                    sig: access_token.signature,
                    token: access_token.value
                })}`,
                filename: `twitchclip_${clipMetadata.id}_${format.quality}.mp4`,
                audioFilename: `twitchclip_${clipMetadata.id}_audio`,
                fileMetadata: generalMeta
            };
        }
    } catch (err) {
        return { error: 'ErrorBadFetch' };
    }
}