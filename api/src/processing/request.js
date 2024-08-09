import ipaddr from "ipaddr.js";

import { createStream } from "../stream/manage.js";
import { apiSchema } from "./schema.js";

export function createResponse(responseType, responseData) {
    const internalError = (code) => {
        return {
            status: 500,
            body: {
                status: "error",
                error: {
                    code: code || "Internal Server Error",
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
                    url: responseData?.u,
                }
                break;

            case "stream":
                response = {
                    url: createStream(responseData),
                }
                break;

            case "picker":
                response = {
                    picker: responseData?.picker,
                    audio: responseData?.u
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

export function getIP(req) {
    const strippedIP = req.ip.replace(/^::ffff:/, '');
    const ip = ipaddr.parse(strippedIP);
    if (ip.kind() === 'ipv4') {
        return strippedIP;
    }

    const prefix = 56;
    const v6Bytes = ip.toByteArray();
          v6Bytes.fill(0, prefix / 8);

    return ipaddr.fromByteArray(v6Bytes).toString();
}