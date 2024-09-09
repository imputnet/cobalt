import { nanoid } from "nanoid";
import { createHmac } from "crypto";

import { env } from "../config.js";

const toBase64URL = (b) => Buffer.from(b).toString("base64url");
const fromBase64URL = (b) => Buffer.from(b, "base64url").toString();

const makeHmac = (header, payload) =>
    createHmac("sha256", env.jwtSecret)
        .update(`${header}.${payload}`)
        .digest("base64url");

const generate = () => {
    const exp = Math.floor(new Date().getTime() / 1000) + env.jwtLifetime;

    const header = toBase64URL(JSON.stringify({
        alg: "HS256",
        typ: "JWT"
    }));

    const payload = toBase64URL(JSON.stringify({
        jti: nanoid(8),
        exp,
    }));

    const signature = makeHmac(header, payload);

    return {
        token: `${header}.${payload}.${signature}`,
        exp: env.jwtLifetime - 2,
    };
}

const verify = (jwt) => {
    const [header, payload, signature] = jwt.split(".", 3);
    const timestamp = Math.floor(new Date().getTime() / 1000);

    if ([header, payload, signature].join('.') !== jwt) {
        return false;
    }

    const verifySignature = makeHmac(header, payload);

    if (verifySignature !== signature) {
        return false;
    }

    if (timestamp >= JSON.parse(fromBase64URL(payload)).exp) {
        return false;
    }

    return true;
}

export default {
    generate,
    verify,
}
