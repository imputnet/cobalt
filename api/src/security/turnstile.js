import { env } from "../config.js";

export const verifyTurnstileToken = async (turnstileResponse, ip) => {
    const result = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            secret: env.turnstileSecret,
            response: turnstileResponse,
            remoteip: ip,
        }),
    })
    .then(r => r.json())
    .catch(() => {});

    return !!result?.success;
}
