/**
 * YTubeDL Engine — standalone HTTP server (CLI entry).
 *
 * Runs the full engine behind the universal router on Node's http stack,
 * which Bun also implements — one binary-less server for every runtime:
 *
 *   node  node_modules/ytubedl-engine/dist/esm/server/cli.js --port 3030
 *   bun   node_modules/ytubedl-engine/dist/esm/server/cli.js --port 3030
 *   npx  ytubedl-engine serve --port 3030
 *
 * Flags:
 *   --port <n>          HTTP port (default 3020 or $YTUBEDL_PORT)
 *   --host <addr>       bind address (default 127.0.0.1)
 *   --data-dir <path>   engine data root (default $YTUBEDL_DATA_DIR or ./ytubedl-data)
 *   --concurrency <n>   parallel jobs (1–4)
 *   --profile <name>    power-saver | balanced | performance
 */
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { YTubeDL } from '../engine.js';
import { createEngineRouter } from './api.js';
import { nodeRequestToWeb, sendWebResponse } from '../node-bridge.js';
import { defaultServerPort, setDataRoot } from '../config.js';
import { ENGINE_NAME, ENGINE_VERSION } from '../types.js';
export function parseArgs(argv) {
    const args = { port: defaultServerPort(), host: '127.0.0.1' };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        const next = () => argv[++i];
        if (a === '--port' || a === '-p')
            args.port = Number(next());
        else if (a === '--host')
            args.host = String(next());
        else if (a === '--data-dir' || a === '-d')
            args.dataDir = String(next());
        else if (a === '--concurrency' || a === '-c')
            args.concurrency = Number(next());
        else if (a === '--profile')
            args.profile = String(next());
        else if (a === '--help' || a === '-h') {
            console.log([
                `YTubeDL Engine ${ENGINE_VERSION} — standalone server`,
                '',
                '  --port <n>          HTTP port (default 3020 or $YTUBEDL_PORT)',
                '  --host <addr>       bind address (default 127.0.0.1)',
                '  --data-dir <path>   engine data root',
                '  --concurrency <n>   parallel jobs (1-4)',
                '  --profile <name>    power-saver | balanced | performance',
            ].join('\n'));
            process.exit(0);
        }
    }
    return args;
}
export async function main(argv = process.argv.slice(2)) {
    const args = parseArgs(argv);
    if (args.dataDir)
        setDataRoot(args.dataDir);
    const engine = new YTubeDL({
        ...(args.concurrency ? { concurrency: args.concurrency } : {}),
        ...(args.profile ? { profile: args.profile } : {}),
    });
    const router = createEngineRouter(engine);
    const server = createServer((nodeReq, nodeRes) => {
        nodeRequestToWeb(nodeReq)
            .then((webReq) => router.handle(webReq))
            .catch((e) => {
            console.error('[ytubedl] request error:', e);
            return new Response('Bad Request', { status: 400 });
        })
            .then((webRes) => sendWebResponse(nodeRes, webRes))
            .catch(() => nodeRes.destroy());
    });
    // Long-running downloads with Range streaming
    server.requestTimeout = 0;
    server.headersTimeout = 60_000;
    await new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(args.port, args.host, resolve);
    });
    console.log(`[ytubedl] ${ENGINE_NAME} v${ENGINE_VERSION}`);
    console.log(`[ytubedl] HTTP API listening on http://${args.host}:${args.port}`);
    console.log('[ytubedl] routes: /api/health · /api/analyze · /api/jobs · /api/files/:id · /api/config');
    const shutdown = (sig) => {
        console.log(`\n[ytubedl] ${sig} received — shutting down`);
        server.close(() => process.exit(0));
        setTimeout(() => process.exit(0), 3000).unref();
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
}
// Direct execution (node cli.js / bun cli.js). Import-based usage calls main().
const invokedDirectly = process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
    main().catch((e) => {
        console.error('[ytubedl] fatal:', e instanceof Error ? e.message : e);
        process.exit(1);
    });
}
