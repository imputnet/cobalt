import { genericUserAgent, env } from "../../config.js";
import { createStream } from "../../stream/manage.js"

export default async function(post) {
    let filenameBase = `duitang_${post.id}`

    if (post.type == 'blog') {
        let req = await fetch(`https://www.duitang.com/napi/blog/detail/?blog_id=${post.id}`, {
            headers: {
                'User-Agent': genericUserAgent,
            }
        })
        .then(request => request.text())
        .catch(() => {});
    
        if (!req) return { error: 'fetch.fail' };

        let json;
        try {
            json = JSON.parse(req);
        } catch { return { error: 'fetch.empty' }; }

        let originalUrl = json.data.photo.path.toString();
        const image = {
            // always proxy here because of headers
            type: "photo",
            url: createStream({
                service: "duitang",
                type: "proxy",
                url: originalUrl,
                filename: `${filenameBase}_photo.jpg`,
                headers: {
                    'Host': 'c-ssl.dtstatic.com',
                    'Referer': 'https://duitang.com'
                }
            })
        }

        return {
            picker: [image]
        };
    }

    if (post.type == 'atlas') {
        let req = await fetch(`https://www.duitang.com/napi/vienna/atlas/detail/?atlas_id=${post.id}`, {
            headers: {
                'User-Agent': genericUserAgent,
            }
        })
        .then(request => request.text())
        .catch(() => {});
    
        if (!req) return { error: 'fetch.fail' };

        let json;
        try {
            json = JSON.parse(req);
        } catch { return { error: 'fetch.empty' }; }

        let imageLinks = json.data.blogs
            .map(blog => blog.photo?.path)
            .map((url, i) => {
                // always proxy here because of headers
                url = createStream({
                    service: "duitang",
                    type: "proxy",
                    url: url,
                    filename: `${filenameBase}_photo_${i + 1}.jpg`,
                    headers: {
                        'Host': 'c-ssl.dtstatic.com',
                        'Referer': 'https://duitang.com'
                    }
                });

                return {
                    type: "photo",
                    url
                };
            });
        return {
            picker: imageLinks
        }
    }
}