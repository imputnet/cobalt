/**
 * Threads Downloader Engine — v1.0.0
 * ============================================================================
 *
 * A dependency-free, isomorphic (browser + Node 18+) engine that turns
 * threads.net / threads.com post links into downloadable media.
 *
 *   extract links  ->  fetch post metadata  ->  download images & videos
 *                  ->  optional ZIP bundling (pass JSZip)
 *
 * Extraction strategy chain (battle-tested, logged-out):
 *   1. GraphQL `BarcelonaPostPageTargetQuery` with a bootstrapped session
 *      (csrftoken cookie + LSD token). Full data: carousels, videos, captions.
 *   2. Session refresh + retry when Threads answers with a challenge page.
 *   3. Fallback: bot-UA scrape of og:image / og:description meta tags.
 *
 * Usage (Node):
 *   import pkg from './threads-downloader-engine.js';
 *   const { threads } = pkg;
 *   const result = await threads.extract('https://www.threads.net/@user/post/CODE');
 *
 * Usage (browser — needs a tiny server route, see INTEGRATION.md):
 *   const engine = new ThreadsDownloaderEngine({
 *     extractEndpoint: '/api/extract',
 *     mediaEndpoint: '/api/media?u={url}&name={name}',
 *   });
 *
 * License: MIT — see LICENSE. Not affiliated with Meta / Threads.
 */

