import { nanoid } from "nanoid";
import { createHmac } from "crypto";

import { env } from "../config.js";

const toBase64URL = (b) => Buffer.from(b).toString("base64url");
const fromBase64URL = (b) => Buffer.from(b, "base64url").toString();

const makeHmac = (data) => {
    return createHmac("sha256", env.jwtSecret)
            .update(data)
            .digest("base64url");
}

const sign = (header, payload) =>
        makeHmac(`${header}.${payload}`);

const getIPHash = (ip) =>
        makeHmac(ip).slice(0, 8);

const generate = (ip) => {
    const exp = Math.floor(new Date().getTime() / 1000) + env.jwtLifetime;

    const header = toBase64URL(JSON.stringify({
        alg: "HS256",
        typ: "JWT"
    }));

    const payload = toBase64URL(JSON.stringify({
        jti: nanoid(8),
        sub: getIPHash(ip),
        exp,
    }));

    const signature = sign(header, payload);

    return {
        token: `${header}.${payload}.${signature}`,
        exp: env.jwtLifetime - 2,
    };
}

const verify = (jwt, ip) => {
    const [header, payload, signature] = jwt.split(".", 3);
    const timestamp = Math.floor(new Date().getTime() / 1000);

    if ([header, payload, signature].join('.') !== jwt) {
        return false;
    }

    const verifySignature = sign(header, payload);

    if (verifySignature !== signature) {
        return false;
    }

    const data = JSON.parse(fromBase64URL(payload));

    return getIPHash(ip) === data.sub
            && timestamp <= data.exp;
}

export default {
    generate,
    verify,
}
