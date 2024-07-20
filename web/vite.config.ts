import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, searchForWorkspaceRoot } from "vite";

export default defineConfig({
    plugins: [
        sveltekit()
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
        }
    }
});