(function (root, factory) {
  var api = factory();
  /* CommonJS (Node, bundlers): export the namespace object so
     `const { threads, ThreadsDownloaderEngine } = require(...)` works. */
  if (typeof module === "object" && module.exports) {
    module.exports = api;
    return;
  }
  /* Browsers: expose the CLASS itself as the global, carrying every helper
     as a static — so `new ThreadsDownloaderEngine({...})` AND
     `ThreadsDownloaderEngine.extractThreadLinks(...)` both work. */
  var EngineClass = api.ThreadsDownloaderEngine;
  EngineClass.threads = api.threads;
  root.ThreadsDownloaderEngine = EngineClass;
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function () {
  "use strict";
  /* eslint-disable @typescript-eslint/no-this-alias -- classic prototype-style
     UMD module; `var self = this` is intentional throughout */

  var VERSION = "1.0.0";

  /* ==========================================================================
   * Constants
   * ======================================================================== */

  var DESKTOP_UA =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

  var BOT_UA =
    "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)";

  var GRAPHQL_ENDPOINT = "https://www.threads.com/api/graphql";

  /** BarcelonaPostPageTargetQuery — captured live from threads.com. */
  var POST_PAGE_TARGET_DOC_ID = "28665223453172503";

  /** Instagram / Threads client application id header value. */
  var IG_APP_ID = "238260118697367";

  /**
   * Relay provider flags the TargetQuery requires. Captured from a real
   * logged-out page load; static values that toggle optional fields.
   */
  var RELAY_PROVIDER_FLAGS = {
    __relay_internal__pv__BarcelonaHasCommunityPermalinkPivotsrelayprovider: false,
    __relay_internal__pv__BarcelonaHasPodcastV2Consumptionrelayprovider: true,
    __relay_internal__pv__BarcelonaHasPodcastV2Productionrelayprovider: false,
    __relay_internal__pv__BarcelonaHasInsightsPermalinkUFIrelayprovider: true,
    __relay_internal__pv__BarcelonaHasBestOfThreadsrelayprovider: true,
    __relay_internal__pv__BarcelonaShouldShowFediverseM1Featuresrelayprovider: false,
    __relay_internal__pv__BarcelonaHasDearAlgoConsumptionrelayprovider: true,
    __relay_internal__pv__BarcelonaHasMetaAiContentAttachmentsrelayprovider: false,
    __relay_internal__pv__BarcelonaHasMWRLocationConsumptionrelayprovider: false,
    __relay_internal__pv__BarcelonaShouldFetchPostAuthorFullNamerelayprovider: false,
    __relay_internal__pv__BarcelonaIsLoggedInrelayprovider: false,
    __relay_internal__pv__BarcelonaMessagesHasLiveChatMessagingrelayprovider: false,
    __relay_internal__pv__BarcelonaHasEventBadgerelayprovider: false,
    __relay_internal__pv__BarcelonaMessagingHasMetaAIBotrelayprovider: false,
    __relay_internal__pv__BarcelonaHasMembersOnlyReplyConsumptionrelayprovider: false,
    __relay_internal__pv__BarcelonaGenAIRepliesEnabledrelayprovider: false,
    __relay_internal__pv__BarcelonaIsSearchDiscoveryEnabledrelayprovider: false,
    __relay_internal__pv__BarcelonaHasCommunitiesrelayprovider: true,
    __relay_internal__pv__BarcelonaHasGameScoreSharerelayprovider: true,
    __relay_internal__pv__BarcelonaHasPublicViewCountCardrelayprovider: true,
    __relay_internal__pv__BarcelonaHasCommunityEmojiUpdateCardrelayprovider: true,
    __relay_internal__pv__BarcelonaHasCommunityEntityCardrelayprovider: false,
    __relay_internal__pv__BarcelonaHasScorecardCommunityrelayprovider: false,
    __relay_internal__pv__BarcelonaHasSportTeamAllegianceCardrelayprovider: false,
    __relay_internal__pv__BarcelonaHasStitchedAttachmentrelayprovider: false,
    __relay_internal__pv__BarcelonaHasNewspaperLinkStylerelayprovider: false,
    __relay_internal__pv__BarcelonaHasMessagingrelayprovider: false,
    __relay_internal__pv__BarcelonaOptionalCookiesEnabledrelayprovider: true,
    __relay_internal__pv__BarcelonaPostMediaReuseEnabledrelayprovider: false,
    __relay_internal__pv__BarcelonaShouldFulfillLightboxQueryrelayprovider: true,
    __relay_internal__pv__BarcelonaCanSeeSponsoredContentrelayprovider: false,
    __relay_internal__pv__BarcelonaHasUnseenRepliesrelayprovider: false,
    __relay_internal__pv__BarcelonaHasWebFaviconsrelayprovider: true,
    __relay_internal__pv__BarcelonaIsCrawlerrelayprovider: false,
    __relay_internal__pv__BarcelonaHasDearAlgoWebProductionrelayprovider: false,
    __relay_internal__pv__BarcelonaHasCommunityTopContributorsrelayprovider: false,
    __relay_internal__pv__BarcelonaHasTopLevelSaveButtonrelayprovider: false,
    __relay_internal__pv__BarcelonaHasCustomLikesConsumptionrelayprovider: false,
    __relay_internal__pv__BarcelonaHasViewerRepliedrelayprovider: true,
    __relay_internal__pv__BarcelonaHasPrivateRepliesDeprecationrelayprovider: false,
    __relay_internal__pv__BarcelonaHasGhostPostEmojiActivationrelayprovider: false,
    __relay_internal__pv__BarcelonaHasGhostPostProductionrelayprovider: false,
    __relay_internal__pv__BarcelonaHasNewsletterLinkPreviewrelayprovider: true,
    __relay_internal__pv__BarcelonaIsLoggedOutShareTestEnabledrelayprovider: false,
    __relay_internal__pv__BarcelonaHasPodcastTranscriptConsumptionrelayprovider: true,
    __relay_internal__pv__BarcelonaHasPublicViewCountShareCardrelayprovider: false,
    __relay_internal__pv__BarcelonaShouldShowFediverseM075Featuresrelayprovider: false,
    __relay_internal__pv__BarcelonaIsInternalUserrelayprovider: false,
  };

  /** Hosts the engine is willing to download media from (prevents SSRF). */
  var ALLOWED_MEDIA_HOST_SUFFIXES = [
    ".cdninstagram.com",
    ".fbcdn.net",
    ".threads.com",
    ".threads.net",
  ];

  var DEFAULTS = {
    quality: "best",
    extractTimeoutMs: 15000,
    downloadTimeoutMs: 90000,
    retries: 2,
    downloadConcurrency: 2,
    extractConcurrency: 2,
    sessionTtlMs: 45 * 60 * 1000,
    debug: false,
  };

  /* ==========================================================================
   * Small utilities
   * ======================================================================== */

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  /** Normalises any thrown value into an Error. */
  function toError(err) {
    return err instanceof Error ? err : new Error(String(err));
  }

  /**
   * EngineError — every failure the engine raises carries a machine-readable
   * `code` so callers can branch reliably.
   *
   * Codes: invalid-url | not-found | network | rate-limited | timeout |
   *        aborted | media-expired | http-error | zip-provider-missing | unknown
   */
  function EngineError(code, message, status) {
    var e = new Error(message);
    e.name = "EngineError";
    e.code = code;
    if (typeof status === "number") e.status = status;
    Object.setPrototypeOf(e, EngineError.prototype);
    return e;
  }
  EngineError.prototype = Object.create(Error.prototype);
  EngineError.prototype.constructor = EngineError;

  function isAbortError(err) {
    return (
      err instanceof Error &&
      (err.name === "AbortError" || err.code === "aborted")
    );
  }

  function ensureFetch() {
    if (typeof fetch !== "function") {
      throw EngineError(
        "network",
        "Global fetch() not found. Use Node.js 18+ or pass { fetchImpl } in the engine options."
      );
    }
  }

  /**
   * fetch() with a hard timeout that also honours an external AbortSignal.
   * Falls back gracefully where AbortSignal.timeout is unavailable.
   */
  function fetchWithTimeout(url, opts, timeoutMs) {
    opts = opts || {};
    ensureFetch();
    var controller = new AbortController();
    var timedOut = false;
    var timer = setTimeout(function () {
      timedOut = true;
      controller.abort();
    }, timeoutMs);

    var external = opts.signal;
    var onExternalAbort = function () {
      controller.abort();
    };
    if (external) {
      if (external.aborted) {
        clearTimeout(timer);
        return Promise.reject(EngineError("aborted", "Operation aborted."));
      }
      external.addEventListener("abort", onExternalAbort, { once: true });
    }

    var fetchOpts = {};
    for (var k in opts) {
      if (Object.prototype.hasOwnProperty.call(opts, k) && k !== "signal") {
        fetchOpts[k] = opts[k];
      }
    }
    fetchOpts.signal = controller.signal;

    return fetch(url, fetchOpts)
      .finally(function () {
        clearTimeout(timer);
        if (external) external.removeEventListener("abort", onExternalAbort);
      })
      .catch(function (err) {
        if (external && external.aborted && !timedOut) {
          throw EngineError("aborted", "Operation aborted.");
        }
        if (timedOut || isAbortError(err)) {
          throw EngineError(
            "timeout",
            "Request timed out after " + timeoutMs + "ms."
          );
        }
        throw err;
      });
  }

  /** Run async tasks with bounded concurrency. */
  function runWithConcurrency(tasks, limit) {
    limit = Math.max(1, Math.min(limit || 1, tasks.length || 1));
    var cursor = 0;
    var workers = [];
    var _loop = function () {
      workers.push(
        new Promise(function (resolve, reject) {
          function next() {
            var i = cursor++;
            if (i >= tasks.length) return resolve();
            Promise.resolve()
              .then(tasks[i])
              .then(next, reject);
          }
          next();
        })
      );
    };
    for (var w = 0; w < limit; w++) {
      _loop();
    }
    return Promise.all(workers);
  }

  function formatBytes(bytes) {
    if (typeof bytes !== "number" || isNaN(bytes)) return "";
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  }

  function decodeHtmlEntities(input) {
    return String(input)
      .replace(/&#(\d+);/g, function (_, n) {
        return String.fromCodePoint(Number(n));
      })
      .replace(/&#x([0-9a-fA-F]+);/g, function (_, h) {
        return String.fromCodePoint(parseInt(h, 16));
      })
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;|&apos;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">");
  }

  /* ==========================================================================
   * URL parsing + shortcode <-> numeric post id
   *
   * Threads (Instagram graph) shortcodes are base64url encodings of the
   * 64-bit media pk using the alphabet A-Za-z0-9-_ .
   * Verified live: Det0VBtgox5 -> 4012092986421841017
   * ======================================================================== */

  var SHORTCODE_ALPHABET =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

  /** Matches /@user/post/CODE, /user/post/CODE, legacy /t/CODE, bare /post/CODE. */
  var THREADS_URL_RE =
    /(?:https?:\/\/)?(?:www\.)?threads\.(?:net|com)\/(?:@?[\w.]{1,30}\/)?(?:post|t)\/([A-Za-z0-9_-]{5,30})/gi;

  /** Validate + normalise a bare shortcode. */
  function isValidCode(code) {
    return /^[A-Za-z0-9_-]{5,30}$/.test(String(code || ""));
  }

  /**
   * Extract every Threads post link from arbitrary pasted text.
   * Deduplicated by code, order preserved. Accepts full urls, bare fragments
   * like "threads.net/@user/post/CODE", or messy multi-line text.
   * @returns Array<{code: string, url: string}>
   */
  function extractThreadLinks(text) {
    var seen = {};
    var links = [];
    var re = new RegExp(THREADS_URL_RE.source, "gi");
    var m;
    while ((m = re.exec(String(text || ""))) !== null) {
      var code = m[1];
      if (!code || seen[code]) continue;
      seen[code] = true;
      links.push({ code: code, url: canonicalPostUrl(code) });
    }
    return links;
  }

  /** Validate a single url / fragment and pull the shortcode out of it. */
  function parseSingleThreadUrl(raw) {
    var links = extractThreadLinks(raw);
    return links.length > 0 ? links[0].code : null;
  }

  function canonicalPostUrl(code) {
    return "https://www.threads.com/post/" + code;
  }

  /** Accepts a full url, a bare shortcode, or anything in between. */
  function resolveCode(input) {
    var s = String(input || "").trim();
    if (!s) return null;
    if (isValidCode(s) && s.indexOf("/") === -1 && s.indexOf(".") === -1) {
      return s;
    }
    return parseSingleThreadUrl(s);
  }

  /** Convert a shortcode into the numeric post id used by the GraphQL api. */
  function shortcodeToPostId(code) {
    if (!isValidCode(code)) return null;
    var n = 0n;
    for (var i = 0; i < code.length; i++) {
      var idx = SHORTCODE_ALPHABET.indexOf(code[i]);
      if (idx < 0) return null;
      n = n * 64n + BigInt(idx);
    }
    if (n <= 0n) return null;
    return n.toString();
  }

  /* ==========================================================================
   * Filenames + bundle helpers
   * ======================================================================== */

  function sanitizeFilename(name) {
    var safe = String(name || "")
      .replace(/[^\w.\- ]+/g, "_")
      .replace(/_{2,}/g, "_")
      .replace(/^[\s.]+|[\s.]+$/g, "")
      .slice(0, 80);
    return safe || "threads";
  }

  function guessExtension(kind, url) {
    var clean = String(url || "").split("?")[0].toLowerCase();
    if (kind === "video") {
      if (/\.mp4$/.test(clean)) return ".mp4";
      if (/\.mov$/.test(clean)) return ".mov";
      if (/\.webm$/.test(clean)) return ".webm";
      return ".mp4";
    }
    if (/\.png$/.test(clean)) return ".png";
    if (/\.webp$/.test(clean)) return ".webp";
    if (/\.heic$/.test(clean)) return ".heic";
    return ".jpg";
  }

  /** Stable, filesystem-safe media filename: user_CODE_NN.ext */
  function buildMediaFilename(username, code, index, kind, sourceUrl) {
    var ext = guessExtension(kind, sourceUrl);
    var user = sanitizeFilename(username || "threads");
    var nn = String(index).padStart(2, "0");
    return user + "_" + code + "_" + nn + ext;
  }

  /** Per-post folder name used inside ZIPs / output directories. */
  function postFolderName(post) {
    return sanitizeFilename((post.username || "threads") + "_" + post.code).replace(
      /[^\w.\-]+/g,
      "_"
    );
  }

  /** Human-readable caption.txt content for an archived post. */
  function buildPostText(post) {
    return (
      (post.caption || "(no caption)") +
      "\n\n" +
      "—\nDownloaded from Threads: " +
      post.url +
      "\nSaved: " +
      new Date().toISOString() +
      "\n"
    );
  }

  /** Machine-readable metadata.json content for an archived post. */
  function buildPostMetadata(post) {
    return {
      url: post.url,
      username: post.username,
      code: post.code,
      posted_at: post.takenAt
        ? new Date(post.takenAt * 1000).toISOString()
        : null,
      likes: post.likeCount,
      media_count: post.media.length,
      is_text_only: post.isTextOnly,
      extracted_at: new Date().toISOString(),
      extractor: post.source,
    };
  }

  /** Pick a correct file extension from a content-type. */
  function extensionForContentType(contentType) {
    var ct = String(contentType || "").split(";")[0].trim().toLowerCase();
    switch (ct) {
      case "image/jpeg":
      case "image/jpg":
        return ".jpg";
      case "image/png":
        return ".png";
      case "image/webp":
        return ".webp";
      case "image/heic":
      case "image/heif":
        return ".heic";
      case "image/gif":
        return ".gif";
      case "video/mp4":
        return ".mp4";
      case "video/quicktime":
        return ".mov";
      case "video/webm":
        return ".webm";
      default:
        return "";
    }
  }

  /** Ensure a filename has an extension matching the upstream content-type. */
  function ensureExtension(name, contentType) {
    var dot = String(name).lastIndexOf(".");
    var hasExt = dot > 0 && name.length - dot <= 6;
    if (hasExt) return name;
    var ext = extensionForContentType(contentType);
    return ext ? name + ext : name + ".bin";
  }

  /** Guard against SSRF: only allow known Meta / Threads CDN hosts. */
  function isMediaHostAllowed(rawUrl) {
    var parsed;
    try {
      parsed = new URL(String(rawUrl));
    } catch (e) {
      return false;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return false;
    var host = parsed.hostname.toLowerCase();
    for (var i = 0; i < ALLOWED_MEDIA_HOST_SUFFIXES.length; i++) {
      var suffix = ALLOWED_MEDIA_HOST_SUFFIXES[i];
      if (host === suffix.slice(1) || host.slice(-suffix.length) === suffix) {
        return true;
      }
    }
    return false;
  }

  /* ==========================================================================
   * Session bootstrap (logged-out GraphQL access)
   *
   * 1. GET threads.com with a desktop UA -> csrftoken cookie + LSD token.
   * 2. GraphQL POST carries those cookies + X-FB-LSD + X-CSRFToken.
   * Session is cached per engine instance with a TTL and inflight dedupe.
   * ======================================================================== */

  function pickCookie(setCookies, name) {
    for (var i = 0; i < setCookies.length; i++) {
      var line = setCookies[i];
      var pair = line.split(";")[0];
      var eq = pair.indexOf("=");
      if (eq <= 0) continue;
      if (pair.slice(0, eq).trim() === name) return pair.slice(eq + 1).trim();
    }
    return null;
  }

  function extractLsd(html) {
    var m =
      html.match(/"LSD",\[\],\{"token":"([^"]+)"/) ||
      html.match(/"LSD"\s*,\s*\[\]\s*,\s*\{\s*"token":"([^"]+)"/);
    return m ? m[1] : null;
  }

  /* ==========================================================================
   * Raw GraphQL payload -> normalised post
   * ======================================================================== */

  function sortImages(candidates) {
    return (candidates || [])
      .filter(function (c) {
        return typeof c.url === "string" && c.url.length > 0;
      })
      .sort(function (a, b) {
        return (
          (b.width || 0) * (b.height || 0) - (a.width || 0) * (a.height || 0)
        );
      });
  }

  function pickPreviewUrl(images) {
    // Smallest rendition still >= 480px wide, else the smallest available.
    var sorted = sortImages(images);
    if (sorted.length === 0) return "";
    var wideEnough = sorted.filter(function (c) {
      return (c.width || 0) >= 480;
    });
    if (wideEnough.length > 0) return wideEnough[wideEnough.length - 1].url;
    return sorted[sorted.length - 1].url;
  }

  /** video_versions: type 101 = highest quality, 102 = medium, 103 = low. */
  function sortVideos(videos) {
    return (videos || [])
      .filter(function (v) {
        return typeof v.url === "string" && v.url.length > 0;
      })
      .sort(function (a, b) {
        return (a.type || 999) - (b.type || 999);
      });
  }

  function pickVideoUrl(videos, quality) {
    var sorted = sortVideos(videos);
    if (sorted.length === 0) return "";
    if (quality === "lowest") return sorted[sorted.length - 1].url;
    if (quality === "medium") {
      for (var i = 0; i < sorted.length; i++) {
        if (sorted[i].type === 102) return sorted[i].url;
      }
      return sorted[Math.min(1, sorted.length - 1)].url;
    }
    return sorted[0].url; // best
  }

  function buildMediaItems(raw, quality) {
    var pieces =
      raw.carousel_media && raw.carousel_media.length > 0
        ? raw.carousel_media
        : [raw];

    var items = [];
    var idx = 0;

    for (var i = 0; i < pieces.length; i++) {
      var piece = pieces[i];
      var images = sortImages(
        piece.image_versions2 ? piece.image_versions2.candidates : null
      );
      var videos = sortVideos(piece.video_versions);
      var isVideo =
        piece.media_type === 2 || (videos.length > 0 && images.length === 0);

      if (isVideo && videos.length > 0) {
        idx += 1;
        items.push({
          id: "video-" + idx,
          kind: "video",
          url: pickVideoUrl(videos, quality),
          previewUrl: pickPreviewUrl(images),
          posterUrl: images.length > 0 ? pickPreviewUrl(images) : undefined,
          width: piece.original_width || videos[0].width,
          height: piece.original_height || videos[0].height,
          index: idx,
        });
      } else if (images.length > 0) {
        idx += 1;
        var best = images[0];
        items.push({
          id: "image-" + idx,
          kind: "image",
          url: best.url,
          previewUrl: pickPreviewUrl(images),
          posterUrl: undefined,
          width: best.width || piece.original_width,
          height: best.height || piece.original_height,
          index: idx,
        });
      }
    }

    return items;
  }

  function buildPostFromRaw(raw, code, url, quality) {
    var media = buildMediaItems(raw, quality);
    var user = raw.user || {};
    return {
      code: raw.code || code,
      url: url,
      username: user.username || "threads",
      fullName: user.full_name || undefined,
      isVerified: Boolean(user.is_verified),
      avatarUrl: user.profile_pic_url || undefined,
      caption: (raw.caption && raw.caption.text) || "",
      takenAt: typeof raw.taken_at === "number" ? raw.taken_at : null,
      likeCount: typeof raw.like_count === "number" ? raw.like_count : null,
      mediaType: raw.media_type || 0,
      isTextOnly: media.length === 0,
      media: media,
      source: "graphql",
    };
  }

  /* ==========================================================================
   * Engine
   * ======================================================================== */

  /**
   * @param {object} [options]
   * @param {'best'|'medium'|'lowest'} [options.quality]          Video rendition (default 'best').
   * @param {string}  [options.extractEndpoint]    Browser mode: POST {url, quality} -> ExtractResult JSON.
   * @param {string}  [options.mediaEndpoint]      Browser mode: proxy template with {url} and {name} placeholders.
   * @param {number}  [options.extractTimeoutMs]   Per-request timeout for extraction (default 15000).
   * @param {number}  [options.downloadTimeoutMs]  Per-request timeout for media (default 90000).
   * @param {number}  [options.retries]            Retry attempts per request (default 2).
   * @param {number}  [options.extractConcurrency] Parallel posts during extractMany (default 2).
   * @param {number}  [options.downloadConcurrency] Parallel files per post (default 2).
   * @param {number}  [options.sessionTtlMs]       GraphQL session cache TTL (default 45 min).
   * @param {Function} [options.fetchImpl]         Custom fetch implementation (Node < 18).
   * @param {boolean} [options.debug]              Verbose console diagnostics.
   */
  function ThreadsDownloaderEngine(options) {
    this.options = Object.assign({}, DEFAULTS, options || {});
    this._session = null;
    this._sessionInflight = null;
  }

  ThreadsDownloaderEngine.prototype.version = VERSION;

  ThreadsDownloaderEngine.prototype._log = function () {
    if (this.options.debug && typeof console !== "undefined") {
      var args = Array.prototype.slice.call(arguments);
      args.unshift("[threads-engine]");
      console.log.apply(console, args);
    }
  };

  /* ------------------------------------------------------------------------
   * Session (per instance)
   * ---------------------------------------------------------------------- */

  ThreadsDownloaderEngine.prototype._bootstrapSession = function () {
    var self = this;
    return fetchWithTimeout(
      "https://www.threads.com/",
      {
        headers: {
          "User-Agent": DESKTOP_UA,
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        redirect: "follow",
      },
      this.options.extractTimeoutMs
    ).then(function (res) {
      var setCookies = [];
      try {
        if (typeof res.headers.getSetCookie === "function") {
          setCookies = res.headers.getSetCookie();
        }
      } catch (e) {
        setCookies = [];
      }
      return res.text().then(function (html) {
        var lsd = extractLsd(html);
        if (!lsd) {
          throw EngineError(
            "network",
            "session-bootstrap-failed: no LSD token in html"
          );
        }
        var cookieParts = [];
        var seen = {};
        for (var i = 0; i < setCookies.length; i++) {
          var pair = setCookies[i].split(";")[0];
          var eq = pair.indexOf("=");
          if (eq <= 0) continue;
          var name = pair.slice(0, eq).trim();
          if (seen[name]) continue;
          seen[name] = true;
          cookieParts.push(pair);
        }
        self._log("session bootstrapped");
        return {
          cookies: cookieParts.join("; "),
          csrf: pickCookie(setCookies, "csrftoken") || "",
          lsd: lsd,
          fetchedAt: Date.now(),
        };
      });
    });
  };

  ThreadsDownloaderEngine.prototype._getSession = function (force) {
    var self = this;
    if (
      !force &&
      this._session &&
      Date.now() - this._session.fetchedAt < this.options.sessionTtlMs
    ) {
      return Promise.resolve(this._session);
    }
    if (!this._sessionInflight) {
      this._sessionInflight = this._bootstrapSession().then(
        function (s) {
          self._session = s;
          self._sessionInflight = null;
          return s;
        },
        function (err) {
          self._sessionInflight = null;
          throw err;
        }
      );
    }
    return this._sessionInflight;
  };

  ThreadsDownloaderEngine.prototype._invalidateSession = function () {
    this._session = null;
  };

  /* ------------------------------------------------------------------------
   * GraphQL attempt
   * ---------------------------------------------------------------------- */

  /**
   * @returns {Promise<{kind:'ok',payload:object}|{kind:'challenge'}|{kind:'network'}|{kind:'error',message:string}>}
   */
  ThreadsDownloaderEngine.prototype._fetchGraphql = function (
    postId,
    session,
    referer,
    signal
  ) {
    var variables = JSON.stringify(
      Object.assign({ postID: postId }, RELAY_PROVIDER_FLAGS)
    );
    var body =
      "variables=" +
      encodeURIComponent(variables) +
      "&doc_id=" +
      encodeURIComponent(POST_PAGE_TARGET_DOC_ID) +
      "&lsd=" +
      encodeURIComponent(session.lsd);

    return fetchWithTimeout(
      GRAPHQL_ENDPOINT,
      {
        method: "POST",
        headers: {
          "User-Agent": DESKTOP_UA,
          "Content-Type": "application/x-www-form-urlencoded",
          "X-IG-App-ID": IG_APP_ID,
          "X-FB-LSD": session.lsd,
          "X-CSRFToken": session.csrf,
          "X-ASBD-ID": "129477",
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          Origin: "https://www.threads.com",
          Referer: referer,
          Cookie: session.cookies,
        },
        body: body,
        signal: signal,
      },
      this.options.extractTimeoutMs
    ).then(
      function (res) {
        return res.text().then(function (text) {
          if (!res.ok) {
            if (res.status === 429) {
              return {
                kind: "error",
                message:
                  "Threads is rate limiting requests. Wait a moment and retry.",
              };
            }
            if (res.status >= 400 && res.status < 500) {
              this._invalidateSession();
              return { kind: "challenge" };
            }
            return { kind: "network" };
          }
          // Challenge responses come back as html with 200.
          if (/^\s*</.test(text)) {
            this._invalidateSession();
            return { kind: "challenge" };
          }
          var payload;
          try {
            payload = JSON.parse(text);
          } catch (e) {
            this._invalidateSession();
            return { kind: "challenge" };
          }
          if (payload.errors && !payload.data) {
            var first =
              (payload.errors[0] && payload.errors[0].message) ||
              "GraphQL error";
            if (/not found/i.test(first)) {
              return {
                kind: "error",
                message: "Post not found — it may have been deleted.",
              };
            }
            return { kind: "error", message: first };
          }
          return { kind: "ok", payload: payload };
        }, this);
      }.bind(this),
      function () {
        return { kind: "network" };
      }
    );
  };

  /* ------------------------------------------------------------------------
   * og-tag fallback (image posts / basic metadata)
   * ---------------------------------------------------------------------- */

  ThreadsDownloaderEngine.prototype._extractViaOgTags = function (code, signal) {
    return fetchWithTimeout(
      canonicalPostUrl(code),
      {
        headers: {
          "User-Agent": BOT_UA,
          Accept: "text/html,application/xhtml+xml",
        },
        redirect: "follow",
        signal: signal,
      },
      this.options.extractTimeoutMs
    ).then(
      function (res) {
        if (!res.ok) return null;
        return res.text().then(function (html) {
          var ogImage = html.match(
            /<meta[^>]+property="og:image"[^>]+content="([^"]+)"/
          );
          var ogTitle = html.match(
            /<meta[^>]+property="og:title"[^>]+content="([^"]*)"/
          );
          var ogDesc = html.match(
            /<meta[^>]+property="og:description"[^>]+content="([^"]*)"/
          );
          var ogImage2 =
            ogImage ||
            html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/);
          if (!ogImage2) return null;
          var imageUrl = decodeHtmlEntities(ogImage2[1]);
          if (!/^https?:\/\//i.test(imageUrl)) return null;

          var title = ogTitle ? decodeHtmlEntities(ogTitle[1]) : "";
          var usernameMatch = title.match(/@([\w.]+)/);
          var username = usernameMatch ? usernameMatch[1] : "threads";
          var caption = ogDesc ? decodeHtmlEntities(ogDesc[1]) : "";

          return {
            ok: true,
            post: {
              code: code,
              url: canonicalPostUrl(code),
              username: username,
              isVerified: false,
              caption: caption,
              takenAt: null,
              likeCount: null,
              mediaType: 1,
              isTextOnly: false,
              media: [
                {
                  id: "image-1",
                  kind: "image",
                  url: imageUrl,
                  previewUrl: imageUrl,
                  index: 1,
                },
              ],
              source: "og-fallback",
            },
          };
        });
      },
      function () {
        return null;
      }
    );
  };

  /* ------------------------------------------------------------------------
   * Public: extraction
   * ---------------------------------------------------------------------- */

  /**
   * Extract one post.
   * @param {string} urlOrCode  Full post url, share fragment, or bare shortcode.
   * @param {object} [opts]     { quality?: 'best'|'medium'|'lowest', signal?: AbortSignal }
   * @returns {Promise<{ok:true,post:object}|{ok:false,error:string,code:string}>}
   */
  ThreadsDownloaderEngine.prototype.extract = function (urlOrCode, opts) {
    opts = opts || {};
    var self = this;
    var code = resolveCode(urlOrCode);
    if (!code) {
      return Promise.resolve({
        ok: false,
        code: "invalid-url",
        error: "This doesn't look like a Threads post link.",
      });
    }
    var quality = opts.quality || this.options.quality;

    // Browser mode: delegate to a server route (CORS + cookies live there).
    if (this.options.extractEndpoint) {
      return fetchWithTimeout(
        this.options.extractEndpoint,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            url: canonicalPostUrl(code),
            quality: quality,
          }),
          signal: opts.signal,
        },
        this.options.extractTimeoutMs
      ).then(
        function (res) {
          return res.json().then(function (data) {
            if (data && typeof data.ok === "boolean") return data;
            throw EngineError(
              "unknown",
              "Extraction endpoint returned an unexpected payload."
            );
          });
        },
        function (err) {
          var e = toError(err);
          return {
            ok: false,
            code: (isAbortError(e) || e.code === "aborted" || e.code === "timeout") ? e.code || "aborted" : "network",
            error:
              (isAbortError(e) ? "Operation aborted." : null) ||
              "Could not reach the extraction endpoint: " + e.message,
          };
        }
      );
    }

    if (typeof window !== "undefined") {
      return Promise.resolve({
        ok: false,
        code: "network",
        error:
          "Browser usage needs `new ThreadsDownloaderEngine({ extractEndpoint })` " +
          "— a tiny server route — because threads.com blocks cross-origin requests. " +
          "See INTEGRATION.md; setup takes ~5 minutes.",
      });
    }

    var postId = shortcodeToPostId(code);
    if (!postId) {
      return Promise.resolve({
        ok: false,
        code: "invalid-url",
        error: "This doesn't look like a Threads post link.",
      });
    }

    var postUrl = canonicalPostUrl(code);
    var sessionForce = false;
    var retries = this.options.retries;

    function attempt(attemptNo) {
      if (opts.signal && opts.signal.aborted) {
        return Promise.reject(EngineError("aborted", "Operation aborted."));
      }
      return self
        ._getSession(sessionForce)
        .then(function (session) {
          return self._fetchGraphql(postId, session, postUrl, opts.signal);
        })
        .then(function (res) {
          if (res.kind === "challenge") {
            self._invalidateSession();
            sessionForce = true;
            if (attemptNo < retries) return attempt(attemptNo + 1);
            return null; // fall through to og fallback
          }
          if (res.kind === "network") {
            if (attemptNo < retries) return attempt(attemptNo + 1);
            return {
              ok: false,
              code: "network",
              error:
                "Couldn't reach Threads. Check your connection and try again.",
            };
          }
          if (res.kind === "error") {
            return { ok: false, code: "unknown", error: res.message };
          }
          var media =
            res.payload && res.payload.data ? res.payload.data.media : null;
          if (!media || !media.pk) {
            self._invalidateSession();
            sessionForce = true;
            if (attemptNo < retries) return attempt(attemptNo + 1);
            return null; // fall through to og fallback
          }
          return {
            ok: true,
            post: buildPostFromRaw(media, code, postUrl, quality),
          };
        })
        .catch(function (err) {
          var e = toError(err);
          if (isAbortError(e) || e.code === "aborted" || e.code === "timeout") {
            throw e;
          }
          if (attemptNo < retries) return attempt(attemptNo + 1);
          return {
            ok: false,
            code: "network",
            error: "Network error while contacting Threads: " + e.message,
          };
        });
    }

    return attempt(0).then(function (result) {
      if (result) return result;
      self._log("graphql chain exhausted for", code, "— trying og fallback");
      return self._extractViaOgTags(code, opts.signal).then(function (og) {
        return (
          og || {
            ok: false,
            code: "not-found",
            error:
              "Couldn't extract this post. It may be deleted, private, " +
              "age-restricted, or Threads is temporarily blocking requests.",
          }
        );
      });
    });
  };

  /** extract() that throws EngineError on failure. */
  ThreadsDownloaderEngine.prototype.extractOrThrow = function (urlOrCode, opts) {
    return this.extract(urlOrCode, opts).then(function (result) {
      if (result.ok) return result.post;
      throw EngineError(result.code || "unknown", result.error);
    });
  };

  /**
   * Extract many posts from free-form text or an array of urls / codes.
   * Duplicates are removed automatically.
   *
   * @param {string|string[]} input
   * @param {object} [opts]  { onItem?(result, code), concurrency?, signal?, quality? }
   * @returns {Promise<{items:Array, stats:{total:number,ok:number,failed:number}}>}
   */
  ThreadsDownloaderEngine.prototype.extractMany = function (input, opts) {
    opts = opts || {};
    var self = this;
    var codes = [];
    var seen = {};

    if (Array.isArray(input)) {
      for (var i = 0; i < input.length; i++) {
        var c = resolveCode(input[i]);
        if (c && !seen[c]) {
          seen[c] = true;
          codes.push(c);
        }
      }
    } else {
      var links = extractThreadLinks(String(input || ""));
      for (var j = 0; j < links.length; j++) {
        if (!seen[links[j].code]) {
          seen[links[j].code] = true;
          codes.push(links[j].code);
        }
      }
    }

    var stats = { total: codes.length, ok: 0, failed: 0 };
    if (codes.length === 0) {
      return Promise.resolve({ items: [], stats: stats });
    }

    var items = new Array(codes.length);
    var tasks = codes.map(function (code, index) {
      return function () {
        if (opts.signal && opts.signal.aborted) {
          return Promise.reject(EngineError("aborted", "Operation aborted."));
        }
        return self
          .extract(code, { quality: opts.quality, signal: opts.signal })
          .then(function (result) {
            items[index] = result;
            if (result.ok) stats.ok++;
            else stats.failed++;
            if (typeof opts.onItem === "function") opts.onItem(result, code);
          });
      };
    });

    return runWithConcurrency(
      tasks,
      opts.concurrency || this.options.extractConcurrency
    ).then(function () {
      return { items: items, stats: stats };
    });
  };

  /* ------------------------------------------------------------------------
   * Public: media proxy helper (browser mode)
   * ---------------------------------------------------------------------- */

  /**
   * Resolve a CDN url through the configured mediaEndpoint template.
   * Without an endpoint the raw url is returned unchanged.
   */
  ThreadsDownloaderEngine.prototype.getMediaProxyUrl = function (
    mediaUrl,
    name
  ) {
    var template = this.options.mediaEndpoint;
    if (!template) return mediaUrl;
    return template
      .replace("{url}", encodeURIComponent(mediaUrl))
      .replace("{name}", encodeURIComponent(name || "threads-media"));
  };

  /* ------------------------------------------------------------------------
   * Public: downloading
   * ---------------------------------------------------------------------- */

  /**
   * Download one binary file (image or video) with byte-accurate progress,
   * retries and exponential backoff.
   *
   * @param {string|{url:string,name?:string}} urlOrItem
   * @param {object} [opts]  { name?, onProgress?({received,total,percent}), signal?, timeoutMs?, retries? }
   * @returns {Promise<{name:string,size:number,contentType:string,bytes:Uint8Array,blob:Blob|undefined}>}
   */
  ThreadsDownloaderEngine.prototype.downloadMedia = function (urlOrItem, opts) {
    opts = opts || {};
    var self = this;
    var url = typeof urlOrItem === "string" ? urlOrItem : urlOrItem.url;
    var name = opts.name || (urlOrItem && urlOrItem.name) || "threads-media";
    var signal = opts.signal;
    var timeoutMs = opts.timeoutMs || this.options.downloadTimeoutMs;
    var retries =
      typeof opts.retries === "number" ? opts.retries : this.options.retries;

    if (!isMediaHostAllowed(url)) {
      return Promise.reject(
        EngineError(
          "invalid-url",
          "URL is not a permitted Threads CDN host: " + url
        )
      );
    }

    // Browser mode: route through the media proxy when configured.
    var requestUrl = this.options.mediaEndpoint
      ? this.getMediaProxyUrl(url, name)
      : url;

    if (!this.options.mediaEndpoint && typeof window !== "undefined") {
      this._log(
        "no mediaEndpoint configured — attempting direct fetch (cross-origin will fail in most browsers)"
      );
    }

    function readBodyWithProgress(res, onProgress) {
      var totalHeader = Number(res.headers.get("content-length"));
      var totalBytes =
        Number.isFinite(totalHeader) && totalHeader > 0 ? totalHeader : 0;
      var contentType =
        res.headers.get("content-type") || "application/octet-stream";

      if (!res.body || typeof res.body.getReader !== "function") {
        return res.arrayBuffer().then(function (buf) {
          var bytes = new Uint8Array(buf);
          if (typeof onProgress === "function") {
            onProgress({ received: bytes.length, total: bytes.length, percent: 100 });
          }
          return finalize(bytes, contentType);
        });
      }

      return new Promise(function (resolve, reject) {
        var reader = res.body.getReader();
        var chunks = [];
        var received = 0;
        function pump() {
          reader
            .read()
            .then(function (chunk) {
              if (chunk.done) {
                var bytes = concatChunks(chunks, received);
                if (typeof onProgress === "function") {
                  onProgress({ received: received, total: received, percent: 100 });
                }
                resolve(finalize(bytes, contentType));
                return;
              }
              if (chunk.value) {
                chunks.push(chunk.value);
                received += chunk.value.byteLength;
                if (typeof onProgress === "function") {
                  onProgress({
                    received: received,
                    total: totalBytes,
                    percent: totalBytes
                      ? Math.min(100, (received / totalBytes) * 100)
                      : -1,
                  });
                }
              }
              pump();
            })
            .catch(reject);
        }
        pump();
      });
    }

    function finalize(bytes, contentType) {
      var finalName = ensureExtension(name, contentType);
      var blob;
      if (typeof Blob === "function") {
        try {
          blob = new Blob([bytes], { type: contentType });
        } catch (e) {
          blob = undefined;
        }
      }
      return {
        name: finalName,
        size: bytes.length,
        contentType: contentType,
        bytes: bytes,
        blob: blob,
      };
    }

    var attemptNo = 0;

    function attempt() {
      if (signal && signal.aborted) {
        return Promise.reject(EngineError("aborted", "Operation aborted."));
      }
      return fetchWithTimeout(
        requestUrl,
        {
          headers: {
            "User-Agent": DESKTOP_UA,
            Accept: "*/*",
          },
          redirect: "follow",
          signal: signal,
        },
        timeoutMs
      ).then(function (res) {
        if (!res.ok) {
          if (res.status >= 500 && attemptNo < retries) {
            attemptNo++;
            return sleep(
              400 * Math.pow(2, attemptNo) + Math.floor(Math.random() * 250)
            ).then(attempt);
          }
          throw EngineError(
            res.status === 403 || res.status === 404
              ? "media-expired"
              : "http-error",
            "CDN responded " +
              res.status +
              " for " +
              name +
              " (media links can expire within ~48h — re-extract the post to renew them).",
            res.status
          );
        }
        return readBodyWithProgress(res, function (p) {
          if (typeof opts.onProgress === "function") opts.onProgress(p);
        }).then(function (file) {
          return {
            name: file.name,
            size: file.size,
            contentType: file.contentType,
            bytes: file.bytes,
            blob: file.blob,
          };
        });
      });
    }

    function retryLoop() {
      return attempt().catch(function (err) {
        var e = toError(err);
        if (
          (isAbortError(e) || e.code === "aborted") &&
          signal &&
          signal.aborted
        ) {
          throw EngineError("aborted", "Operation aborted.");
        }
        if (
          attemptNo < retries &&
          (e.code === "timeout" ||
            e.code === "network" ||
            /fetch failed|network/i.test(e.message))
        ) {
          attemptNo++;
          self._log("retry", attemptNo, "for", name, "after", e.message);
          return sleep(
            400 * Math.pow(2, attemptNo) + Math.floor(Math.random() * 250)
          ).then(retryLoop);
        }
        if (!e.code) {
          throw EngineError(
            "network",
            "Download failed for " +
              name +
              ": " +
              e.message +
              (typeof window !== "undefined" && !self.options.mediaEndpoint
                ? " — in browsers configure options.mediaEndpoint (see INTEGRATION.md)."
                : "")
          );
        }
        throw e;
      });
    }

    return retryLoop();
  };

  function concatChunks(chunks, total) {
    var out = new Uint8Array(total);
    var offset = 0;
    for (var i = 0; i < chunks.length; i++) {
      out.set(chunks[i], offset);
      offset += chunks[i].byteLength;
    }
    return out;
  }

  /**
   * Download every media item of a post into a bundle (files + caption +
   * metadata) ready for zipping / writing to disk.
   *
   * @param {object} post  ThreadPost from extract()
   * @param {object} [opts]  { onFile?(file, error?), onProgress?(media, p), signal?, concurrency? }
   * @returns {Promise<{folder:string, post:object, caption:string, metadata:object, files:Array}>}
   */
  ThreadsDownloaderEngine.prototype.downloadPost = function (post, opts) {
    opts = opts || {};
    var self = this;
    var folder = postFolderName(post);
    var concurrency = opts.concurrency || this.options.downloadConcurrency;

    var bundle = {
      folder: folder,
      post: post,
      caption: post.caption || "",
      metadata: buildPostMetadata(post),
      files: [],
    };

    if (!post.media || post.media.length === 0) {
      return Promise.resolve(bundle); // text-only post
    }

    var tasks = post.media.map(function (media) {
      return function () {
        var name = buildMediaFilename(
          post.username,
          post.code,
          media.index,
          media.kind,
          media.url
        );
        return self
          .downloadMedia(media.url, {
            name: name,
            signal: opts.signal,
            onProgress: function (p) {
              if (typeof opts.onProgress === "function") {
                opts.onProgress(media, p);
              }
            },
          })
          .then(function (file) {
            var entry = {
              name: file.name,
              url: media.url,
              kind: media.kind,
              size: file.size,
              contentType: file.contentType,
              bytes: file.bytes,
              blob: file.blob,
              error: null,
            };
            bundle.files.push(entry);
            if (typeof opts.onFile === "function") opts.onFile(entry, null);
          })
          .catch(function (err) {
            var e = toError(err);
            var failed = {
              name: name,
              url: media.url,
              kind: media.kind,
              size: 0,
              contentType: null,
              bytes: null,
              blob: undefined,
              error: e.message,
              errorCode: e.code || "unknown",
            };
            bundle.files.push(failed);
            if (typeof opts.onFile === "function") opts.onFile(failed, e);
          });
      };
    });

    return runWithConcurrency(tasks, concurrency).then(function () {
      // Keep files in original media order.
      bundle.files.sort(function (a, b) {
        return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
      });
      return bundle;
    });
  };

  /**
   * Download many posts (bundles) with bounded concurrency.
   *
   * @param {object[]} posts
   * @param {object} [opts]  { onBundle?(bundle), onFile?(post, file, err), concurrency?, signal? }
   * @returns {Promise<{bundles:object[], failures:Array<{post:object,error:string}>}>}
   */
  ThreadsDownloaderEngine.prototype.downloadPosts = function (posts, opts) {
    opts = opts || {};
    var self = this;
    var list = Array.isArray(posts) ? posts : [];
    var bundles = [];
    var failures = [];

    var tasks = list.map(function (post) {
      return function () {
        return self
          .downloadPost(post, {
            signal: opts.signal,
            onFile: opts.onFile
              ? function (file, err) {
                  opts.onFile(post, file, err);
                }
              : undefined,
          })
          .then(function (bundle) {
            bundles.push(bundle);
            if (typeof opts.onBundle === "function") opts.onBundle(bundle);
          })
          .catch(function (err) {
            failures.push({ post: post, error: toError(err).message });
          });
      };
    });

    return runWithConcurrency(
      tasks,
      opts.concurrency || this.options.downloadConcurrency
    ).then(function () {
      return { bundles: bundles, failures: failures };
    });
  };

  /* ------------------------------------------------------------------------
   * Public: ZIP bundling (bring your own JSZip)
   * ---------------------------------------------------------------------- */

  /**
   * Pack bundles into a ZIP using a JSZip constructor you provide (the engine
   * itself stays dependency-free).
   *
   * @param {object[]} bundles     Output of downloadPost()/downloadPosts().
   * @param {Function} JSZipCtor   The JSZip constructor (or a compatible class).
   * @param {object}   [opts]      { filename?, outputType?: 'blob'|'uint8array'|'nodebuffer', onProgress?(percent) }
   * @returns {Promise<{filename:string, size:number, blob?:Blob, bytes?:Uint8Array, buffer?:Buffer}>}
   */
  ThreadsDownloaderEngine.prototype.zipBundles = function (
    bundles,
    JSZipCtor,
    opts
  ) {
    opts = opts || {};
    if (typeof JSZipCtor !== "function") {
      return Promise.reject(
        EngineError(
          "zip-provider-missing",
          "Pass the JSZip constructor: engine.zipBundles(bundles, JSZip). npm i jszip — https://stuk.github.io/jszip/"
        )
      );
    }
    var list = Array.isArray(bundles) ? bundles : [bundles];
    var zip = new JSZipCtor();

    for (var i = 0; i < list.length; i++) {
      var b = list[i];
      var folder = b.folder || postFolderName(b.post);
      zip.file(folder + "/caption.txt", buildPostText(b.post));
      zip.file(
        folder + "/metadata.json",
        JSON.stringify(b.metadata || buildPostMetadata(b.post), null, 2)
      );
      var files = b.files || [];
      for (var f = 0; f < files.length; f++) {
        var file = files[f];
        if (file.error || (!file.blob && !file.bytes)) continue;
        zip.file(folder + "/" + file.name, file.blob || file.bytes);
      }
    }

    var isBrowser = typeof window !== "undefined";
    var outputType = opts.outputType || (isBrowser ? "blob" : "uint8array");
    var filename =
      opts.filename ||
      "threads-media_" + new Date().toISOString().slice(0, 10) + ".zip";

    return zip
      .generateAsync(
        {
          type: outputType,
          compression: "DEFLATE",
          compressionOptions: { level: 5 },
        },
        function (metadata) {
          if (typeof opts.onProgress === "function") {
            opts.onProgress(Math.round(metadata.percent || 0));
          }
        }
      )
      .then(function (out) {
        var result = { filename: filename, size: out.size || out.length || 0 };
        if (outputType === "blob") result.blob = out;
        else if (outputType === "nodebuffer") result.buffer = out;
        else result.bytes = new Uint8Array(out);
        return result;
      });
  };

  /* ------------------------------------------------------------------------
   * Static helpers (also exported standalone)
   * ---------------------------------------------------------------------- */

  ThreadsDownloaderEngine.version = VERSION;
  ThreadsDownloaderEngine.EngineError = EngineError;
  ThreadsDownloaderEngine.extractThreadLinks = extractThreadLinks;
  ThreadsDownloaderEngine.parseSingleThreadUrl = parseSingleThreadUrl;
  ThreadsDownloaderEngine.resolveCode = resolveCode;
  ThreadsDownloaderEngine.canonicalPostUrl = canonicalPostUrl;
  ThreadsDownloaderEngine.shortcodeToPostId = shortcodeToPostId;
  ThreadsDownloaderEngine.buildMediaFilename = buildMediaFilename;
  ThreadsDownloaderEngine.postFolderName = postFolderName;
  ThreadsDownloaderEngine.sanitizeFilename = sanitizeFilename;
  ThreadsDownloaderEngine.isMediaHostAllowed = isMediaHostAllowed;
  ThreadsDownloaderEngine.buildPostMetadata = buildPostMetadata;
  ThreadsDownloaderEngine.buildPostText = buildPostText;
  ThreadsDownloaderEngine.runWithConcurrency = runWithConcurrency;
  ThreadsDownloaderEngine.formatBytes = formatBytes;

  /* ------------------------------------------------------------------------
   * Default shared instance
   * ---------------------------------------------------------------------- */

  var threads = new ThreadsDownloaderEngine();

  return {
    version: VERSION,
    ThreadsDownloaderEngine: ThreadsDownloaderEngine,
    threads: threads,
    EngineError: EngineError,
    extractThreadLinks: extractThreadLinks,
    parseSingleThreadUrl: parseSingleThreadUrl,
    resolveCode: resolveCode,
    canonicalPostUrl: canonicalPostUrl,
    shortcodeToPostId: shortcodeToPostId,
    buildMediaFilename: buildMediaFilename,
    postFolderName: postFolderName,
    sanitizeFilename: sanitizeFilename,
    isMediaHostAllowed: isMediaHostAllowed,
    buildPostMetadata: buildPostMetadata,
    buildPostText: buildPostText,
    runWithConcurrency: runWithConcurrency,
    formatBytes: formatBytes,
  };
});
