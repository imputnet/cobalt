# cobalt api documentation
this document provides info about methods and acceptable variables for all cobalt api requests.  

```
👍 you can use co.wuk.sh instance in your projects for free, just don't be an asshole.
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
| key               | type      | variables                          | default   | description                                                                    |
|:------------------|:----------|:-----------------------------------|:----------|:-------------------------------------------------------------------------------|
| `url`             | `string`  | URL encoded as URI                 | `null`    | **must** be included in every request.                                         |
| `vCodec`          | `string`  | `h264 / av1 / vp9`                 | `h264`    | applies only to youtube downloads. `h264` is recommended for phones.           |
| `vQuality`        | `string`  | `144 / ... / 2160 / max`           | `720`     | `720` quality is recommended for phones.                                       |
| `aFormat`         | `string`  | `best / mp3 / ogg / wav / opus`    | `mp3`     |                                                                                |
| `filenamePattern` | `string`  | `classic / pretty / basic / nerdy` | `classic` | changes the way files are named. previews can be seen in the web app.          |
| `isAudioOnly`     | `boolean` | `true / false`                     | `false`   |                                                                                |
| `isNoTTWatermark` | `boolean` | `true / false`                     | `false`   | changes whether downloaded tiktok videos have watermarks.                      |
| `isTTFullAudio`   | `boolean` | `true / false`                     | `false`   | enables download of original sound used in a tiktok video.                     |
| `isAudioMuted`    | `boolean` | `true / false`                     | `false`   | disables audio track in video downloads.                                       |
| `dubLang`         | `boolean` | `true / false`                     | `false`   | backend uses Accept-Language header for youtube video audio tracks when `true`. |
| `disableMetadata` | `boolean` | `true / false`                     | `false`   | disables file metadata when set to `true`.                                     |

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
| `type`  | `string` | `video`                                                 | used only if `pickerType`is `various`. |
| `url`   | `string` | direct link to a file or a link to cobalt's live render |                                        |
| `thumb` | `string` | item thumbnail that's displayed in the picker           | used only for `video` type.            |

## GET: `/api/stream`
cobalt's live render (or stream) endpoint. used for sending various media content over to the user.  

### request query variables
| key  | variables        | description                                                                                                                    |
|:-----|:-----------------|:-------------------------------------------------------------------------------------------------------------------------------|
| `p`  | `1`              | used for probing whether user is rate limited.                                                                                 |
| `t`  | stream token     | unique stream id. used for retrieving cached stream info data.                                                                 |
| `h`  | hmac             | hashed combination of: (hashed) ip address, stream token, expiry timestamp, and service name. used for verification of stream. |
| `e`  | expiry timestamp |                                                                                                                                |

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
| `cors`      | `int`    | cors status       |
| `startTime` | `string` | server start time |
