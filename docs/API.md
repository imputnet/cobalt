# cobalt API Documentation
This document provides info about methods and acceptable variables for all cobalt API requests.<br>

```
⚠️ Main API instance has moved to https://co.wuk.sh/

Make sure your projects use the correct API domain.
```

## POST: ``/api/json``
Main processing endpoint.<br>

Request Body Type: ``application/json``<br>
Response Body Type: ``application/json``

### Request Body Variables
| key                 | type        | variables                         | default   | description                                                                    |
|:--------------------|:------------|:----------------------------------|:----------|:-------------------------------------------------------------------------------|
| ``url``             | ``string``  | Sharable URL encoded as URI       | ``null``  | **Must** be included in every request.                                         |
| ``vCodec``          | ``string``  | ``h264 / av1 / vp9``              | ``h264``  | Applies only to YouTube downloads. ``h264`` is recommended for phones.         |
| ``vQuality``        | ``string``  | ``144 / ... / 2160 / max``        | ``720``   | ``720`` quality is recommended for phones.                                     |
| ``aFormat``         | ``string``  | ``best / mp3 / ogg / wav / opus`` | ``mp3``   |                                                                                |
| ``isAudioOnly``     | ``boolean`` | ``true / false``                  | ``false`` |                                                                                |
| ``isNoTTWatermark`` | ``boolean`` | ``true / false``                  | ``false`` | Changes whether downloaded TikTok videos have watermarks.                      |
| ``isTTFullAudio``   | ``boolean`` | ``true / false``                  | ``false`` | Enables download of original sound used in a TikTok video.                     |
| ``isAudioMuted``    | ``boolean`` | ``true / false``                  | ``false`` | Disables audio track in video downloads.                                       |
| ``dubLang``         | ``boolean`` | ``true / false``                  | ``false`` | Backend uses Accept-Language for YouTube video audio tracks when ``true``.     |
| ``disableMetadata`` | ``boolean`` | ``true / false``                  | ``false`` | Disables file metadata when set to ``true``.                                   |

### Response Body Variables
| key            | type       | variables                                                     |
|:---------------|:-----------|:--------------------------------------------------------------|
| ``status``     | ``string`` | ``error / redirect / stream / success / rate-limit / picker`` |
| ``text``       | ``string`` | Text                                                          |
| ``url``        | ``string`` | Direct link to a file / link to cobalt's live render               |
| ``pickerType`` | ``string`` | ``various / images``                                          |
| ``picker``     | ``array``  | Array of picker items                                         |
| ``audio``      | ``string`` | Direct link to a file / link to cobalt's live render               |

### Picker Item Variables
Item type: ``object``
| key            | type       | variables                                       | description                                 |
|:---------------|:-----------|:------------------------------------------------|:--------------------------------------------|
| ``type``       | ``string`` | ``video``                                       | Used only if ``pickerType`` is ``various``. |
| ``url``        | ``string`` | Direct link to a file / link to cobalt's live render |                                             |
| ``thumb``      | ``string`` | Item thumbnail that's displayed in the picker   | Used only for ``video`` type.               |

## GET: ``/api/stream``
Content live render streaming endpoint.<br>

### Request Query Variables
| key     | variables        | description                                                                                                                    |
|:--------|:-----------------|:-------------------------------------------------------------------------------------------------------------------------------|
| ``p``   | ``1``            | Used for probing whether user is rate limited.                                                                                 |
| ``t``   | Stream token     | Unique stream ID. Used for retrieving cached stream info data.                                                                 |
| ``h``   | HMAC             | Hashed combination of: (hashed) ip address, stream token, expiry timestamp, and service name. Used for verification of stream. |
| ``e``   | Expiry timestamp |                                                                                                                                |

## GET: ``/api/serverInfo``
Returns current basic server info.<br>
Response Body Type: ``application/json``

### Response Body Variables
| key           | type       | variables         |
|:--------------|:-----------|:------------------|
| ``version``   | ``string`` | cobalt version    |
| ``commit``    | ``string`` | Git commit        |
| ``branch``    | ``string`` | Git branch        |
| ``name``      | ``string`` | Server name       |
| ``url``       | ``string`` | Server url        |
| ``cors``      | ``int``    | CORS status       |
| ``startTime`` | ``string`` | Server start time |
