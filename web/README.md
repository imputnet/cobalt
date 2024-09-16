# cobalt web
the cobalt frontend is a static web app built with
[sveltekit](https://kit.svelte.dev/) + [vite](https://vitejs.dev/).

## configuring
- to run a dev environment, run `pnpm run dev`.
- to make a release build of the frontend, run `pnpm run build`.

## environment variables
the frontend has several build-time environment variables for configuring various features. to use
them, you must specify them when building the frontend (or running a vite server for development).

| name                 | example                     | description                                                                                              |
|:---------------------|:----------------------------|:---------------------------------------------------------------------------------------------------------|
| `WEB_HOST`           | `cobalt.tools`              | domain on which the frontend will be running. used for meta tags and configuring plausible.              |
| `WEB_PLAUSIBLE_HOST` | `plausible.io`*             | enables plausible analytics with provided hostname as receiver backend.                                  |
| `WEB_DEFAULT_API`    | `https://api.cobalt.tools/` | changes url which is used for api requests by frontend clients.                                          |
| `WEB_TURNSTILE_KEY`  | `1x00000000000000000000AA`  | [cloudflare turnstile](https://www.cloudflare.com/products/turnstile/) public key for antibot protection |

\* don't use plausible.io as receiver backend unless you paid for their cloud service.
   use your own domain when hosting community edition of plausible. refer to their [docs](https://plausible.io/docs) when needed.

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

## 3rd party licenses
- [Fluent Emoji by Microsoft](https://github.com/microsoft/fluentui-emoji) (used in cobalt) is under [MIT](https://github.com/microsoft/fluentui-emoji/blob/main/LICENSE) license.
- [Noto Sans Mono](https://fonts.google.com/noto/specimen/Noto+Sans+Mono/) fonts (used in cobalt) are licensed under the [OFL](https://fonts.google.com/noto/specimen/Noto+Sans+Mono/about) license.
- many update banners were taken from [tenor.com](https://tenor.com/).
