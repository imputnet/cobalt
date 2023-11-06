# cobalt
best way to save what you love: [cobalt.tools](https://cobalt.tools/)  

![cobalt logo with repeated logo (double arrow) pattern background](https://raw.githubusercontent.com/wukko/cobalt/current/src/front/icons/pattern.png "cobalt logo with repeated logo (double arrow) pattern background")  

## what's cobalt?
cobalt is a media downloader that doesn't piss you off. it's fast, friendly, and doesn't have any bullshit that modern web is filled with: ***no ads, trackers, or analytics***.  

paste the link, get the file, move on. it's that simple. just how it should be.

## supported services
this list is not final and keeps expanding over time. if support for a service you want is missing, create an issue (or a pull request 👀).

| service                        | video + audio | only audio | only video | metadata | rich file names |
| :--------                      | :-----------: | :--------: | :--------: | :------: | :-------------: |
| bilibili.com                   | ✅            | ✅         | ✅         | ➖         | ➖              |
| instagram posts & stories      | ✅            | ✅         | ✅         | ➖         | ➖              |
| instagram reels                | ✅            | ✅         | ✅         | ➖         | ➖              |
| pinterest                      | ✅            | ✅         | ✅         | ➖         | ➖              |
| reddit                         | ✅            | ✅         | ✅         | ❌         | ❌              |
| rutube                         | ✅            | ✅         | ✅         | ✅         | ✅              |
| soundcloud                     | ➖            | ✅         | ➖         | ✅         | ✅              |
| streamable                     | ✅            | ✅         | ✅         | ➖         | ➖              |
| tiktok                         | ✅            | ✅         | ✅         | ❌         | ❌              |
| tumblr                         | ✅            | ✅         | ✅         | ➖         | ➖              |
| twitch clips                   | ✅            | ✅         | ✅         | ✅         | ❌              |
| twitter/x                      | ✅            | ✅         | ✅         | ➖         | ➖              |
| vimeo                          | ✅            | ✅         | ✅         | ✅         | ✅              |
| vine archive                   | ✅            | ✅         | ✅         | ➖         | ➖              |
| vk videos & clips              | ✅            | ❌         | ❌         | ✅         | ✅              |
| youtube videos, shorts & music | ✅            | ✅         | ✅         | ✅         | ✅              |

| emoji   | meaning                 |
| :-----: | :---------------------- |
| ✅      | supported               |
| ➖      | impossible/unreasonable |
| ❌      | not supported           |

### additional notes or features (per service)
| service    | notes or features                                                                                                    |
| :--------  | :-----                                                                                                               |
| instagram  | supports photos, videos, and stories. lets you pick what to save from multi-media posts.                             |
| pinterest  | supports videos and stories.                                                                                         |
| reddit     | supports gifs and videos.                                                                                            |
| soundcloud | supports private links.                                                                                              |
| tiktok     | supports videos with or without watermark, images from slideshow without watermark, and full (original) audios.      |
| twitter/x  | lets you pick what to save from multi-media posts. may not be 100% reliable due to current management.               |
| vimeo      | audio downloads are only available for dash.                                                                         |
| youtube    | supports videos, music, and shorts. 8K, 4K, HDR, VR, and high FPS videos. rich metadata & dubs. h264/av1/vp9 codecs. |

## cobalt api
cobalt has an open api that you can use in projects *for completely free~*. it's easy and straightforward to use, [check out the docs](https://github.com/wukko/cobalt/blob/current/docs/api.md) to learn how to use it. 

you can use the main api instance ([co.wuk.sh](https://co.wuk.sh/)) in your projects.

## how to run your own instance
if you want to run your own instance for whatever purpose, [follow this guide](https://github.com/wukko/cobalt/blob/current/docs/run-an-instance.md).  
it's *highly* recommended to use a docker compose method unless you run for developing/debugging purposes.

## sponsors 
cobalt is sponsored by [royalehosting.net](https://royalehosting.net/), all main instances are currently hosted on their network :)  

## ethics and disclaimer
cobalt is a tool for easing content downloads from internet and takes ***zero liability***. you are responsible for what you download, how you use and distribute that content. please be mindful when using content of others and always credit original creators. fair use and credits benefit everyone.

cobalt is ***NOT*** a piracy tool and cannot be used as such. it can only download free, publicly accessible content. such content can be easily downloaded through any browser's dev tools. pressing one button is easier, so i made a convenient, ad-less tool for such repeated actions.

cobalt is my passion project, update schedule depends solely on my free time, motivation, and mood. don't expect any consistency in update releases.

## cobalt licenses
cobalt code is licensed under [AGPL-3.0](https://github.com/wukko/cobalt/blob/current/LICENSE).

update banners and various assets of cobalt branding included within the repo are *not* covered by the AGPL-3.0 license and cannot be used using same terms. 

## 3rd party licenses
[Fluent Emoji by Microsoft](https://github.com/microsoft/fluentui-emoji) (used in cobalt) is under [MIT](https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE) license.  

[Noto Sans Mono](https://fonts.google.com/noto/specimen/Noto+Sans+Mono/) fonts (used in cobalt) are licensed under the [OFL](https://fonts.google.com/noto/specimen/Noto+Sans+Mono/about) license.

many update banners were taken from [tenor.com](https://tenor.com/).