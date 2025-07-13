import { Agent, request } from "undici";
import { create as contentDisposition } from "content-disposition-header";

import { destroyInternalStream } from "./manage.js";
import { getHeaders, closeRequest, closeResponse, pipe } from "./shared.js";

const defaultAgent = new Agent();

export default async function (streamInfo, res) {
    const abortController = new AbortController();
    const shutdown = () => (
        closeRequest(abortController),
        closeResponse(res),
        destroyInternalStream(streamInfo.urls)
    );

    try {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Content-disposition', contentDisposition(streamInfo.filename));

        const { body: stream, headers, statusCode } = await request(streamInfo.urls, {
            headers: {
                ...getHeaders(streamInfo.service),
                Range: streamInfo.range
            },
            signal: abortController.signal,
            maxRedirections: 16,
            dispatcher: defaultAgent,
        });

        res.status(statusCode);

        for (const headerName of ['accept-ranges', 'content-type', 'content-length']) {
            if (headers[headerName]) {
                res.setHeader(headerName, headers[headerName]);
            }
        }

        pipe(stream, res, shutdown);
    } catch {
        shutdown();
    }
}
