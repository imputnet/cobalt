import cors from "cors";
import rateLimit from "express-rate-limit";
import { randomBytes } from "crypto";

const ipSalt = randomBytes(64).toString('hex');

import { env, version } from "../modules/config.js";
import match from "../modules/processing/match.js";
import { languageCode } from "../modules/sub/utils.js";
import { createResponse, verifyRequest, getIP } from "../modules/processing/request.js";
import { Bright, Cyan } from "../modules/sub/consoleText.js";
import stream from "../modules/stream/stream.js";
import loc from "../localization/manager.js";
import { generateHmac } from "../modules/sub/crypto.js";
import { verifyStream, getInternalStream } from "../modules/stream/manage.js";
import { extract } from "../modules/processing/url.js";

export function runAPI(express, app, gitCommit, gitBranch, __dirname) {
    const corsConfig = !env.corsWildcard ? {
        origin: env.corsURL,
        optionsSuccessStatus: 200
    } : {};

    const apiLimiter = rateLimit({
        windowMs: 60000,
        max: 20,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: req => generateHmac(getIP(req), ipSalt),
        handler: (req, res) => {
            return res.status(429).json({
                "status": "rate-limit",
                "text": loc(languageCode(req), 'ErrorRateLimit')
            });
        }
    });
    const apiLimiterStream = rateLimit({
        windowMs: 60000,
        max: 25,
        standardHeaders: true,
        legacyHeaders: false,
        keyGenerator: req => generateHmac(getIP(req), ipSalt),
        handler: (req, res) => {
            return res.status(429).json({
                "status": "rate-limit",
                "text": loc(languageCode(req), 'ErrorRateLimit')
            });
        }
    });
    
    const startTime = new Date();
    const startTimestamp = startTime.getTime();

    app.set('trust proxy', ['loopback', 'uniquelocal']);

    app.use('/api/:type', cors({
        methods: ['GET', 'POST'],
        ...corsConfig
    }));

    app.use('/api/json', apiLimiter);
    app.use('/api/stream', apiLimiterStream);
    app.use('/api/onDemand', apiLimiter);

    app.use((req, res, next) => {
        try { decodeURIComponent(req.path) } catch (e) { return res.redirect('/') }
        next();
    });

    app.use('/api/json', express.json({
        verify: (req, res, buf) => {
            let acceptCon = String(req.header('Accept')) === "application/json";
            if (acceptCon) {
                if (buf.length > 720) throw new Error();
                JSON.parse(buf);
            } else {
                throw new Error();
            }
        }
    }));

    // handle express.json errors properly (https://github.com/expressjs/express/issues/4065)
    app.use('/api/json', (err, req, res, next) => {
        let errorText = "invalid json body";
        let acceptCon = String(req.header('Accept')) !== "application/json";

        if (err || acceptCon) {
            if (acceptCon) errorText = "invalid accept header";
            return res.status(400).json({
                status: "error",
                text: errorText
            });
        } else {
            next();
        }
    });

    const acceptRegex = /^application\/json(; charset=utf-8)?$/;
    app.post('/api/json', async (req, res) => {
        const request = req.body;
        const lang = languageCode(req);
        const fail = (t) => {
            const { status, body } = createResponse("error", { t: loc(lang, t) });
            res.status(status).json(body);
        }

        if (!acceptRegex.test(req.header('Content-Type'))) {
            return fail('ErrorInvalidContentType');
        }

        if (!request.url) {
            return fail('ErrorNoLink');
        }

        request.dubLang = request.dubLang ? lang : false;
        const normalizedRequest = verifyRequest(request);
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
    });

    app.get('/api/:type', (req, res) => {
        try {
            let j;
            switch (req.params.type) {
                case 'stream':
                    const q = req.query;
                    const checkQueries = q.t && q.e && q.h && q.s && q.i;
                    const checkBaseLength = q.t.length === 21 && q.e.length === 13;
                    const checkSafeLength = q.h.length === 43 && q.s.length === 43 && q.i.length === 22;
                    if (checkQueries && checkBaseLength && checkSafeLength) {
                        if (q.p) {
                            return res.status(200).json({
                                status: "continue"
                            })
                        }
                        let streamInfo = verifyStream(q.t, q.h, q.e, q.s, q.i);
                        if (streamInfo.error) {
                            return res.status(streamInfo.status).json(apiJSON(0, { t: streamInfo.error }).body);
                        }
                        return stream(res, streamInfo);
                    } 

                    j = apiJSON(0, {
                        t: "bad request. stream link may be incomplete or corrupted."
                    })
                    return res.status(j.status).json(j.body);
                case 'istream':
                    if (!req.ip.endsWith('127.0.0.1'))
                        return res.sendStatus(403);
                    if (('' + req.query.t).length !== 21)
                        return res.sendStatus(400);
    
                    let streamInfo = getInternalStream(req.query.t);
                    if (!streamInfo) return res.sendStatus(404);
                    streamInfo.headers = req.headers;
    
                    return stream(res, { type: 'internal', ...streamInfo });
                case 'serverInfo':
                    return res.status(200).json({
                        version: version,
                        commit: gitCommit,
                        branch: gitBranch,
                        name: env.apiName,
                        url: env.apiURL,
                        cors: Number(env.corsWildcard),
                        startTime: `${startTimestamp}`
                    });
                default:
                    j = apiJSON(0, {
                        t: "unknown response type"
                    })
                    return res.status(j.status).json(j.body);
            }
        } catch (e) {
            return res.status(500).json({
                status: "error",
                text: loc(languageCode(req), 'ErrorCantProcess')
            });
        }
    });

    app.get('/api/status', (req, res) => {
        res.status(200).end()
    });

    app.get('/favicon.ico', (req, res) => {
        res.sendFile(`${__dirname}/src/front/icons/favicon.ico`)
    });

    app.get('/*', (req, res) => {
        res.redirect('/api/json')
    });

    app.listen(env.apiPort, env.listenAddress, () => {
        console.log(`\n` +
            `${Cyan("cobalt")} API ${Bright(`v.${version}-${gitCommit} (${gitBranch})`)}\n` +
            `Start time: ${Bright(`${startTime.toUTCString()} (${startTimestamp})`)}\n\n` +
            `URL: ${Cyan(`${env.apiURL}`)}\n` +
            `Port: ${env.apiPort}\n`
        )
    });
}
