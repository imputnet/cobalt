# cobalt api documentation
this document provides info about methods and acceptable variables for all cobalt api requests.  

```
👍 you can use api.cobalt.tools in your projects for free, just don't be an asshole.
```

## POST: `/api/json`
cobalt's main processing endpoint.  

request body type: `application/json`  
response body type: `application/json`  

```
⚠️ you must include Accept and Content-Type headers with every POST /api/json request.

Accept: application/json
Content-Type: application/json
```

### request body variables
| key               | type      | variables                          | default   | description                                                                     |
|:------------------|:----------|:-----------------------------------|:----------|:--------------------------------------------------------------------------------|
| `url`             | `string`  | URL encoded as URI                 | `null`    | **must** be included in every request.                                          |
| `vCodec`          | `string`  | `h264 / av1 / vp9`                 | `h264`    | applies only to youtube downloads. `h264` is recommended for phones.            |
| `vQuality`        | `string`  | `144 / ... / 2160 / max`           | `720`     | `720` quality is recommended for phones.                                        |
| `aFormat`         | `string`  | `best / mp3 / ogg / wav / opus`    | `mp3`     |                                                                                 |
| `filenamePattern` | `string`  | `classic / pretty / basic / nerdy` | `classic` | changes the way files are named. previews can be seen in the web app.           |
| `isAudioOnly`     | `boolean` | `true / false`                     | `false`   |                                                                                 |
| `isTTFullAudio`   | `boolean` | `true / false`                     | `false`   | enables download of original sound used in a tiktok video.                      |
| `isAudioMuted`    | `boolean` | `true / false`                     | `false`   | disables audio track in video downloads.                                        |
| `dubLang`         | `boolean` | `true / false`                     | `false`   | backend uses Accept-Language header for youtube video audio tracks when `true`. |
| `disableMetadata` | `boolean` | `true / false`                     | `false`   | disables file metadata when set to `true`.                                      |
| `twitterGif`      | `boolean` | `true / false`                     | `false`   | changes whether twitter gifs are converted to .gif                              |
| `tiktokH265`      | `boolean` | `true / false`                     | `false`   | changes whether 1080p h265 videos are preferred or not.                         |

### response body variables
| key          | type     | variables                                                   |
|:-------------|:---------|:------------------------------------------------------------|
| `status`     | `string` | `error / redirect / stream / success / rate-limit / picker` |
| `text`       | `string` | various text, mostly used for errors                        |
| `url`        | `string` | direct link to a file or a link to cobalt's live render     |
| `pickerType` | `string` | `various / images`                                          |
| `picker`     | `array`  | array of picker items                                       |
| `audio`      | `string` | direct link to a file or a link to cobalt's live render     |

### picker item variables
item type: `object` 

| key     | type     | variables                                               | description                            |
|:--------|:---------|:--------------------------------------------------------|:---------------------------------------|
| `type`  | `string` | `video / photo / gif`                                   | used only if `pickerType` is `various` |
| `url`   | `string` | direct link to a file or a link to cobalt's live render |                                        |
| `thumb` | `string` | item thumbnail that's displayed in the picker           | used for `video` and `gif` types       |

## GET: `/api/stream`
cobalt's live render (or stream) endpoint. usually, you will receive a url to this endpoint
from a successful call to `/api/json`. however, the parameters passed to it are **opaque**
and **unmodifiable** from your (the api client's) perspective, and can change between versions.

therefore you don't need to worry about what they mean - but if you really want to know, you can
[read the source code](/src/modules/stream/manage.js).

## GET: `/api/serverInfo`
returns current basic server info.  
response body type: `application/json`

### response body variables
| key         | type     | variables         |
|:------------|:---------|:------------------|
| `version`   | `string` | cobalt version    |
| `commit`    | `string` | git commit        |
| `branch`    | `string` | git branch        |
| `name`      | `string` | server name       |
| `url`       | `string` | server url        |
| `cors`      | `number` | cors status       |
| `startTime` | `string` | server start time |
