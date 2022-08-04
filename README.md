# cobalt
Sleek and easy to use social media downloader built with JavaScript.

Try it now: [co.wukko.me](https://co.wukko.me/)

![cobalt logo](https://raw.githubusercontent.com/wukko/cobalt/current/src/front/icons/wide.png "cobalt logo")

## What's cobalt?
cobalt aims to be the ultimate social media downloader, that is efficient, pretty, and doesn't bother you with ads or privacy invasion agreement popups. It also doesn't remux anything, so you get media in best quality possible (unless you change that in settings). 

## Supported services

### Video
- bilibili.com
- douyin
- Reddit
- TikTok
- Tumblr
- Twitter
- YouTube
- YouTube Music
- VK

### Audio
- YouTube
- YouTube Music

## Translations
- Spanish: [@adrigoomy](https://github.com/adrigoomy)
- French: [@lexito-o](https://github.com/lexito-o)
- Indonesian: [@LyfeV](https://github.com/LyfeV)
- Polish: [@hexandcube](https://github.com/hexandcube)

## How you can help cobalt speak your language
Take English or Russian localization from [this directory](https://github.com/wukko/cobalt/tree/current/src/localization/languages) and use it as a base for your translation. Then simply make a pull request and it'll be out for everyone upon review!

### What you should keep in mind:
- Do **NOT** use formal language, that's boring and lame. Use informal language on all occasions.
- Strings are **ALWAYS** lowercase unless it's an internal value like {ContactLink} or STRESSED LIKE THIS.
- Keep translations as friendly and fun as possible.
- Word-for-word translations from original language are not valid.
- You can rephrase sentences as long as they keep the same sense.
- You can add wordplays or puns if it feels natural to do so.
- Even though I love cursing, keep that away from translations.
- Be nice.

## TO-DO

### Services
- [x] Tumblr support
- [ ] niconico support
- [ ] Instagram support
- [ ] SoundCloud support
- [ ] Add an option to save Twitter GIFs as `.gif` instead of `.mp4`
- [ ] Quality switching for bilibili

### Other
- [ ] Language picker in settings
- [ ] Make switch buttons in settings selectable with keyboard
- [ ] Option to save audios in formats other than original
- [ ] Make cobalt fully PWA compatible (add a service worker)
- [ ] Make page rendering module more versatile

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
