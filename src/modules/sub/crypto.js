import { createHmac, randomUUID } from "crypto";

export function encrypt(str, salt) {
    return createHmac("sha256", salt).update(str).digest("hex");
}
export function UUID() {
    return randomUUID();
}
