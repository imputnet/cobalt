# ytubedl-engine (vendored)

Vendored copy of the YTubeDL engine — the pure-JS, zero-dependency YouTube
extraction engine used by the `youtube` service.

- Version: 1.1.0.
- Contents: the engine's `dist/esm` build output (runtime `.js` files only;
  type declarations stripped). MIT licensed — see `LICENSE`.
- Entry point used by cobalt: `providers/index.js` (`probeUrl`).
- Optional env: `YTUBEDL_COOKIES` — path to a Netscape-format cookies.txt
  attached to YouTube requests (unlocks age-gated content and clears bot
  checks on flagged server IPs).

## cobalt patches (re-apply after updating)

`providers/youtube.js` accepts two extra probe options, wired up by
`processing/helpers/ytubedl.js`:

- `cookieHeader` — a ready `Cookie` header. cobalt rotates the `youtube`
  entry from its `cookies.json` per request; it takes precedence over
  `YTUBEDL_COOKIES`.
- `fetch` — fetch implementation used for every extraction request. cobalt
  injects an undici fetch bound to the request's freebind `dispatcher` so
  extraction honours `FREE_BIND_CIDR`.
- Widevine (`drmFamilies`) formats are skipped instead of advertised; when
  every stream of a video is DRM-protected the probe reports it as a DRM
  failure, which cobalt maps to `youtube.drm` (upstream engine would hand out
  undecryptable URLs).

To update: build the engine repository (`npm run build`), copy
`dist/esm/**/*.js` over this directory, then re-apply the patch above.
