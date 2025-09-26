import "dotenv/config";
import adapter from "@sveltejs/adapter-static";

import { mdsvex } from "mdsvex";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { sveltePreprocess } from "svelte-preprocess";

/** @type {import('@sveltejs/kit').Config} */
const config = {
    extensions: [".svelte", ".md"],
    preprocess: [
        {
            name: "strip-announcer",
            markup: ({ content: code }) => {
                code = code.replace(
                    /<div id="svelte-announcer" [\s\S]*?<\/div>/,
                    "{null}"
                );

                return { code };
            }
        },
        sveltePreprocess(),
        mdsvex({
            extensions: [".md"],
            layout: {
                about: join(
                    dirname(fileURLToPath(import.meta.url)),
                    "/src/components/misc/AboutPageWrapper.svelte"
                ),
                changelogs: join(
                    dirname(fileURLToPath(import.meta.url)),
                    "/src/components/changelog/ChangelogEntryWrapper.svelte"
                )
            }
        })
    ],
    kit: {
        adapter: adapter({
            pages: "public",
            assets: "public",
            fallback: "404.html",
            precompress: false,
            strict: true
        }),
        csp: {
            mode: "hash",
            directives: {
                "connect-src": ["*"],
                "default-src": ["none"],

                "font-src": ["self"],
                "style-src": ["self", "unsafe-inline"],
                "img-src": ["*", "data:"],
                "manifest-src": ["self"],
                "worker-src": ["self"],

                "object-src": ["none"],
                "frame-src": [
                    "self",
                    "challenges.cloudflare.com"
                ],

                "script-src": [
                    "self",
                    "wasm-unsafe-eval",
                    "challenges.cloudflare.com",
                    process.env.WEB_PLAUSIBLE_HOST
                        ? process.env.WEB_PLAUSIBLE_HOST
                        : "",
                    "sha256-g67gIjM3G8yMbjbxyc3QUoVsKhdxgcQzCmSKXiZZo6s="
                ],

                "script-src-attr": [
                    "unsafe-hashes",
                    "sha256-7dQwUgLau1NFCCGjfn9FsYptB6ZtWxJin6VohGIu20I="
                ],

                "frame-ancestors": ["none"]
            }
        },
        env: {
            publicPrefix: "WEB_"
        },
        version: {
            pollInterval: 60000
        },
        paths: {
            relative: false
        },
        alias: {
            $components: "src/components",
            $i18n: "i18n"
        }
    }
};

export default config;
