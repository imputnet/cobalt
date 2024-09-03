export const prerender = true;
export const ssr = true;

import { browser } from '$app/environment';

import { get } from 'svelte/store';
import type { Load } from '@sveltejs/kit';

import { loadTranslations, defaultLocale } from '$lib/i18n/translations';

export const load: Load = async ({ url }) => {
    const { pathname } = url;

    let preferredLocale = defaultLocale;

    if (browser) {
        preferredLocale = get((await import('$lib/i18n/locale')).default);
    }

    await loadTranslations(preferredLocale, pathname);
    return {};
}
