import { createHmac, createCipheriv, createDecipheriv, scryptSync } from "crypto";

const algorithm = "aes256"
const keyLength = 32;

export function sha256(str, salt) {
    return createHmac("sha256", salt).update(str).digest("base64");
}

export function encryptStream(str, iv, secret) {
    const buff = Buffer.from(JSON.stringify(str), "utf-8");

    const key = scryptSync(Buffer.from(secret, "base64"), "salt", keyLength);
    const cipher = createCipheriv(algorithm, key, Buffer.from(iv, "base64"));

    return Buffer.from(cipher.update(buff, "utf8", "binary") + cipher.final("binary"), "binary");
}

export function decryptStream(buf, iv, secret) {
    const buff = Buffer.from(buf, "binary");

    const key = scryptSync(Buffer.from(secret, "base64"), "salt", keyLength);
    const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, "base64"));

    return decipher.update(buff, "binary", "utf8") + decipher.final("utf8");
}
