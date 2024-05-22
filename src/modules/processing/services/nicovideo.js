import { genericUserAgent } from "../../config.js";
import { cleanString } from "../../sub/utils.js";
import HLS from "hls-parser";
import util from "node:util";

const NICOVIDEO_EMBED_FRONTEND_HEADERS = {
  "x-frontend-id": "70",
  "x-frontend-version": "0",
  "x-niconico-langauge": "ja-jp",
  "x-request-with": "https://embed.nicovideo.jp",
};

const NICOVIDEO_EMBED_URL = "https://embed.nicovideo.jp/watch/%s";
const NICOVIDEO_AUTHOR_DATA_URL = "https://embed.nicovideo.jp/users/%d";
const NICOVIDEO_GUEST_API_URL =
  "https://www.nicovideo.jp/api/watch/v3_guest/%s?_frontendId=70&_frontendVersion=0&actionTrackId=%s";
const NICOVIDEO_HLS_API_URL =
  "https://nvapi.nicovideo.jp/v1/watch/%s/access-rights/hls?actionTrackId=%s";

async function getBasicVideoInformation(id) {
  const page = await fetch(util.format(NICOVIDEO_EMBED_URL, id), {
    headers: { "user-agent": genericUserAgent },
  }).then((response) => response.text());

  const data = JSON.parse(
    page
      .split('data-props="')
      .pop()
      .split('" data-style-map="')
      .shift()
      .replaceAll("&quot;", '"')
  );

  const author = await fetch(
    util.format(NICOVIDEO_AUTHOR_DATA_URL, data.videoUploaderId),
    {
      headers: { "user-agent": genericUserAgent },
    }
  ).then((response) => response.json());

  return { ...data, author };
}

async function fetchGuestData(id, actionTrackId) {
  const data = await fetch(
    util.format(NICOVIDEO_GUEST_API_URL, id, actionTrackId),
    {
      headers: { "user-agent": genericUserAgent },
    }
  ).then((response) => response.json());

  if (data?.meta?.status !== 200) {
    throw new Error();
  }

  const { videos, audios, accessRightKey } = data.data.media.domand;

  // getting the HQ audio
  const { id: audioId } = audios
    .filter((audio) => audio.isAvailable)
    .sort((firstAudio, secondAudio) => firstAudio.bitrate - secondAudio.bitrate)
    .shift();

  return {
    accessRightKey,
    outputs: videos
      .filter((video) => video.isAvailable)
      .map((video) => [video.id, audioId]),
  };
}

async function fetchContentURL(id, actionTrackId, accessRightKey, outputs) {
  const data = await fetch(
    util.format(NICOVIDEO_HLS_API_URL, id, actionTrackId),
    {
      method: "POST",
      headers: {
        "user-agent": genericUserAgent,
        "content-type": "application/json; charset=utf-8",
        "x-access-right-key": accessRightKey,
        ...NICOVIDEO_EMBED_FRONTEND_HEADERS,
      },
      body: JSON.stringify({ outputs }),
    }
  ).then((response) => response.json());

  if (data?.meta?.status !== 201) {
    throw new Error();
  }

  return data.data.contentUrl;
}

async function getHLSContent(contentURL, quality, isAudioOnly) {
  const hls = await fetch(contentURL)
    .then((response) => response.text())
    .then((response) => HLS.parse(response));

  const height = quality === "max" ? 9000 : parseInt(quality, 10);
  let hlsContent = hls.variants.find(
    (variant) => variant.resolution.height === height
  );

  if (hlsContent === undefined) {
    hlsContent = hls.variants
      .sort(
        (firstVariant, secondVariant) =>
          firstVariant.bandwidth - secondVariant.bandwidth
      )
      .shift();
  }

  const audioUrl = hlsContent.audio.pop().uri;
  return isAudioOnly
    ? { resolution: null, urls: audioUrl, type: "audio" }
    : {
        resolution: hlsContent.resolution,
        urls: [hlsContent.uri, audioUrl],
        type: "video",
      };
}

// TODO @synzr better error handling
export default async function nicovideo({ id, quality, isAudioOnly }) {
  try {
    const { actionTrackId, title, author } = await getBasicVideoInformation(id);
    const { resolution, urls, type } = await fetchGuestData(id, actionTrackId)
      .then(({ accessRightKey, outputs }) =>
        fetchContentURL(id, actionTrackId, accessRightKey, outputs)
      )
      .then((contentURL) => getHLSContent(contentURL, quality, isAudioOnly));

    return {
      urls,
      isAudioOnly: type === "audio",
      fileMetadata: {
        title: cleanString(title.trim()),
        artist: cleanString(author.nickname.trim()),
      },
      // bible accurate object concatenation
      filenameAttributes: {
        service: "nicovideo",
        id,
        title,
        author: author.nickname,
        ...(type === "video"
          ? {
              extension: "mp4",
              qualityLabel: `${resolution.height}p`,
              resolution: `${resolution.width}x${resolution.height}`,
            }
          : {}),
      },
      ...(type === "audio" ? { isM3U8: true, bestAudio: "mp3" } : {}),
    };
  } catch (error) {
    return { error: "ErrorEmptyDownload" };
  }
}
