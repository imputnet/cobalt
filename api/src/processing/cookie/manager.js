import Cookie from './cookie.js';

import { readFile, writeFile } from 'fs/promises';
import { Green, Yellow } from '../../misc/console-text.js';
import { parse as parseSetCookie, splitCookiesString } from 'set-cookie-parser';

const WRITE_INTERVAL = 60000;
let cookies = {}, dirty = false, intervalId;

function writeChanges(cookiePath) {
    if (!dirty) return;
    dirty = false;

    writeFile(cookiePath, JSON.stringify(cookies, null, 4)).catch(() => {
        clearInterval(intervalId)
    })
}

export const setup = async (cookiePath) => {
    try {
        cookies = await readFile(cookiePath, 'utf8');
        cookies = JSON.parse(cookies);
        intervalId = setInterval(() => writeChanges(cookiePath), WRITE_INTERVAL);
        console.log(`${Green('[✓]')} cookies loaded successfully!`)
    } catch(e) {
        console.error(`${Yellow('[!]')} failed to load cookies.`);
        console.error('error:', e);
    }
}

export function getCookie(service) {
    if (!cookies[service] || !cookies[service].length) return;

    const idx = Math.floor(Math.random() * cookies[service].length);

    const cookie = cookies[service][idx];
    if (typeof cookie === 'string') {
        cookies[service][idx] = Cookie.fromString(cookie);
    }

    return cookies[service][idx];
}

export function updateCookieValues(cookie, values) {
    cookie.set(values);
    if (Object.keys(values).length) dirty = true
}

export function updateCookie(cookie, headers) {
    if (!cookie) return;

    const parsed = parseSetCookie(
        splitCookiesString(headers.get('set-cookie')),
        { decodeValues: false }
    ), values = {}

    cookie.unset(parsed.filter(c => c.expires < new Date()).map(c => c.name));
    parsed.filter(c => !c.expires || c.expires > new Date()).forEach(c => values[c.name] = c.value);
    updateCookieValues(cookie, values);
}
