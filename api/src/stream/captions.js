import { Agent, request } from "undici";
import { create as contentDisposition } from "content-disposition-header";

import { closeRequest, closeResponse } from "./shared.js";
import { destroyInternalStream } from "./manage.js";
import { convertCaptions, mergeCaptionSegments } from "../processing/helpers/caption-formats.js";

const defaultAgent = new Agent();
const maxCaptionSize = 8 * 1024 * 1024;

const contentTypes = {
    md: "text/markdown; charset=utf-8",
    srt: "application/x-subrip; charset=utf-8",
    txt: "text/plain; charset=utf-8",
    vtt: "text/vtt; charset=utf-8",
};

export default async function captions(streamInfo, res) {
    const abortController = new AbortController();
    const urls = [streamInfo.urls].flat();
    const cleanup = () => {
        closeRequest(abortController);
        urls.forEach(destroyInternalStream);
    };
    res.once("close", cleanup);
    res.once("error", cleanup);

    try {
        if (res.destroyed) return;
        const segments = [];
        let size = 0;
        for (const url of urls) {
            const response = await request(url, {
                signal: abortController.signal,
                maxRedirections: 4,
                dispatcher: defaultAgent,
                headers: streamInfo.headers,
            });

            if (response.statusCode < 200 || response.statusCode > 299) {
                return closeResponse(res);
            }

            const declaredSize = Number(response.headers["content-length"]);
            if (size + declaredSize > maxCaptionSize) {
                res.status(413).end();
                return;
            }

            const chunks = [];
            for await (const chunk of response.body) {
                size += chunk.length;
                if (size > maxCaptionSize) {
                    res.status(413).end();
                    return;
                }
                chunks.push(chunk);
            }
            segments.push(Buffer.concat(chunks).toString("utf8"));
        }

        const body = convertCaptions(
            segments.length === 1 ? segments[0] : mergeCaptionSegments(segments),
            streamInfo.captionFormat,
            streamInfo.captionMetadata,
            streamInfo.captionSourceFormat
        );

        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        res.setHeader("Content-Disposition", contentDisposition(streamInfo.filename));
        res.setHeader("Content-Type", contentTypes[streamInfo.captionFormat]);
        res.setHeader("Content-Length", Buffer.byteLength(body));
        res.status(200).send(body);
    } catch {
        if (!res.destroyed) closeResponse(res);
    } finally {
        cleanup();
        res.off("close", cleanup);
        res.off("error", cleanup);
    }
}
