# cobalt
Best way to save what you love.  
Live web app: [co.wukko.me](https://co.wukko.me/)  

![cobalt logo with repeated logo pattern background](https://raw.githubusercontent.com/wukko/cobalt/current/src/front/icons/pattern.png "cobalt logo with repeated logo pattern background")  

[![DeepSource](https://deepsource.io/gh/wukko/cobalt.svg/?label=active+issues&token=MsmsJ9zUOKwcQor0yaiFot84)](https://deepsource.io/gh/wukko/cobalt/?ref=repository-badge)

## What's cobalt?
cobalt is social and media platform downloader that doesn't piss you off.

It's fast, friendly, and doesn't have any bullshit that modern web is filled with: no ads, trackers, or analytics.  
Paste the link, get the video, move on. It's that simple. Just how it should be.

## Supported services
| Service                 | Video + Audio | Only audio  | Only video  | Additional notes or features                                                                                              |
| --------                | :---:         | :---:       | :---:       | :-----                                                                                                                    |
| bilibili.com            | ✅           | ✅         | ✅         |                                                                                                                           |
| Instagram               | ✅           | ✅         | ✅         | Ability to pick what to save from multi-media posts.                                                                      |
| Instagram Reels         | ✅           | ✅         | ✅         |                                                                                                                           |
| Pinterest               | ✅           | ✅         | ✅         | Support for videos and stories.                                                                                           |
| Reddit                  | ✅           | ✅         | ✅         | Support for GIFs and videos.                                                                                              |
| SoundCloud              | ➖           | ✅         | ➖         | Audio metadata, downloads from private links.                                                                             |
| TikTok                  | ✅           | ✅         | ✅         | Supports downloads of: videos with or without watermark, images from slideshow without watermark, full (original) audios. |
| Tumblr                  | ✅           | ✅         | ✅         | Support for audio file downloads.                                                                                         |
| Twitter*                | ✅           | ✅         | ✅         | Ability to pick what to save from multi-media tweets.                                                                     |
| Vimeo                   | ✅           | ✅         | ✅         | Audio downloads are only available for dash files.                                                                        |
| Vine Archive            | ✅           | ✅         | ✅         |                                                                                                                           |
| VK Videos               | ✅           | ❌         | ❌         |                                                                                                                           |
| VK Clips                | ✅           | ❌         | ❌         |                                                                                                                           |
| YouTube Videos & Shorts | ✅           | ✅         | ✅         | Support for 8K, 4K, HDR, VR, and high FPS videos. Audio metadata & dubs. h264/av1/vp9 codecs.                             |
| YouTube Music           | ➖           | ✅         | ➖         | Audio metadata.                                                                                                           |

This list is not final and keeps expanding over time, make sure to check it once in a while!  
  
*Reliability of downloads from Twitter is questionable due to its current management.

## cobalt API
cobalt has an open API that you can use in your projects for **free**.  
It's easy and straightforward to use, [check out the docs](https://github.com/wukko/cobalt/blob/current/docs/API.md) and see for yourself.  
Feel free to use the main API instance ([co.wuk.sh](https://co.wuk.sh/)) in your projects.

## Host an instance yourself
### Requirements
- Node.js 18 or above
- git

Setup script installs all needed `npm` dependencies, but you have to install `Node.js` and `git` yourself.

1. Clone the repo: `git clone https://github.com/wukko/cobalt`
2. Run setup script and follow instructions: `npm run setup`
3. Run cobalt via `npm start`
4. Done.

You need to host API and web app separately since v.6.0. Setup script will help you with that!

### Ubuntu 22.04+ workaround
`nscd` needs to be installed and running so that the `ffmpeg-static` binary can resolve DNS ([#101](https://github.com/wukko/cobalt/issues/101#issuecomment-1494822258)):

```bash
sudo apt install nscd
sudo service nscd start
```

### Docker
It's also possible to run cobalt via Docker. I *highly* recommend using Docker compose.  
Check out the [example compose file](https://github.com/wukko/cobalt/blob/current/docker-compose.example.yml) and alter it for your needs.

## Disclaimer
cobalt is my passion project, so update schedule depends solely on my free time, motivation, and mood.  
Don't expect any consistency in that.

## License
cobalt is under [AGPL-3.0](https://github.com/wukko/cobalt/blob/current/LICENSE) license.  
[Fluent Emoji](https://github.com/microsoft/fluentui-emoji) used in the project is under [MIT](https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE) license.
