/**
 * YTubeDL Engine — universal HTTP API router.
 *
 * A pure Web-standard handler: (Request) → Promise<Response>. Mount it into:
 *   • Bun.serve({ fetch: router.handle })          — Bun
 *   • Next.js route handlers / Hono / Deno          — native Fetch API
 *   • Node http / Express / Fastify (raw req/res)   — via src/node-bridge.ts
 *   • or just use src/server/cli.ts                 — zero-code standalone
 *
 * Endpoints:
 *   GET    /api/health            engine + ffmpeg + youtube + demo status
 *   POST   /api/analyze           { urls: string[] } → per-link media info
 *   POST   /api/jobs              { jobs: JobRequest[] } → enqueue batch
 *   GET    /api/jobs              live job views (poll)
 *   GET    /api/jobs/:id          single job
 *   POST   /api/jobs/:id/cancel
 *   DELETE /api/jobs/:id          remove from history (?files=1 → delete files)
 *   GET    /api/files/:id         served with HTTP Range (?dl=1 → attachment)
 *   GET    /api/demo/thumb/:file  demo thumbnails
 *   POST   /api/config            { concurrency?, profile? }
 */
import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { ENGINE_NAME, ENGINE_VERSION } from '../types.js';
import { demoDir, ensureDataDirs } from '../config.js';
import { demoState } from '../demo-origin.js';
import { CORS_HEADERS, fileExists, jsonError, jsonOk, serveFileResponse } from '../serve.js';
export function createEngineRouter(engine) {
    let booted = null;
    function boot() {
        booted ??= (async () => {
            await ensureDataDirs();
            await engine.init();
        })();
        return booted;
    }
    return {
        async handle(req) {
            try {
                await boot();
                const url = new URL(req.url);
                const path = url.pathname.replace(/\/+$/, '') || '/';
                const parts = path.split('/').filter(Boolean); // e.g. ["api","jobs","x","cancel"]
                if (req.method === 'OPTIONS') {
                    return new Response(null, { status: 204, headers: CORS_HEADERS });
                }
                /* ----------------------------- health ---------------------------- */
                if (req.method === 'GET' && path === '/api/health') {
                    const force = url.searchParams.get('refresh') === '1';
                    return jsonOk(await engine.health(force));
                }
                /* ---------------------------- analyze ---------------------------- */
                if (req.method === 'POST' && path === '/api/analyze') {
                    const body = (await req.json().catch(() => null));
                    const rawUrls = body?.urls;
                    const urls = Array.isArray(rawUrls)
                        ? rawUrls.filter((u) => typeof u === 'string')
                        : null;
                    if (!urls || !urls.length)
                        return jsonError(400, 'Body must be { urls: string[] }');
                    if (urls.length > 50)
                        return jsonError(400, 'Maximum 50 links per batch');
                    const items = await engine.analyze(urls);
                    return jsonOk({ items });
                }
                /* ------------------------------ jobs ----------------------------- */
                if (req.method === 'POST' && path === '/api/jobs') {
                    const body = (await req.json().catch(() => null));
                    const rawJobs = body?.jobs;
                    const jobsReq = Array.isArray(rawJobs) ? rawJobs : null;
                    if (!jobsReq?.length)
                        return jsonError(400, 'Body must be { jobs: JobRequest[] }');
                    if (jobsReq.length > 50)
                        return jsonError(400, 'Maximum 50 jobs per batch');
                    for (const j of jobsReq) {
                        if (typeof j?.url !== 'string' || !['video', 'audio', 'subtitle'].includes(j?.kind)) {
                            return jsonError(400, 'Each job needs { url, kind: video|audio|subtitle }');
                        }
                    }
                    const views = jobsReq.map((j) => engine.enqueue(j));
                    return jsonOk({ jobs: views }, 201);
                }
                if (req.method === 'GET' && path === '/api/jobs') {
                    return jsonOk({ jobs: engine.jobs.listJobs() });
                }
                if (parts[0] === 'api' && parts[1] === 'jobs' && parts.length >= 3) {
                    const id = parts[2];
                    if (req.method === 'GET' && parts.length === 3) {
                        const job = engine.jobs.getJob(id);
                        return job ? jsonOk({ job }) : jsonError(404, 'No such job');
                    }
                    if (req.method === 'POST' && parts[3] === 'cancel' && parts.length === 4) {
                        const job = engine.jobs.cancel(id);
                        return job ? jsonOk({ job }) : jsonError(404, 'No such job');
                    }
                    if (req.method === 'DELETE' && parts.length === 3) {
                        const deleteFiles = url.searchParams.get('files') === '1';
                        const ok = await engine.jobs.remove(id, deleteFiles);
                        return ok ? jsonOk({ ok: true }) : jsonError(404, 'No such job');
                    }
                }
                /* ------------------------------ files ---------------------------- */
                if (req.method === 'GET' &&
                    parts[0] === 'api' &&
                    parts[1] === 'files' &&
                    parts.length === 3) {
                    const file = engine.jobs.getFile(parts[2]);
                    if (!file || !(await fileExists(file.path))) {
                        return jsonError(404, 'File not found (it may have been deleted)');
                    }
                    return serveFileResponse(req, file.path, {
                        mime: file.mimeType,
                        fileName: url.searchParams.get('dl') === '1' ? file.fileName : undefined,
                        inline: url.searchParams.get('dl') !== '1',
                    });
                }
                /* --------------------------- demo thumbs ------------------------- */
                if (req.method === 'GET' &&
                    parts[0] === 'api' &&
                    parts[1] === 'demo' &&
                    parts[2] === 'thumb' &&
                    parts.length === 4) {
                    // URL form: /api/demo/thumb/<videoId>.jpg  →  file: thumb-<videoId>.jpg
                    const name = parts[3].replace(/[^a-zA-Z0-9._-]/g, '');
                    const p = join(demoDir(), name.startsWith('thumb-') ? name : `thumb-${name}`);
                    if (!existsSync(p))
                        return jsonError(404, 'demo media still generating');
                    return serveFileResponse(req, p, { mime: 'image/jpeg' });
                }
                /* ------------------------------ config --------------------------- */
                if (req.method === 'POST' && path === '/api/config') {
                    const body = (await req.json().catch(() => null));
                    const patch = {};
                    if (typeof body?.concurrency === 'number')
                        patch.concurrency = body.concurrency;
                    if (typeof body?.profile === 'string')
                        patch.profile = body.profile;
                    const config = await engine.jobs.updateConfig(patch);
                    return jsonOk({ config });
                }
                /* ------------------------------ root ----------------------------- */
                if (req.method === 'GET' && path === '/') {
                    return jsonOk({
                        name: ENGINE_NAME,
                        version: ENGINE_VERSION,
                        demoReady: demoState.ready,
                        docs: 'POST /api/analyze { urls } · POST /api/jobs { jobs } · GET /api/jobs · GET /api/files/:id',
                    });
                }
                return jsonError(404, `No route: ${req.method} ${path}`);
            }
            catch (e) {
                const message = e instanceof Error ? e.message : 'Internal engine error';
                console.error('[ytubedl] API error:', message);
                return jsonError(500, message);
            }
        },
    };
}
