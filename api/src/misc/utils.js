const redirectStatuses = new Set([301, 302, 303, 307, 308]);

export async function getRedirectingURL(url, dispatcher) {
    const location = await fetch(url, {
        redirect: 'manual',
        dispatcher,
    }).then((r) => {
        if (redirectStatuses.has(r.status) && r.headers.has('location')) {
            return r.headers.get('location');
        }
    }).catch(() => null);

    return location;
}

export function merge(a, b) {
    for (const k of Object.keys(b)) {
        if (Array.isArray(b[k])) {
            a[k] = [...(a[k] ?? []), ...b[k]];
        } else if (typeof b[k] === 'object') {
            a[k] = merge(a[k], b[k]);
        } else {
            a[k] = b[k];
        }
    }

    return a;
}

export function splitFilenameExtension(filename) {
    const parts = filename.split('.');
    const ext = parts.pop();

    if (!parts.length) {
        return [ ext, "" ]
    } else {
        return [ parts.join('.'), ext ]
    }
}
