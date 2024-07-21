import adapter from '@sveltejs/adapter-static';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { sveltePreprocess } from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://kit.svelte.dev/docs/integrations#preprocessors
    // for more information about preprocessors
    extensions: [".svelte", ".md"],
    preprocess: [
        sveltePreprocess(),
        mdsvex({
            extensions: ['.md'],
            layout: join(
                dirname(fileURLToPath(import.meta.url)),
                '/src/components/changelog/ChangelogEntryWrapper.svelte'
            )
        })
    ],
    kit: {
        adapter: adapter({
            // default options are shown. On some platforms
            // these options are set automatically — see below
            pages: 'build',
            assets: 'build',
            fallback: undefined,
            precompress: false,
            strict: true
        }),
        paths: {
            relative: false
        },
        alias: {
            $components: 'src/components',
            $i18n: 'i18n',
        }
    }
};

export default config;
