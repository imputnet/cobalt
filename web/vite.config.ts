import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, searchForWorkspaceRoot } from "vite";

import basicSSL from "@vitejs/plugin-basic-ssl";

export default defineConfig({
    plugins: [
        basicSSL(),
        sveltekit(),
        {
            name: "isolation",
            configureServer(server) {
                server.middlewares.use((_req, res, next) => {
                    res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
                    res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
                    next();
                })
            }
        }
    ],
    build: {
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('/web/i18n')) {
                        const lang = id.split('/web/i18n/')?.[1].split('/')?.[0];
                        if (lang) {
                            return `i18n_${lang}`;
                        }
                    }
                }
            }
        }
    },
    server: {
        fs: {
            allow: [
                searchForWorkspaceRoot(process.cwd())
            ]
        },
        proxy: {}
    },
    optimizeDeps: {
        exclude: ["@imput/ffmpeg.wasm"]
    },
});
