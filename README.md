# cobalt
Sleek and easy to use social media downloader built on JavaScript. Try it out live: [co.wukko.me](https://co.wukko.me/)!

![cobalt logo](https://raw.githubusercontent.com/wukko/cobalt/current/src/static/icons/wide.png "cobalt logo")

## What is cobalt?
cobalt aims to be the ultimate social media downloader, that is efficient, pretty, and doesn't bother you with ads or privacy invasion agreement popups.

cobalt doesn't remux any videos, so you get videos of max quality available (unless you change that in settings).

## What's supported?
- Twitter
- TikTok
- YouTube and YouTube Music
- bilibili.com
- Reddit
- VK

## TO-DO
- [ ] Instagram support
- [ ] Quality switching for bilibili and Twitter
- [ ] Language picker in settings
- [x] Use esmbuild to minify frontend css and js
- [ ] Make switch buttons in settings selectable with keyboard
- [ ] Remake page rendering module to be more versatile
- [ ] Matching could be redone, I'll see what I can do

## Disclaimer
This is my passion project, so update scheduele depends on my motivation. Don't expect any consistency in that.

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

Setup script installs all needed **npm** dependencies, but you have to install Node.js and git yourself, if you don't have those already.

1. Clone the repo: `git clone https://github.com/wukko/cobalt`
2. Run setup script and follow instructions: `npm run setup`
3. Run cobalt via `npm start`
4. Done.

## License
cobalt is under [AGPL-3.0 license](https://github.com/wukko/cobalt/blob/current/LICENSE), please keep that in mind.
