import mime from "mime";
import ipaddr from "ipaddr.js";

import { apiSchema } from "./schema.js";
import { createProxyTunnels, createStream } from "../stream/manage.js";

export function createResponse(responseType, responseData) {
    const internalError = (code) => {
        return {
            status: 500,
            body: {
                status: "error",
                error: {
                    code: code || "error.api.fetch.critical",
                },
                critical: true
            }
        }
    }

    try {
        let status = 200,
            response = {};

        if (responseType === "error") {
            status = 400;
        }

        switch (responseType) {
            case "error":
                response = {
                    error: {
                        code: responseData?.code,
                        context: responseData?.context,
                    }
                }
                break;

            case "redirect":
                response = {
                    url: responseData?.url,
                    filename: responseData?.filename
                }
                break;

            case "tunnel":
                response = {
                    url: createStream(responseData),
                    filename: responseData?.filename
                }
                break;

            case "local-processing":
                response = {
                    type: responseData?.type,
                    service: responseData?.service,
                    tunnel: createProxyTunnels(responseData),

                    output: {
                        type: mime.getType(responseData?.filename) || undefined,
                        filename: responseData?.filename,
                        metadata: responseData?.fileMetadata || undefined,
                    },

                    audio: {
                        copy: responseData?.audioCopy,
                        format: responseData?.audioFormat,
                        bitrate: responseData?.audioBitrate,
                    },

                    isHLS: responseData?.isHLS,
                }

                if (!response.audio.format) {
                    if (response.type === "audio") {
                        // audio response without a format is invalid
                        return internalError();
                    }
                    delete response.audio;
                }

                if (!response.output.type || !response.output.filename) {
                    // response without a type or filename is invalid
                    return internalError();
                }
                break;

            case "picker":
                response = {
                    picker: responseData?.picker,
                    audio: responseData?.url,
                    audioFilename: responseData?.filename
                }
                break;

            case "critical":
                return internalError(responseData?.code);

            default:
                throw "unreachable"
        }

        return {
            status,
            body: {
                status: responseType,
                ...response
            }
        }
    } catch {
        return internalError()
    }
}

export function normalizeRequest(request) {
    return apiSchema.safeParseAsync(request).catch(() => (
        { success: false }
    ));
}

export function getIP(req, prefix = 56) {
    const strippedIP = req.ip.replace(/^::ffff:/, '');
    const ip = ipaddr.parse(strippedIP);
    if (ip.kind() === 'ipv4') {
        return strippedIP;
    }

    const v6Bytes = ip.toByteArray();
          v6Bytes.fill(0, prefix / 8);

    return ipaddr.fromByteArray(v6Bytes).toString();
}
