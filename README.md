# cobalt
Best way to save content you love.

[co.wukko.me](https://co.wukko.me/)

![cobalt logo](https://raw.githubusercontent.com/wukko/cobalt/current/src/front/icons/wide.png "cobalt logo")

[![Crowdin](https://badges.crowdin.net/cobalt/localized.svg)](https://crowdin.com/project/cobalt) [![DeepSource](https://deepsource.io/gh/wukko/cobalt.svg/?label=active+issues&token=MsmsJ9zUOKwcQor0yaiFot84)](https://deepsource.io/gh/wukko/cobalt/?ref=repository-badge) [![DeepSource](https://deepsource.io/gh/wukko/cobalt.svg/?label=resolved+issues&token=MsmsJ9zUOKwcQor0yaiFot84)](https://deepsource.io/gh/wukko/cobalt/?ref=repository-badge)

## What's cobalt?
cobalt is social media downloader with zero bullshit. It's friendly, accessible, efficient, and doesn't bother you with shock ads or privacy invasion "consent" popups.

It preserves original media quality so you get best downloads possible (unless you change that in settings).

## Supported services
| Service | Video + Audio | Only audio | Additional features |
| --------          | :---:  | :---: | :----- |
| Twitter           | ✅    | ✅ |  |
| YouTube           | ✅    | ✅ | Supports HDR and high FPS videos; quality picking |
| YouTube Music     | ❌    | ✅ |  |
| Reddit            | ✅    | ✅ |  |
| TikTok & douyin   | ✅    | ✅ | Videos can be downloaded with or without watermark, preference is set by user; image slideshow downloads are always without watermark. |
| SoundCloud        | ❌    | ✅ |  |
| bilibili.com      | ✅    | ✅ |  |
| Tumblr            | ✅    | ✅ |  |
| Vimeo             | ✅    | ⚒️ | Quality picking |
| VK                | ✅    | ⚒️ | Quality picking |

## How to contribute translations
You can translate cobalt to any language you want on [cobalt's crowdin](https://crowdin-co.wukko.me/). Feel free to ignore QA errors if you think you know better. If you don't see a language you want to translate cobalt to, open an issue, and I'll add it to crowdin.

### Translation guidelines:
- Avoid formal language. Leave it for boring big tech companies. Use informal language on all occasions.
- Strings are **ALWAYS** stylized as lowercase unless it's STRESSED LIKE THIS or is an internal value like `{ContactLink}`.
- Keep translations lively, friendly, and fun. Translate strings as if cobalt user was your buddy.
- Automatic translations from original language are not valid, and will be ignored.
- You can (and should) rephrase sentences as long as they keep the same point, if you think it'd be better that way.
- You can add wordplays or puns if it feels natural to do so.
- Even though I love cursing, keep that to minimum in translations, and do **NOT** use any offensive words.
- Check if there are issues in UI with your localization, and optimize it accordingly, or open an issue.
- Add "(in english)" translated to your language at the end of `ChangelogLastCommit`, `ChangelogLastMajor`, and `ChangelogOlder`. Those are always kept exclusively in English (for now), due to how often changelog changes.
    - Sample translation to Russian: `"ChangelogLastCommit": "последний коммит (на английском)"`
- Be nice.

## Host an instance yourself
You might find cobalt's source code a bit messy, but I do my best to improve it with every commit.

### Requirements
- Node.js 14.16 or above
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
- ytdl-core

Setup script installs all needed `npm` dependencies, but you have to install `Node.js` and `git` yourself.

1. Clone the repo: `git clone https://github.com/wukko/cobalt`
2. Run setup script and follow instructions: `npm run setup`
3. Run cobalt via `npm start`
4. Done.

## Disclaimer
cobalt is my passion project, so new feature release schedule depends solely on my motivation and mood. Don't expect any consistency in that.

## License
cobalt is under [AGPL-3.0](https://github.com/wukko/cobalt/blob/current/LICENSE).

[Fluent Emoji](https://github.com/microsoft/fluentui-emoji) by Microsoft is under [MIT](https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE).
