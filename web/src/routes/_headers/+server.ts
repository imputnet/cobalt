import env from "$lib/env";

const allowedScriptOrigins = [
    "'self'",
    "challenges.cloudflare.com",
    env.PLAUSIBLE_HOST ? env.PLAUSIBLE_HOST : ""
]

export async function GET() {
    const CSP = {
        "connect-src": ["*"],
        "default-src": ["'self'"],

        "script-src": allowedScriptOrigins,
        "script-src-attr": allowedScriptOrigins,
        "frame-src": ["challenges.cloudflare.com"],
    }

    const _headers = {
        "/*": {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Content-Security-Policy":
                Object.entries(CSP).map(
                    ([directive, values]) => `${directive} ${values.join(' ')}`
                ).flat().join("; "),
        }
    }

    return new Response(
        Object.entries(_headers).map(
            ([path, headers]) => [
                path,
                Object.entries(headers).map(
                    ([key, value]) => `    ${key}: ${value}`
                )
            ].flat().join("\n")
        ).join("\n\n")
    );
}

export const prerender = true;
