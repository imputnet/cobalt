<div align="center">
    <br/>
    <p>
        <img src="web/static/favicon.png" title="cobalt" alt="cobalt logo" width="100" />
    </p>
    <p>
        best way to save what you love
        <br/>
        <a href="https://cobalt.tools">
            cobalt.tools
        </a>
    </p>
    <p>
        <a href="https://discord.gg/pQPt8HBUPu">
            💬 community discord server
        </a>
        <a href="https://x.com/justusecobalt">
            🐦 twitter/x
        </a>
    </p>
    <br/>
</div>

cobalt is a media downloader that doesn't piss you off. it's fast, friendly, and doesn't have any bullshit that modern web is filled with: ***no ads, trackers, or paywalls***.

paste the link, get the file, move on. it's that simple. just how it should be.

### supported services
this list is not final and keeps expanding over time. if support for a service you want is missing, create an issue (or a pull request 👀).

| service           | video + audio | only audio | only video | metadata | rich file names |
| :--------         | :-----------: | :--------: | :--------: | :------: | :-------------: |
| bilibili          | ✅            | ✅         | ✅         | ➖         | ➖              |
| bluesky           | ✅            | ✅         | ✅         | ➖         | ➖              |
| dailymotion       | ✅            | ✅         | ✅         | ✅         | ✅              |
| instagram         | ✅            | ✅         | ✅         | ➖         | ➖              |
| facebook          | ✅            | ❌         | ✅         | ➖         | ➖              |
| loom              | ✅            | ❌         | ✅         | ✅         | ➖              |
| ok.ru             | ✅            | ❌         | ✅         | ✅         | ✅              |
| pinterest         | ✅            | ✅         | ✅         | ➖         | ➖              |
| reddit            | ✅            | ✅         | ✅         | ❌         | ❌              |
| rutube            | ✅            | ✅         | ✅         | ✅         | ✅              |
| snapchat          | ✅            | ✅         | ✅         | ➖         | ➖              |
| soundcloud        | ➖            | ✅         | ➖         | ✅         | ✅              |
| streamable        | ✅            | ✅         | ✅         | ➖         | ➖              |
| threads posts     | ✅            | ✅         | ✅         | ➖         | ➖              |
| tiktok            | ✅            | ✅         | ✅         | ❌         | ❌              |
| tumblr            | ✅            | ✅         | ✅         | ➖         | ➖              |
| twitch clips      | ✅            | ✅         | ✅         | ✅         | ✅              |
| twitter/x         | ✅            | ✅         | ✅         | ➖         | ➖              |
| vimeo             | ✅            | ✅         | ✅         | ✅         | ✅              |
| vine              | ✅            | ✅         | ✅         | ➖         | ➖              |
| vk videos & clips | ✅            | ❌         | ✅         | ✅         | ✅              |
| youtube           | ✅            | ✅         | ✅         | ✅         | ✅              |

| emoji   | meaning                 |
| :-----: | :---------------------- |
| ✅      | supported               |
| ➖      | impossible/unreasonable |
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
| threads    | supports photos and videos. lets you pick what to save from multi-media posts.                                       |
| tiktok     | supports videos with or without watermark, images from slideshow without watermark, and full (original) audios.      |
| twitter/x  | lets you pick what to save from multi-media posts. may not be 100% reliable due to current management.               |
| vimeo      | audio downloads are only available for dash.                                                                         |
| youtube    | supports videos, music, and shorts. 8K, 4K, HDR, VR, and high FPS videos. rich metadata & dubs. h264/av1/vp9 codecs. |

### partners
cobalt is sponsored by [royalehosting.net](https://royalehosting.net/?partner=cobalt), all main instances are currently hosted on their network :)

### ethics and disclaimer
cobalt is a tool for easing content downloads from internet and takes ***zero liability***. you are responsible for what you download, how you use and distribute that content. please be mindful when using content of others and always credit original creators. fair use and credits benefit everyone.

cobalt is ***NOT*** a piracy tool and cannot be used as such. it can only download free, publicly accessible content. such content can be easily downloaded through any browser's dev tools. pressing one button is easier, so i made a convenient, ad-less tool for such repeated actions.

### cobalt license
for relevant licensing information, see the [api](api/README.md) and [web](web/README.md) READMEs.
unless specified otherwise, the remainder of this repository is licensed under [AGPL-3.0](LICENSE).

## acknowledgements
### ffmpeg
cobalt heavily relies on ffmpeg for converting and merging media files. it's an absolutely amazing piece of software offered for anyone for free, yet doesn't receive as much credit as it should.

you can [support ffmpeg here](https://ffmpeg.org/donations.html)!

#### ffmpeg-static
we use [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static) to get binaries for ffmpeg depending on the platform.

you can support the developer via various methods listed on their github page! (linked above)

### youtube.js
cobalt relies on [youtube.js](https://github.com/LuanRT/YouTube.js) for interacting with the innertube api, it wouldn't have been possible without it.

you can support the developer via various methods listed on their github page! (linked above)

### many others
cobalt also depends on:

- [content-disposition-header](https://www.npmjs.com/package/content-disposition-header) to simplify the provision of `content-disposition` headers.
- [cors](https://www.npmjs.com/package/cors) to manage cross-origin resource sharing within expressjs.
- [dotenv](https://www.npmjs.com/package/dotenv) to load environment variables from the `.env` file.
- [esbuild](https://www.npmjs.com/package/esbuild) to minify the frontend files.
- [express](https://www.npmjs.com/package/express) as the backbone of cobalt servers.
- [express-rate-limit](https://www.npmjs.com/package/express-rate-limit) to rate limit api endpoints.
- [hls-parser](https://www.npmjs.com/package/hls-parser) to parse `m3u8` playlists for certain services.
- [ipaddr.js](https://www.npmjs.com/package/ipaddr.js) to parse ip addresses (for rate limiting).
- [nanoid](https://www.npmjs.com/package/nanoid) to generate unique (temporary) identifiers for each requested stream.
- [node-cache](https://www.npmjs.com/package/node-cache) to cache stream info in server ram for a limited amount of time.
- [psl](https://www.npmjs.com/package/psl) as the domain name parser.
- [set-cookie-parser](https://www.npmjs.com/package/set-cookie-parser) to parse cookies that cobalt receives from certain services.
- [undici](https://www.npmjs.com/package/undici) for making http requests.
- [url-pattern](https://www.npmjs.com/package/url-pattern) to match provided links with supported patterns.

...and many other packages that these packages rely on.
