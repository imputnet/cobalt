# cobalt
Best way to save what you love.

Live: [co.wukko.me](https://co.wukko.me/)

![cobalt logo with repeated logo pattern background](https://raw.githubusercontent.com/wukko/cobalt/current/src/front/icons/pattern.png "cobalt logo with repeated logo pattern background")

[![Crowdin](https://badges.crowdin.net/cobalt/localized.svg)](https://crowdin.com/project/cobalt) [![DeepSource](https://deepsource.io/gh/wukko/cobalt.svg/?label=active+issues&token=MsmsJ9zUOKwcQor0yaiFot84)](https://deepsource.io/gh/wukko/cobalt/?ref=repository-badge) [![DeepSource](https://deepsource.io/gh/wukko/cobalt.svg/?label=resolved+issues&token=MsmsJ9zUOKwcQor0yaiFot84)](https://deepsource.io/gh/wukko/cobalt/?ref=repository-badge)

## What's cobalt?
cobalt is a social and media platform downloader that doesn't piss you off.

It's fast, friendly, and doesn't have any bullshit that modern web is filled with: no ads, trackers, or analytics. Paste the link, get the video, move on. It's that simple. Just how it should be.

## Supported services
| Service           | Video + Audio | Only audio | Additional features                                                                                             |
| --------          | :---:         | :---:      | :-----                                                                                                          |
| Twitter           | ✅           | ✅         | Ability to save multiple videos/GIFs from a single tweet.                                                       |
| Twitter Spaces    | ❌️           | ✅         | Audio metadata.                                                                                                 |
| YouTube & Shorts  | ✅           | ✅         | Support for 8K, 4K, HDR, and high FPS videos. Audio metadata & dubs. h264/av1/vp9 codecs.                       |
| YouTube Music     | ❌           | ✅         | Audio metadata.                                                                                                 |
| Reddit            | ✅           | ✅         | GIFs and videos.                                                                                                |
| TikTok            | ✅           | ✅         | Video downloads with or without watermark; image slideshow downloads without watermark. Full audio downloads.   |
| Twitch            | ✅           | ✅         |                                                                                                                 |
| SoundCloud        | ❌           | ✅         | Audio metadata, downloads from private links.                                                                   |
| bilibili.com      | ✅           | ✅         |                                                                                                                 |
| Tumblr            | ✅           | ✅         |                                                                                                                 |
| Vimeo             | ✅           | ❌️         |                                                                                                                 |
| VK Videos & Clips | ✅           | ❌️         |                                                                                                                 |

## cobalt API
cobalt has an open API that you can use for free. It's easy and straightforward to use, [check out the docs](https://github.com/wukko/cobalt/blob/current/docs/API.md) and see for yourself.

## How to contribute translations
You can translate cobalt to any language you want on [cobalt's Crowdin](https://crowdin-co.wukko.me/). Feel free to ignore QA errors if you think you know better. If you don't see a language you want to translate cobalt to, open an issue, and I'll add it to Crowdin.

### Translation guidelines:
- All text is **ALWAYS** stylized as **lowercase** unless it's STRESSED LIKE THIS or is an internal value like `{ContactLink}` or `{appName}`. 
    - Example: "`this is a live video, i am yet to learn how to look into future. wait for the stream to finish and try again!`".  
    Notice how **everything is lowercase**, no matter the punctuation marks? Yes, that's cobalt's style and you have to follow it.
- Avoid formal language. Leave it for big and classy tech companies. Use informal language wherever possible.
- Keep translations lively, friendly, and fun. Translate strings as if the user was your buddy.
- You can (and should) rephrase sentences as long as they keep the same sense and send the same message as original.
- You can add wordplays or puns if it feels natural to do so.
- Do **NOT** use offensive or explicit vocabulary.
- Check if there are issues in UI with your localization, and optimize it accordingly. If impossible, open an issue.
- Be nice.

## Host an instance yourself
You might find cobalt's source code a bit messy, but I do my best to improve it with every commit.

### Requirements
- Node.js 17.5 or above
- git

### npm modules
- cors
- dotenv
- esbuild
- express
- express-rate-limit
- ffmpeg-static
- got
- node-cache
- url-pattern
- xml-js
- youtubei.js

Setup script installs all needed `npm` dependencies, but you have to install `Node.js` and `git` yourself.

1. Clone the repo: `git clone https://github.com/wukko/cobalt`
2. Run setup script and follow instructions: `npm run setup`
3. Run cobalt via `npm start`
4. Done.

### Docker
It's also possible to host cobalt via a Docker image, but in that case you'd need to set all environment variables by yourself.
That includes:
| Variable     | Example                          | 
| --------     | :---                             |
| `selfURL`    | `https://co.wukko.me/`           |
| `port`       | `9000`                           |
| `streamSalt` | `randomly generated sha512 hash` |
| `cors`       | `0`                              |

## Disclaimer
cobalt is my passion project, so update release schedule depends solely on my motivation, free time, and mood. Don't expect any consistency in that.

## License
cobalt is under [AGPL-3.0](https://github.com/wukko/cobalt/blob/current/LICENSE) license.

[Fluent Emoji](https://github.com/microsoft/fluentui-emoji) used in the project is under [MIT](https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE) license.
