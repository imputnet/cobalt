import { genericUserAgent } from "../../config.js";
import HLS from "hls-parser";
import util from "node:util";

const NICOVIDEO_EMBED_URL = "https://embed.nicovideo.jp/watch/%s";
const NICOVIDEO_GUEST_API_URL =
  //                                              frontend is embed player
  "https://www.nicovideo.jp/api/watch/v3_guest/%s?_frontendId=70&_frontendVersion=0&actionTrackId=%s";
const NICOVIDEO_HLS_API_URL =
  "https://nvapi.nicovideo.jp/v1/watch/%s/access-rights/hls?actionTrackId=%s";

const ACTION_TRACK_ID_REGEXP =
  /&quot;actionTrackId&quot;:&quot;[A-Za-z0-9]+_[0-9]+&quot;/;

// working
async function getActionTrackId(id) {
  const page = await fetch(util.format(NICOVIDEO_EMBED_URL, id), {
    headers: { "user-agent": genericUserAgent },
  }).then((response) => response.text());

  if (!ACTION_TRACK_ID_REGEXP.test(page)) {
    throw new Error(); // we can't fetch the embed page
  }

  const actionTrackId = page
    // getting the regexp results
    .match(ACTION_TRACK_ID_REGEXP)
    .shift()
    // getting the actionTrackId field's value
    .split(":&quot;")
    .pop()
    // cleaning from double quotation mark
    .replaceAll("&quot;", "");

  return actionTrackId;
}

// not tested
async function fetchGuestData(id, actionTrackId) {
  const data = await fetch(
    util.format(NICOVIDEO_GUEST_API_URL, id, actionTrackId),
    {
      headers: { "user-agent": genericUserAgent },
    }
  ).then((response) => response.json());

  if (data?.meta?.status !== 200) {
    console.debug("fetchGuestData():", data)
    throw new Error();
  }

  const { videos, audios, accessRightKey } = data.data.media.domand;

  // getting the HQ audio
  const { id: audioId } = audios
    .filter((audio) => audio.isAvailable)
    .sort((firstAudio, secondAudio) => firstAudio.bitrate - secondAudio.bitrate)
    .pop();

  return {
    accessRightKey,
    outputs: videos
      .filter((video) => video.isAvailable)
      .map((video) => [video.id, audioId]),
  };
}

// not tested
async function fetchContentURL(id, actionTrackId, accessRightKey, outputs) {
  const data = await fetch(
    util.format(NICOVIDEO_HLS_API_URL, id, actionTrackId),
    {
      method: "POST",
      headers: {
        "user-agent": genericUserAgent,
        "content-type": "application/json; charset=utf-8",
        "x-access-right-key": accessRightKey,
      },
      body: JSON.stringify({ outputs }),
    }
  ).then((response) => response.json());

  if (data?.meta?.status !== 201) {
    throw new Error();
  }

  return data.data.contentURL;
}

// not tested
async function getHighestQualityHLS(contentURL) {
  const hls = await fetch(contentURL)
    .then((response) => response.text())
    .then((response) => HLS.parse(response));

  const highestQualityHLS = hls.variants
    .sort((firstVariant, secondVariant) => {
      const firstVariantPixels =
        firstVariant.resolution.width * firstVariant.resolution.height;
      const secondVariantPixels =
        secondVariant.resolution.width * secondVariant.resolution.height;

      return firstVariantPixels - secondVariantPixels;
    })
    .pop();

  return highestQualityHLS;
}

export default async function nicovideo({ id }) {
  try {
    const actionTrackId = await getActionTrackId(id);
    const highestQualityHLS = await fetchGuestData(actionTrackId)
      .then(({ accessRightKey, outputs }) =>
        fetchContentURL(id, actionTrackId, accessRightKey, outputs)
      )
      .then((contentURL) => getHighestQualityHLS(contentURL));

    return {
      urls: highestQualityHLS,
      isM3U8: true,
      // TODO @synzr get video information from embed page props
      filenameAttributes: { service: "niconico", id },
    };
  } catch (error) {
    return { error: "ErrorEmptyDownload" };
  }
}
