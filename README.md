# cobalt
Best way to save content you love.

[co.wukko.me](https://co.wukko.me/)

![cobalt logo](https://raw.githubusercontent.com/wukko/cobalt/current/src/front/icons/wide.png "cobalt logo")

## What's cobalt?
cobalt is social media downloader with zero bullshit. It's efficient, easy to use, and doesn't bother you with ads or privacy invasion "consent" popups.

It preserves original media quality so you get best downloads possible (unless you change that in settings).

## Supported services
- bilibili.com
- douyin (with or without watermark, preference set by user)
- Reddit
- SoundCloud
- TikTok (with or without watermark, preference set by user)
- Tumblr
- Twitter
- Vimeo
- VK
- YouTube (with HDR support)
- YouTube Music

## Translations
- Spanish: [@adrigoomy](https://github.com/adrigoomy) (translation is outdated, update needed)
- French: [@lexito-o](https://github.com/lexito-o) (translation is outdated, update needed)
- Indonesian: [@LyfeV](https://github.com/LyfeV) (translation is outdated, update needed)
- Polish: [@hexandcube](https://github.com/hexandcube)
- Ukrainian: Löffel

### Languages that are always up to date
- English
- Russian
- Ukrainian

Other languages may be missing some strings or changes, you can help with updating those!

## How you can help cobalt speak your language
Take English or Russian localization from [this directory](https://github.com/wukko/cobalt/tree/current/src/localization/languages) and use it as a base for your translation. Then simply make a pull request and it'll be out for everyone upon review!

### What you should keep in mind:
- Do **NOT** use formal language, that's boring and lame. Use informal language on all occasions.
- Strings are **ALWAYS** lowercase unless it's an internal value like {ContactLink} or STRESSED LIKE THIS.
- Keep translations as friendly and fun as possible. Just as if cobalt user was your buddy.
- Robotic translations from original language are not valid.
- You can (and should) rephrase sentences as long as they keep the same sense, if you think it'd be better that way.
- You can add wordplays or puns if it feels natural to do so.
- Even though I love cursing, keep that to minimum in translations, and do **NOT** use offensive words.
- Always check if there are issues in UI with your localization.
- There's no need to translate `ChangelogContentTitle` and `ChangelogContent`, because those are very often changed. You can remove both of them from your translation file.
- Add "(in english)" translated to your language at the end of `ChangelogLastCommit` and `ChangelogLastMajor`. Those are almost always kept exclusively in English. Remove that phrase if you do translate major update changelog.
    - Example: `"ChangelogLastCommit": "последний коммит (на английском)"`
- Be nice.

## Host an instance yourself
Code might be a little messy, but I do my best to improve it with every commit.

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
This is my passion project, so update scheduele depends solely on my motivation. Don't expect any consistency in that.

## License
cobalt is under [AGPL-3.0](https://github.com/wukko/cobalt/blob/current/LICENSE).
[Fluent Emoji](https://github.com/microsoft/fluentui-emoji) by Microsoft is under [MIT](https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE).
