import path from 'path'
import Cookie from './cookie.js'
import { readFile, writeFile } from 'fs/promises'
import { parse as parseSetCookie, splitCookiesString } from 'set-cookie-parser'

const WRITE_INTERVAL = 60000,
      COOKIE_PATH = process.env.COOKIE_PATH,
      COUNTER = Symbol('counter');

let cookies = {}, dirty = false, intervalId;

const setup = async () => {
    try {
        if (!COOKIE_PATH)
            return

        cookies = await readFile(COOKIE_PATH, 'utf8')
        cookies = JSON.parse(cookies)
        intervalId = setInterval(writeChanges, WRITE_INTERVAL)
    } catch { /* no cookies for you */ }
}

setup()

function writeChanges() {
    if (!dirty) return
    dirty = false

    writeFile(
        COOKIE_PATH,
        JSON.stringify(cookies, null, 4)
    ).catch(e => {
        console.error('warn: cookies failed to save, stopping interval')
        console.error('exception:', e)
        clearInterval(intervalId)
    })
}

export function getCookie(service) {
    if (!cookies[service] || !cookies[service].length)
        return

    let n
    if (cookies[service][COUNTER] === undefined) {
        n = cookies[service][COUNTER] = 0
    } else {
        ++cookies[service][COUNTER]
        n = (cookies[service][COUNTER] %= cookies[service].length)
    }

    const cookie = cookies[service][n]
    if (typeof cookie === 'string')
        cookies[service][n] = Cookie.fromString(cookie)

    return cookies[service][n]
}

// todo: expiry checking? domain checking?
// might be pointless for the purposes of cobalt
export function updateCookie(cookie, headers) {
    const parsed = parseSetCookie(
        splitCookiesString(headers.get('set-cookie'))
    ), values = {}

    cookie.unset(
        parsed
            .filter(c => c.expires < new Date())
            .map(c => c.name)
    )

    parsed
        .filter(c => c.expires > new Date())
        .forEach(c => values[c.name] = c.value);

    cookie.set(values)
    if (Object.keys(values).length)
        dirty = true
}
