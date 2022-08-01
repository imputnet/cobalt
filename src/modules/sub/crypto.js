import { createHmac, createHash, randomUUID } from "crypto";

export function encrypt(str, salt) {
    return createHmac("sha256", salt).update(str).digest("hex");
}
export function md5(string) {
    return createHash('md5').update(string).digest('hex');
}
export function UUID() {
    return randomUUID();
}
