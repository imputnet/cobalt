import { genericUserAgent } from "../../config.js";

function unpack(packed) {
    const match = packed.match(
        /eval\(function\(p,a,c,k,e,d\)\{.*?\}?\('(.*?)','(\d+)',(\d+),'(.*?)'\.split/s
    );
    if (!match) return null;

    let [, p, a, c, keywords] = match;
    a = parseInt(a);
    c = parseInt(c);
    const kw = keywords.split('|');

    const base = (num, radix) => {
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        while (num > 0) {
            result = chars[num % radix] + result;
            num = Math.floor(num / radix);
        }
        return result || '0';
    };

    const decoded = p.replace(/\b\w+\b/g, (word) => {
        const index = parseInt(word, a) || 0;
        if (index < c && kw[index]) {
            return kw[index];
        }
        return word;
    });

    return decoded;
}

export default async function(obj) {
    const html = await fetch(`https://darkibox.com/dl`, {
        method: "POST",
        headers: {
            "user-agent": genericUserAgent,
            "content-type": "application/x-www-form-urlencoded",
            "referer": `https://darkibox.com/${obj.id}`,
        },
        body: new URLSearchParams({
            op: "embed",
            file_code: obj.id,
            auto: "1",
        }),
    })
    .then(r => r.status === 200 ? r.text() : false)
    .catch(() => {});

    if (!html) return { error: "fetch.fail" };

    let videoUrl;

    // try to find URL in packed JS
    const packedMatch = html.match(/eval\(function\(p,a,c,k,e,d\)\{.*?\)\)/s);
    if (packedMatch) {
        const unpacked = unpack(packedMatch[0]);
        if (unpacked) {
            const fileMatch = unpacked.match(/file\s*:\s*"(https?:\/\/[^"]+)"/);
            if (fileMatch) {
                videoUrl = fileMatch[1];
            }
        }
    }

    // fallback: try direct regex on html
    if (!videoUrl) {
        const directMatch = html.match(/file\s*:\s*"(https?:\/\/[^"]+)"/);
        if (directMatch) {
            videoUrl = directMatch[1];
        }
    }

    if (!videoUrl) return { error: "fetch.fail" };

    return {
        urls: videoUrl,
        filename: `darkibox_${obj.id}.mp4`,
        audioFilename: `darkibox_${obj.id}_audio`,
        fileMetadata: {
            title: `darkibox_${obj.id}`,
        }
    }
}
