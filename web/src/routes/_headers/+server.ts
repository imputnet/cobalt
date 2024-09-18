export async function GET() {
    const CSP = [
        "default-src 'none'",
        "script-src 'self' challenges.cloudflare.com",
        "frame-src challenges.cloudflare.com",
    ]

    const _headers = {
        "/*": {
            "Cross-Origin-Opener-Policy": "same-origin",
            "Cross-Origin-Embedder-Policy": "require-corp",
            "Content-Security-Policy": CSP.join("; "),
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
