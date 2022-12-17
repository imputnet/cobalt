# cobalt API Documentation
This document provides info about methods and acceptable variables for all cobalt API requests.<br>
## POST: ``/api/json``
Main processing endpoint.<br>
```
⚠️ GET method for this endpoint is deprecated and will be removed entirely soon.

Make sure to update your shortcuts and scripts.
Only url query can be used with this method.
```
Request Body Type: ``application/json``<br>
Response Body Type: ``application/json``

### Request Body Variables
| key             | type    | variables                         | default    | description                                                           |
|:----------------|:--------|:----------------------------------|:-----------|:----------------------------------------------------------------------|
| url             | string  | Sharable URL encoded as URI       | ``null``   | **Must** be included in every request.                                |
| vFormat         | string  | ``mp4 / webm``                    | ``mp4``    | Applies only to YouTube downloads. ``mp4`` is recommended for phones. |
| vQuality        | string  | ``los / low / mid / hig / max``   | ``hig``    | ``mid`` quality is recommended for phones.                            |
| aFormat         | string  | ``best / mp3 / ogg / wav / opus`` | ``mp3``    |                                                                       |
| isAudioOnly     | boolean | ``true / false``                  | ``false``  |                                                                       |
| isNoTTWatermark | boolean | ``true / false``                  | ``false``  | Changes whether downloaded TikTok & Douyin videos have watermarks.    |
| isTTFullAudio   | boolean | ``true / false``                  | ``false``  | Enables download of original sound used in a TikTok video.            |
| isAudioMuted    | boolean | ``true / false``                  | ``false``  | Disables audio track in video downloads.                              |

### Response Body Variables
| key        | type   | variables                                                     |
|:-----------|:-------|:--------------------------------------------------------------|
| status     | string | ``error / redirect / stream / success / rate-limit / picker`` |
| text       | string | Text                                                          |
| url        | string | Direct link to a file / link to cobalt's stream               |
| pickerType | string | ``various / images``                                          |
| picker     | array  | Array of picker items                                         |
| audio      | string | Direct link to a file / link to cobalt's stream               |

### Picker Item Variables
Item type: ``object``
| key        | type   | variables                                       | description                                 |
|:-----------|:-------|:------------------------------------------------|:--------------------------------------------|
| type       | string | ``video``                                       | Used only if ``pickerType`` is ``various``. |
| url        | string | Direct link to a file / link to cobalt's stream |                                             |
| thumb      | string | Item thumbnail that's displayed in the picker   | Used only for ``video`` type.               |

## GET: ``/api/stream``
Content live render streaming endpoint.<br>

### Request Query Variables
| key | variables        | description                                                                                                                   |
|:----|:-----------------|:------------------------------------------------------------------------------------------------------------------------------|
| p   | ``1``            | Used for checking the rate limit.                                                                                             |
| t   | Stream UUID      | Unique stream identificator by which cobalt finds stored stream info data.                                                    |
| h   | HMAC             | Hashed combination of: (hashed) ip address, stream uuid, expiry timestamp, and service name. Used for verification of stream. |
| e   | Expiry timestamp |                                                                                                                               |

## GET: ``/api/onDemand``
On-demand website element loading. Currently used only for older changelogs.<br>

### Request Query Variables
| key     | variables | description                            |
|:--------|:----------|:---------------------------------------|
| blockId | ``0``     | Block ID to be rendered on the server. |

### Response Body Variables
| key        | type   | variables                    |
|:-----------|:-------|:-----------------------------|
| status     | string | ``error / success``          |
| text       | string | Error text or rendered block |