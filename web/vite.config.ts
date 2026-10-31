import mime from "mime";
import basicSSL from "@vitejs/plugin-basic-ssl";

import { sveltekit } from "@sveltejs/kit/vite";
import { createSitemap } from "svelte-sitemap/src/index";
import { defineConfig, searchForWorkspaceRoot, type PluginOption } from "vite";

import { join, basename } from "node:path";
import { createReadStream, existsSync } from "node:fs";
import { cp, readdir, mkdir } from "node:fs/promises";

const exposeLibAV: PluginOption = (() => {
    const IMPUT_MODULE_DIR = join(__dirname, 'node_modules/@imput');
    return {
        name: "vite-libav.js",
        configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
                if (!req.url?.startsWith('/_libav/')) return next();

                const filename = basename(req.url).split('?')[0];
                if (!filename) return next();

                // glob can't be used here: on windows join() emits
                // backslashes that glob treats as escape characters,
                // so the pattern never matches and every libav asset
                // 404s (breaks the local processing pipeline in dev)
                const modules = await readdir(IMPUT_MODULE_DIR);
                for (const module of modules) {
                    const file = join(IMPUT_MODULE_DIR, module, 'dist', filename);
                    if (!existsSync(file)) continue;

                    const fileType = mime.getType(filename);
                    if (!fileType) continue;

                    res.setHeader('Content-Type', fileType);
                    return createReadStream(file).pipe(res);
                }

                return next();
            });
        },
        generateBundle: async (options) => {
            if (!options.dir) {
                return;
            }

            const assets = join(options.dir, '_libav');
            await mkdir(assets, { recursive: true });

            const modules = await readdir(IMPUT_MODULE_DIR).then(
                modules => modules.filter(m => m.startsWith('libav.js'))
            );

            for (const module of modules) {
                const distFolder = join(IMPUT_MODULE_DIR, module, 'dist/');
                await cp(distFolder, assets, { recursive: true });
            }
        }
    }
})();

const enableCOEP: PluginOption = {
    name: "isolation",
    configureServer(server) {
        server.middlewares.use((_req, res, next) => {
            res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
            next();
        })
    }
};

const generateSitemap: PluginOption = {
    name: "generate-sitemap",
    async writeBundle(bundle) {
        if (!process.env.WEB_HOST || !bundle.dir?.endsWith('server')) {
            return;
        }

        await createSitemap(`https://${process.env.WEB_HOST}`, {
            changeFreq: 'monthly',
            outDir: '.svelte-kit/output/prerendered/pages',
            resetTime: true
        });
    }
}

const checkDefaultApiEnv = (): PluginOption => ({
    name: "check-default-api",
    config() {
        if (!process.env.WEB_DEFAULT_API) {
            throw new Error(
                "WEB_DEFAULT_API env variable is required, but missing."
            );
        }
    },
});

export default defineConfig({
    plugins: [
        checkDefaultApiEnv(),
        basicSSL(),
        sveltekit(),
        enableCOEP,
        exposeLibAV,
        generateSitemap
    ],
    build: {
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: (id) => {
                    if (id.includes('/web/i18n') && id.endsWith('.json')) {
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
        // basic-ssl would otherwise turn the dev server into https with a
        // self-signed cert, which embedded browsers that can't skip cert
        // warnings (e.g. Electron guest views) refuse to load; set WEB_HTTPS=1
        // to get the https dev server back
        https: process.env.WEB_HTTPS === "1" ? {} : false,
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp"
        },
        fs: {
            allow: [
                searchForWorkspaceRoot(process.cwd())
            ]
        },
        proxy: {}
    },
    optimizeDeps: {
        exclude: ["@imput/libav.js-remux-cli"]
    },
});
