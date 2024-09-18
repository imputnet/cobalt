import env from "$lib/env";

export async function GET() {
    const CSP = {
        "connect-src": ["*"],
        "default-src": ["'none'"],

        "font-src": ["'self'"],
        "style-src": ["'self'"],
        "img-src": ["'self'"],
        "manifest-src": ["'self'"],
        "worker-src": ["'self'"],

        "script-src": [
            "'self'",
            "challenges.cloudflare.com",
            env.PLAUSIBLE_HOST ? env.PLAUSIBLE_HOST : ""
        ],
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
