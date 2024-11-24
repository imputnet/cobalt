export function getRedirectingURL(url) {
    return fetch(url, { redirect: 'manual' }).then((r) => {
        if ([301, 302, 303].includes(r.status) && r.headers.has('location'))
            return r.headers.get('location');
    }).catch(() => null);
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
