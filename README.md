# cobalt
Sleek and easy to use social media downloader built on JavaScript. Try it out live: [co.wukko.me](https://co.wukko.me/)!

![cobalt logo](https://raw.githubusercontent.com/wukko/cobalt/current/files/icons/wide.png "cobalt logo")

## What is cobalt?
Everyone is annoyed by the mess video downloaders are on the web, and cobalt aims to be the ultimate social media downloader, that is sleek, easy to use, and doesn't bother you with ads or privacy invasion agreement popups.

cobalt doesn't remux any videos, so videos you get are max quality available (unless you change that in settings).

## What's supported?
- Twitter
- YouTube and YouTube Music
- bilibili.com
- Reddit
- VK

## What still has to be done
- [ ] Quality switching for bilibili and Twitter
- [ ] Clean up the mess that localisation is right now
    - [ ] Sort contents of .json files
    - [ ] Rename each entry key to be less linked to specific service (entries like youtubeBroke are awful, I'm sorry)
- [ ] Add support for more languages when localisation clean up is done
- [ ] Clean up css
- [ ] Use esmbuild to minify frontend css and js
- [ ] Make switch buttons in settings selectable with keyboard
- [ ] Do something about changelog because the way it is right now is not really great
- [ ] Remake page rendering module to be more versatile
- [ ] Clean up code to be more consistent across modules
- [ ] Matching could be redone, I'll see what I can do
- [ ] Facebook and Instagram support
- [ ] TikTok support (?)
- [ ] Support for bilibili.tv (?)

## Disclaimer
This is my passion project, so update scheduele depends on my motivation. Don't expect any consistency in that.

## Make your own homegrown cobalt
Code might be a little messy, but I promise to improve it over time.

### Requirements
- Node.js 14.16 or above
- git

### npm modules
- express
- got
- url-pattern
- xml-js
- dotenv
- express-rate-limit
- ffmpeg-static
- node-cache
- ytdl-core

Setup script installs all needed **npm** dependencies, but you have to install Node.js and git yourself, if you don't have those already.

1. Clone the repo: `git clone https://github.com/wukko/cobalt`
2. Run setup script and follow instructions: `npm run setup`
3. Run cobalt via `npm start` or `node cobalt`
4. Done.

## License
cobalt is under [GPL-3.0 license]([https://github.com/wukko/cobalt/LICENSE](https://github.com/wukko/cobalt/blob/current/LICENSE)), keep that in mind when doing something with it.
