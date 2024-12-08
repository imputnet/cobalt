# cobalt api documentation
this document provides info about methods and acceptable variables for all cobalt api requests.

> [!IMPORTANT]
> hosted api instances (such as `api.cobalt.tools`) use bot protection and are **not** intended to be used in other projects without explicit permission. if you want to access the cobalt api reliably, you should [host your own instance](/docs/run-an-instance.md) or ask an instance owner for access.

## authentication
an api instance may be configured to require you to authenticate yourself.
if this is the case, you will typically receive an [error response](#error-response)
with a **`api.auth.<method>.missing`** code, which tells you that a particular method
of authentication is required.

authentication is done by passing the `Authorization` header, containing
the authentication scheme and the token:
```
Authorization: <scheme> <token>
```

currently, cobalt supports two ways of authentication. an instance can
choose to configure both, or neither:
- [`Api-Key`](#api-key-authentication)
- [`Bearer`](#bearer-authentication)

### api-key authentication
the api key authentication is the most straightforward. the instance owner
will assign you an api key which you can then use to authenticate like so:
```
Authorization: Api-Key aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
```

if you are an instance owner and wish to configure api key authentication,
see the [instance](run-an-instance.md#api-key-file-format) documentation!

### bearer authentication
the cobalt server may be configured to issue JWT bearers, which are short-lived
tokens intended for use by regular users (e.g. after passing a challenge).
currently, cobalt can issue tokens for successfully solved [turnstile](run-an-instance.md#list-of-all-environment-variables)
challenge, if the instance has turnstile configured. the resulting token is passed like so:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## POST: `/`
cobalt's main processing endpoint.

request body type: `application/json`
response body type: `application/json`

> [!IMPORTANT]
> you must include `Accept` and `Content-Type` headers with every `POST /` request.

```
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
| `youtubeDubLang`             | `string`  | `en / ru / cs / ja / es-US / ...`  | --        | specifies the language of audio to download when a youtube video is dubbed.     |
| `alwaysProxy`                | `boolean` | `true / false`                     | `false`   | tunnels all downloads through the processing server, even when not necessary.   |
| `disableMetadata`            | `boolean` | `true / false`                     | `false`   | disables file metadata when set to `true`.                                      |
| `tiktokFullAudio`            | `boolean` | `true / false`                     | `false`   | enables download of original sound used in a tiktok video.                      |
| `tiktokH265`                 | `boolean` | `true / false`                     | `false`   | changes whether 1080p h265 videos are preferred or not.                         |
| `twitterGif`                 | `boolean` | `true / false`                     | `true`    | changes whether twitter gifs are converted to .gif                              |
| `youtubeHLS`                 | `boolean` | `true / false`                     | `false`   | specifies whether to use HLS for downloading video or audio from youtube.       |

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

## POST: `/session`

used for generating JWT tokens, if enabled. currently, cobalt only supports
generating tokens when a [turnstile](run-an-instance.md#list-of-all-environment-variables) challenge solution
is submitted by the client.

the turnstile challenge response is submitted via the `cf-turnstile-response` header.
### response body
| key             | type       | description                                            |
|:----------------|:-----------|:-------------------------------------------------------|
| `token`         | `string`   | a `Bearer` token used for later request authentication |
| `exp`           | `number`   | number in seconds indicating the token lifetime        |

on failure, an [error response](#error-response) is returned.
