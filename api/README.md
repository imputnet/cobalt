# cobalt api
this directory includes the source code for cobalt api. it's made with [express.js](https://www.npmjs.com/package/express) and love!

## running your own instance
if you want to run your own instance for whatever purpose, [follow this guide](/docs/run-an-instance.md).
we recommend to use docker compose unless you intend to run cobalt for developing/debugging purposes.

## accessing the api
there is currently no publicly available pre-hosted api.
we recommend [deploying your own instance](/docs/run-an-instance.md) if you wish to use the cobalt api.

you can read [the api documentation here](/docs/api.md).

## supported services
this list is not final and keeps expanding over time!
if the desired service isn't supported yet, feel free to create an appropriate issue (or a pull request 👀).

| service           | video + audio | only audio | only video | metadata | rich file names |
| :--------         | :-----------: | :--------: | :--------: | :------: | :-------------: |
| bilibili          | ✅            | ✅         | ✅         | ➖         | ➖              |
| bluesky           | ✅            | ✅         | ✅         | ➖         | ➖              |
| dailymotion       | ✅            | ✅         | ✅         | ✅         | ✅              |
| instagram         | ✅            | ✅         | ✅         | ➖         | ➖              |
| facebook          | ✅            | ❌         | ✅         | ➖         | ➖              |
| loom              | ✅            | ❌         | ✅         | ✅         | ➖              |
| newgrounds        | ✅            | ✅         | ✅         | ✅         | ✅              |
| ok.ru             | ✅            | ❌         | ✅         | ✅         | ✅              |
| pinterest         | ✅            | ✅         | ✅         | ➖         | ➖              |
| reddit            | ✅            | ✅         | ✅         | ❌         | ❌              |
| rutube            | ✅            | ✅         | ✅         | ✅         | ✅              |
| snapchat          | ✅            | ✅         | ✅         | ➖         | ➖              |
| soundcloud        | ➖            | ✅         | ➖         | ✅         | ✅              |
| streamable        | ✅            | ✅         | ✅         | ➖         | ➖              |
| tiktok            | ✅            | ✅         | ✅         | ❌         | ❌              |
| tumblr            | ✅            | ✅         | ✅         | ➖         | ➖              |
| twitch clips      | ✅            | ✅         | ✅         | ✅         | ✅              |
| twitter/x         | ✅            | ✅         | ✅         | ➖         | ➖              |
| vimeo             | ✅            | ✅         | ✅         | ✅         | ✅              |
| vk videos & clips | ✅            | ❌         | ✅         | ✅         | ✅              |
| xiaohongshu       | ✅            | ✅         | ✅         | ➖         | ➖              |
| youtube           | ✅            | ✅         | ✅         | ✅         | ✅              |

| emoji   | meaning                 |
| :-----: | :---------------------- |
| ✅      | supported               |
| ➖      | unreasonable/impossible |
| ❌      | not supported           |

### additional notes or features (per service)
| service    | notes or features                                                                                                    |
| :--------  | :-----                                                                                                               |
| instagram  | supports reels, photos, and videos. lets you pick what to save from multi-media posts.                               |
| facebook   | supports public accessible videos content only.                                                                      |
| pinterest  | supports photos, gifs, videos and stories.                                                                           |
| reddit     | supports gifs and videos.                                                                                            |
| snapchat   | supports spotlights and stories. lets you pick what to save from stories.                                            |
| rutube     | supports yappy & private links.                                                                                      |
| soundcloud | supports private links.                                                                                              |
| tiktok     | supports videos with or without watermark, images from slideshow without watermark, and full (original) audios.      |
| twitter/x  | lets you pick what to save from multi-media posts. may not be 100% reliable due to current management.               |
| vimeo      | audio downloads are only available for dash.                                                                         |
| youtube    | supports videos, music, and shorts. 8K, 4K, HDR, VR, and high FPS videos. rich metadata & dubs. h264/av1/vp9 codecs. |

## license
cobalt api code is licensed under [AGPL-3.0](LICENSE).

this license allows you to modify, distribute and use the code for any purpose
as long as you:
- give appropriate credit to the original repo when using or modifying any parts of the code,
- provide a link to the license and indicate if changes to the code were made, and
- release the code under the **same license**

## open source acknowledgements
### ffmpeg
cobalt relies on ffmpeg for muxing and encoding media files. ffmpeg is absolutely spectacular and we're privileged to have the ability to use it for free, just like anyone else. we believe it should be way more recognized.

you can [support ffmpeg here](https://ffmpeg.org/donations.html)!

### youtube.js
cobalt relies on **[youtube.js](https://github.com/LuanRT/YouTube.js)** for interacting with youtube's innertube api, it wouldn't have been possible without this package.

you can support the developer via various methods listed on their github page!
(linked above)

### many others
cobalt-api also depends on:

- **[content-disposition-header](https://www.npmjs.com/package/content-disposition-header)** to simplify the provision of `content-disposition` headers.
- **[cors](https://www.npmjs.com/package/cors)** to manage cross-origin resource sharing within expressjs.
- **[dotenv](https://www.npmjs.com/package/dotenv)** to load environment variables from the `.env` file.
- **[express](https://www.npmjs.com/package/express)** as the backbone of cobalt servers.
- **[express-rate-limit](https://www.npmjs.com/package/express-rate-limit)** to rate limit api endpoints.
- **[ffmpeg-static](https://www.npmjs.com/package/ffmpeg-static)** to get binaries for ffmpeg depending on the platform.
- **[hls-parser](https://www.npmjs.com/package/hls-parser)** to parse HLS playlists according to spec (very impressive stuff).
- **[ipaddr.js](https://www.npmjs.com/package/ipaddr.js)** to parse ip addresses (used for rate limiting).
- **[nanoid](https://www.npmjs.com/package/nanoid)** to generate unique identifiers for each requested tunnel.
- **[set-cookie-parser](https://www.npmjs.com/package/set-cookie-parser)** to parse cookies that cobalt receives from certain services.
- **[undici](https://www.npmjs.com/package/undici)** for making http requests.
- **[url-pattern](https://www.npmjs.com/package/url-pattern)** to match provided links with supported patterns.
- **[zod](https://www.npmjs.com/package/zod)** to lock down the api request schema.
- **[@datastructures-js/priority-queue](https://www.npmjs.com/package/@datastructures-js/priority-queue)** for sorting stream caches for future clean up (without redis).
- **[@imput/psl](https://www.npmjs.com/package/@imput/psl)** as the domain name parser, our fork of [psl](https://www.npmjs.com/package/psl).

...and many other packages that these packages rely on.
