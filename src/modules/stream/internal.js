import { request } from 'undici'

export async function internalStream(streamInfo, res) {
    try {
        const req = await request(streamInfo.url, {
            headers: streamInfo.headers,
            signal: streamInfo.controller.signal,
            maxRedirections: 16
        });

        res.status(req.statusCode);

        for (const [ name, value ] of Object.entries(req.headers))
            res.setHeader(name, value)

        if (req.statusCode < 200 || req.statusCode > 299)
            return res.destroy();

        req.body.pipe(res);
        req.body.on('error', () => res.destroy());
    } catch {
        streamInfo.controller.abort();
    }
}