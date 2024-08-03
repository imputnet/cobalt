import cors from "cors";
import rateLimit from "express-rate-limit";
import { setGlobalDispatcher, ProxyAgent } from "undici";

import { getCommit, getBranch, getRemote, getVersion } from "@imput/version-info";

import { env } from "../config.js";

import { generateHmac, generateSalt } from "../misc/crypto.js";
import { Bright, Cyan } from "../misc/console-text.js";
import { languageCode } from "../misc/utils.js";

import { createResponse, normalizeRequest, getIP } from "../processing/request.js";
import { verifyStream, getInternalStream } from "../stream/manage.js";
import { randomizeCiphers } from '../misc/randomize-ciphers.js';
import { extract } from "../processing/url.js";
import match from "../processing/match.js";
import stream from "../stream/stream.js";

const git = {
    branch: await getBranch(),
    commit: await getCommit(),
    remote: await getRemote(),
}

const version = await getVersion();

const acceptRegex = /^application\/json(; charset=utf-8)?$/;

const ipSalt = generateSalt();
const corsConfig = env.corsWildcard ? {} : {
    origin: env.corsURL,
    optionsSuccessStatus: 200
}

export function runAPI(express, app, __dirname) {
    const startTime = new Date();
    const startTimestamp = startTime.getTime();

    const serverInfo = {
        version: version,
        git,
        cors: Number(env.corsWildcard),
        url: env.apiURL,
        startTime: `${startTimestamp}`,
    }

    const apiLimiter = rateLimit({
        windowMs: env.rateLimitWindow * 1000,
        max: env.rateLimitMax,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: req => generateHmac(getIP(req), ipSalt),
        handler: (req, res) => {
            return res.status(429).json({
                status: "error",
                error: {
                    code: "ErrorRateLimit",
                    context: {
                        limit: env.rateLimitWindow
                    },
                    text: "ErrorRateLimit" // temporary backwards compatibility
                }
            });
        }
    })

    const apiLimiterStream = rateLimit({
        windowMs: env.rateLimitWindow * 1000,
        max: env.rateLimitMax,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: req => generateHmac(getIP(req), ipSalt),
        handler: (req, res) => {
            return res.sendStatus(429)
        }
    })

    app.set('trust proxy', ['loopback', 'uniquelocal']);

    app.use('/api', cors({
        methods: ['GET', 'POST'],
        exposedHeaders: [
            'Ratelimit-Limit',
            'Ratelimit-Policy',
            'Ratelimit-Remaining',
            'Ratelimit-Reset'
        ],
        ...corsConfig,
    }))

    app.use('/api/json', apiLimiter);
    app.use('/api/stream', apiLimiterStream);

    app.use((req, res, next) => {
        try {
            decodeURIComponent(req.path)
        } catch {
            return res.redirect('/')
        }
        next();
    })

    app.use('/api/json', express.json({ limit: 1024 }));
    app.use('/api/json', (err, _, res, next) => {
        if (err) {
            return res.status(400).json({
                status: "error",
                error: {
                    code: "error.body.invalid",
                },
                text: "invalid json body", // temporary backwards compatibility
            });
        }

        next();
    });

    app.post('/api/json', async (req, res) => {
        const request = req.body;
        const lang = languageCode(req);

        const fail = (code) => {
            const { status, body } = createResponse("error", { code });
            res.status(status).json(body);
        }

        if (!acceptRegex.test(req.header('Accept'))) {
            return fail('ErrorInvalidAcceptHeader');
        }

        if (!acceptRegex.test(req.header('Content-Type'))) {
            return fail('ErrorInvalidContentType');
        }

        if (!request.url) {
            return fail('ErrorNoLink');
        }

        request.dubLang = request.dubLang ? lang : false;
        const normalizedRequest = normalizeRequest(request);
        if (!normalizedRequest) {
            return fail('ErrorCantProcess');
        }

        const parsed = extract(normalizedRequest.url);
        if (parsed === null) {
            return fail('ErrorUnsupported');
        }

        try {
            const result = await match(
                parsed.host, parsed.patternMatch, lang, normalizedRequest
            );

            res.status(result.status).json(result.body);
        } catch {
            fail('ErrorSomethingWentWrong');
        }
    })

    app.get('/api/stream', (req, res) => {
        const id = String(req.query.id);
        const exp = String(req.query.exp);
        const sig = String(req.query.sig);
        const sec = String(req.query.sec);
        const iv = String(req.query.iv);

        const checkQueries = id && exp && sig && sec && iv;
        const checkBaseLength = id.length === 21 && exp.length === 13;
        const checkSafeLength = sig.length === 43 && sec.length === 43 && iv.length === 22;

        if (!checkQueries || !checkBaseLength || !checkSafeLength) {
            return res.sendStatus(400);
        }

        // rate limit probe, will not return json after 8.0
        if (req.query.p) {
            return res.status(200).json({
                status: "continue"
            })
        }

        const streamInfo = verifyStream(id, sig, exp, sec, iv);
        if (!streamInfo?.service) {
            return res.sendStatus(streamInfo.status);
        }
        return stream(res, streamInfo);
    })

    app.get('/api/istream', (req, res) => {
        if (!req.ip.endsWith('127.0.0.1')) {
            return res.sendStatus(403);
        }

        if (String(req.query.id).length !== 21) {
            return res.sendStatus(400);
        }

        const streamInfo = getInternalStream(req.query.id);
        if (!streamInfo) {
            return res.sendStatus(404);
        }

        streamInfo.headers = new Map([
            ...(streamInfo.headers || []),
            ...Object.entries(req.headers)
        ]);

        return stream(res, { type: 'internal', ...streamInfo });
    })

    app.get('/api/serverInfo', (_, res) => {
        return res.status(200).json(serverInfo);
    })

    app.get('/favicon.ico', (req, res) => {
        res.status(404).end();
    })

    app.get('/*', (req, res) => {
        res.redirect('/api/serverInfo');
    })

    randomizeCiphers();
    setInterval(randomizeCiphers, 1000 * 60 * 30); // shuffle ciphers every 30 minutes

    if (env.externalProxy) {
        if (env.freebindCIDR) {
            throw new Error('Freebind is not available when external proxy is enabled')
        }

        setGlobalDispatcher(new ProxyAgent(env.externalProxy))
    }

    app.listen(env.apiPort, env.listenAddress, () => {
        console.log(`\n` +
            Bright(Cyan("cobalt ")) + Bright("API ^_^") + "\n" +

            "~~~~~~\n" +
            Bright("version: ") + version + "\n" +
            Bright("commit: ") + git.commit + "\n" +
            Bright("branch: ") + git.branch + "\n" +
            Bright("remote: ") + git.remote + "\n" +
            Bright("start time: ") + startTime.toUTCString() + "\n" +
            "~~~~~~\n" +

            Bright("url: ") + Bright(Cyan(env.apiURL)) + "\n" +
            Bright("port: ") + env.apiPort + "\n"
        )
    })
}
