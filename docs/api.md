# cobalt api documentation
this document provides info about methods and acceptable variables for all cobalt api requests.

> if you are looking for the documentation for the old (7.x) api, you can find
> it [here](https://github.com/imputnet/cobalt/blob/7/docs/api.md)
<!-- TODO: authorization -->

## POST: `/`
cobalt's main processing endpoint.

request body type: `application/json`
response body type: `application/json`

```
⚠️ you must include Accept and Content-Type headers with every `POST /` request.

Accept: application/json
Content-Type: application/json
```

### request body
| key                          | type      | expected value(s)                  | default   | description                                                                     |
|:-----------------------------|:----------|:-----------------------------------|:----------|:--------------------------------------------------------------------------------|
| `url`                        | `string`  | URL to download                    | --        | **must** be included in every request.                                          |
| `videoQuality`               | `string`  | `144 / ... / 2160 / 4320 / max`    | `1080`    | `720` quality is recommended for phones.                                        |
| `audioFormat`                | `string`  | `best / mp3 / ogg / wav / opus`    | `mp3`     |                                                                                 |
| `audioBitrate`               | `string`  | `320 / 256 / 128 / 96 / 64 / 8`    | `128`     | specifies the bitrate to use for the audio. applies only to audio conversion.   |
| `filenameStyle`              | `string`  | `classic / pretty / basic / nerdy` | `classic` | changes the way files are named. previews can be seen in the web app.           |
| `downloadMode`               | `string`  | `auto / audio / mute`              | `auto`    | `audio` downloads only the audio, `mute` skips the audio track in videos.       |
| `youtubeVideoCodec`          | `string`  | `h264 / av1 / vp9`                 | `h264`    | `h264` is recommended for phones.                                               |
| `youtubeDubLang`             | `string`  | `en / ru / cs / ja / ...`          | --        | specifies the language of audio to download, when the youtube video is dubbed   |
| `youtubeDubBrowserLang`      | `boolean` | `true / false`                     | `false`   | uses value from the Accept-Language header for `youtubeDubLang`.                |
| `alwaysProxy`                | `boolean` | `true / false`                     | `false`   | tunnels all downloads through the processing server, even when not necessary.   |
| `disableMetadata`            | `boolean` | `true / false`                     | `false`   | disables file metadata when set to `true`.                                      |
| `tiktokFullAudio`            | `boolean` | `true / false`                     | `false`   | enables download of original sound used in a tiktok video.                      |
| `tiktokH265`                 | `boolean` | `true / false`                     | `false`   | changes whether 1080p h265 videos are preferred or not.                         |
| `twitterGif`                 | `boolean` | `true / false`                     | `true`    | changes whether twitter gifs are converted to .gif                              |

### response
the response will always be a JSON object containing the `status` key, which will be one of:
- `error` - something went wrong
- `picker` - we have multiple items to choose from
- `redirect` - you are being redirected to the direct service URL
- `tunnel` - cobalt is proxying the download for you

### tunnel/redirect response
| key          | type     | values                                                      |
|:-------------|:---------|:------------------------------------------------------------|
| `status`     | `string` | `tunnel / redirect`                                         |
| `url`        | `string` | url for the cobalt tunnel, or redirect to an external link  |
| `filename`   | `string` | cobalt-generated filename for the file being downloaded     |

### picker response
| key             | type     | values                                                                                           |
|:----------------|:---------|:-------------------------------------------------------------------------------------------------|
| `status`        | `string` | `picker`                                                                                         |
| `audio`         | `string` | **optional** returned when an image slideshow (such as on tiktok) has a general background audio |
| `audioFilename` | `string` | **optional** cobalt-generated filename, returned if `audio` exists                               |
| `picker`        | `array`  | array of objects containing the individual media                                                 |

#### picker object
| key          | type      | values                                                      |
|:-------------|:----------|:------------------------------------------------------------|
| `type`       | `string`  | `photo` / `video` / `gif`                                   |
| `url`        | `string`  |                                                             |
| `thumb`      | `string`  | **optional** thumbnail url                                  |

### error response
| key          | type     | values                                                      |
|:-------------|:---------|:------------------------------------------------------------|
| `status`     | `string` | `error`                                                     |
| `error`      | `object` | contains more context about the error                       |

#### error object
| key          | type     | values                                                      |
|:-------------|:---------|:------------------------------------------------------------|
| `code`       | `string` | machine-readable error code explaining the failure reason   |
| `context`    | `object` | **optional** container for providing more context           |

#### error.context object
| key          | type     | values                                                                                                         |
|:-------------|:---------|:---------------------------------------------------------------------------------------------------------------|
| `service`    | `string` | **optional**, stating which service was being downloaded from                                                  |
| `limit`      | `number` | **optional** number providing the ratelimit maximum number of requests, or maximum downloadable video duration |

## GET: `/`
returns current basic server info.
response body type: `application/json`

### response body
| key         | type     | variables                                                |
|:------------|:---------|:---------------------------------------------------------|
| `cobalt`    | `object` | information about the cobalt instance                    |
| `git`       | `object` | information about the codebase that is currently running |

#### cobalt object
| key             | type       | description                                    |
|:----------------|:-----------|:-----------------------------------------------|
| `version`       | `string`   | current version                                |
| `url`           | `string`   | server url                                     |
| `startTime`     | `string`   | server start time in unix milliseconds         |
| `durationLimit` | `number`   | maximum downloadable video length in seconds   |
| `services`      | `string[]` | array of services which this instance supports |

#### git object
| key         | type     | variables         |
|:------------|:---------|:------------------|
| `commit`    | `string` | commit hash       |
| `branch`    | `string` | git branch        |
| `remote`    | `string` | git remote        |
