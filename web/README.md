# cobalt web
the cobalt frontend is a static web app built with
[sveltekit](https://kit.svelte.dev/) + [vite](https://vitejs.dev/).

## configuring
- to run the dev environment, run `pnpm run dev`.
- to make the release build of the frontend, run `pnpm run build`.

## environment variables
the frontend has several build-time environment variables for configuring various features. to use
them, you must specify them when building the frontend (or running a vite server for development).

`WEB_DEFAULT_API` is **required** to run cobalt frontend.

| name                            | example                     | description                                                                                             |
|:--------------------------------|:----------------------------|:--------------------------------------------------------------------------------------------------------|
| `WEB_HOST`                      | `cobalt.tools`              | domain on which the frontend will be running. used for meta tags and configuring plausible.             |
| `WEB_PLAUSIBLE_HOST`            | `plausible.io`*             | enables plausible analytics with provided hostname as receiver backend.                                 |
| `WEB_DEFAULT_API`               | `https://api.cobalt.tools/` | changes url which is used for api requests by frontend clients.                                         |
| `ENABLE_DEPRECATED_YOUTUBE_HLS` | `true`                      | enables the youtube HLS settings entry; allows sending the related variable to the processing instance. |

\* don't use plausible.io as receiver backend unless you paid for their cloud service.
   use your own domain when hosting community edition of plausible. refer to their [docs](https://plausible.io/docs) when needed.

## link prefill
to prefill the link into the input box & start the download automatically, you can pass the URL in the `#` parameter, like this:
```
https://cobalt.tools/#https://www.youtube.com/watch?v=dQw4w9WgXcQ
```

the link can also be URI-encoded, like this:
```
https://cobalt.tools/#https%3A//www.youtube.com/watch%3Fv=dQw4w9WgXcQ
```

## license
cobalt web code is licensed under [CC-BY-NC-SA-4.0](LICENSE).

this license allows you to:
- copy and redistribute the code in any medium or format, and
- remix, transform, use and build upon the code

as long as you:
- give appropriate credit to the original repo,
- provide a link to the license and indicate if changes to the code were made,
- release the code under the **same license**, and
- **don't use the code for any commercial purposes**.

cobalt branding, mascots, and other related assets included in the repo are ***copyrighted*** and not covered by the license. you ***cannot*** use them under same terms.

you are allowed to host an ***unmodified*** instance of cobalt with branding for **non-commercial purposes**, but this ***does not*** give you permission to use the branding anywhere else, or make derivatives of it in any way.

when making an alternative version of the project, please replace or remove all branding (including the name).

## open source acknowledgments
### svelte + sveltekit
the cobalt frontend is built using [svelte](https://svelte.dev) and [sveltekit](https://svelte.dev/docs/kit/introduction), a really efficient and badass framework, we love it a lot.

### libav.js
our remux and encode workers rely on [libav.js](https://github.com/imputnet/libav.js), which is an optimized build of ffmpeg for the browser. the ffmpeg builds are made up of many components, whose licenses can be found here: [encode](https://github.com/imputnet/libav.js/blob/main/configs/configs/encode/license.js), [remux](https://github.com/imputnet/libav.js/blob/main/configs/configs/remux/license.js).

you can [support ffmpeg here](https://ffmpeg.org/donations.html)!

### fonts, icons and assets
the cobalt frontend uses several different fonts and icon sets.
- [Tabler Icons](https://tabler.io/icons), released under the [MIT](https://github.com/tabler/tabler-icons?tab=MIT-1-ov-file) license.
- [Fluent Emoji by Microsoft](https://github.com/microsoft/fluentui-emoji), released under the [MIT](https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE) license.
- [Noto Sans Mono](https://fonts.google.com/noto/specimen/Noto+Sans+Mono/) used for the download button, is licensed under the [OFL](https://fonts.google.com/noto/specimen/Noto+Sans+Mono/about) license.
- [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono/) used for all other text, is licensed under the [OFL](https://fonts.google.com/specimen/IBM+Plex+Mono/license) license.
- and the [Redaction](https://redaction.us/) font, which is licensed under the [OFL](https://github.com/fontsource/font-files/blob/main/fonts/other/redaction-10/LICENSE) license (as well as LGPL-2.1).
- many update banners were taken from [tenor.com](https://tenor.com/).

### other packages
- [mdsvex](https://github.com/pngwn/MDsveX) to convert the changelogs into svelte components.
- [compare-versions](https://github.com/omichelsen/compare-versions) for sorting the changelogs.
- [svelte-sitemap](https://github.com/bartholomej/svelte-sitemap) for generating a sitemap for the frontend.
- [sveltekit-i18n](https://github.com/sveltekit-i18n/lib) for displaying cobalt in many different languages.
- [vite](https://github.com/vitejs/vite) for building the frontend.

...and many other packages that these packages rely on.
