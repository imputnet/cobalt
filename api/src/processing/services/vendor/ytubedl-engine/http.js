/**
 * YTubeDL Engine — resilient HTTP helpers.
 *
 * Event-driven (no busy waiting), keep-alive via Bun's pooled fetch,
 * small bounded buffers, abort propagation, and retry with backoff + jitter.
 */
import { errMessage } from './util.js';
function sleep(ms, signal) {
    return new Promise((resolve, reject) => {
        const t = setTimeout(resolve, ms);
        signal?.addEventListener('abort', () => {
            clearTimeout(t);
            reject(signal.reason ?? new Error('aborted'));
        }, { once: true });
    });
}
/** fetch with timeout + retries (idempotent methods only). */
export async function fetchRetry(url, opts = {}) {
    const { timeoutMs = 20_000, retries = 2, label, ...init } = opts;
    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
        const timeout = new AbortController();
        const onAbort = () => timeout.abort(init.signal?.reason);
        init.signal?.addEventListener('abort', onAbort, { once: true });
        const timer = setTimeout(() => timeout.abort(new Error('timeout')), timeoutMs);
        try {
            const res = await fetch(url, { ...init, signal: timeout.signal });
            // Retry transient server/network failures
            if (res.status >= 500 || res.status === 429) {
                if (attempt < retries) {
                    res.body?.cancel().catch(() => { });
                    throw new Error(`HTTP ${res.status}`);
                }
            }
            return res;
        }
        catch (e) {
            if (init.signal?.aborted)
                throw init.signal?.reason ?? e;
            lastErr = e;
        }
        finally {
            clearTimeout(timer);
            init.signal?.removeEventListener('abort', onAbort);
        }
        if (attempt < retries) {
            await sleep(300 * 2 ** attempt + Math.random() * 200, init.signal);
        }
    }
    throw new Error(`${label ?? 'request'} failed after ${retries + 1} attempts: ${errMessage(lastErr)}`);
}
export async function fetchJson(url, opts = {}) {
    const res = await fetchRetry(url, opts);
    if (!res.ok)
        throw new Error(`${opts.label ?? 'request'} → HTTP ${res.status}`);
    return (await res.json());
}
export async function fetchText(url, opts = {}) {
    const res = await fetchRetry(url, opts);
    if (!res.ok)
        throw new Error(`${opts.label ?? 'request'} → HTTP ${res.status}`);
    return await res.text();
}
export class HttpError extends Error {
    status;
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}
