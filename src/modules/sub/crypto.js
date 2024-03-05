import { createHmac, createCipheriv, createDecipheriv, scryptSync } from "crypto";

const algorithm = "aes256"
const keyLength = 32;

export function generateHmac(str, salt) {
    return createHmac("sha256", salt).update(str).digest("base64url");
}

export function encryptStream(plaintext, iv, secret) {
    const buff = Buffer.from(JSON.stringify(plaintext), "utf-8");

    const key = scryptSync(Buffer.from(secret, "base64url"), "salt", keyLength);
    const cipher = createCipheriv(algorithm, key, Buffer.from(iv, "base64url"));

    return Buffer.concat([ cipher.update(buff), cipher.final() ])
}

export function decryptStream(ciphertext, iv, secret) {
    const buff = Buffer.from(ciphertext, "binary");

    const key = scryptSync(Buffer.from(secret, "base64url"), "salt", keyLength);
    const decipher = createDecipheriv(algorithm, key, Buffer.from(iv, "base64url"));

    return Buffer.concat([ decipher.update(buff), decipher.final() ])
}
