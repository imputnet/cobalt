import { createHmac } from "crypto";

export function sha256(str, salt) {
    return createHmac("sha256", salt).update(str).digest("hex");
}
