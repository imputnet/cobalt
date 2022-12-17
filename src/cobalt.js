import "dotenv/config"

import express from "express";
import cors from "cors";
import * as fs from "fs";
import rateLimit from "express-rate-limit";

import { shortCommit } from "./modules/sub/currentCommit.js";
import { appName, genericUserAgent, version, internetExplorerRedirect } from "./modules/config.js";
import { getJSON } from "./modules/api.js";
import renderPage from "./modules/pageRender/page.js";
import { apiJSON, checkJSONPost, languageCode } from "./modules/sub/utils.js";
import { Bright, Cyan, Green, Red } from "./modules/sub/consoleText.js";
import stream from "./modules/stream/stream.js";
import loc from "./localization/manager.js";
import { buildFront } from "./modules/build.js";
import { changelogHistory } from "./modules/pageRender/onDemand.js";
import { encrypt } from "./modules/sub/crypto.js";

const commitHash = shortCommit();
const app = express();

app.disable('x-powered-by');

if (fs.existsSync('./.env') && process.env.selfURL && process.env.streamSalt && process.env.port) {
    const apiLimiter = rateLimit({
        windowMs: 1 * 60 * 1000,
        max: 12,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next, opt) => {
            res.status(429).json({ "status": "error", "text": loc(languageCode(req), 'ErrorRateLimit') });
        }
    });
    const apiLimiterStream = rateLimit({
        windowMs: 1 * 60 * 1000,
        max: 12,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next, opt) => {
            res.status(429).json({ "status": "error", "text": loc(languageCode(req), 'ErrorRateLimit') });
        }
    });

    await buildFront();
    app.use('/api/', apiLimiter);
    app.use('/api/stream', apiLimiterStream);
    app.use('/', express.static('./min'));
    app.use('/', express.static('./src/front'));

    app.use((req, res, next) => {
        try {
            decodeURIComponent(req.path)
        }
        catch (e) {
            return res.redirect(process.env.selfURL);
        }
        next();
    });
    app.use('/api/json', express.json({
        verify: (req, res, buf) => {
            try {
                JSON.parse(buf);
                if (buf.length > 720) throw new Error();
                if (req.header('Content-Type') != "application/json") res.status(500).json({ 'status': 'error', 'text': 'invalid content type header' })
                if (req.header('Accept') != "application/json") res.status(500).json({ 'status': 'error', 'text': 'invalid accept header' })
            } catch(e) {
                res.status(500).json({ 'status': 'error', 'text': 'invalid json body.' })
            }
        }
    }));
    app.post('/api/:type', cors({ origin: process.env.selfURL, optionsSuccessStatus: 200 }), async (req, res) => {
        try {
            let ip = encrypt(req.header('x-forwarded-for') ? req.header('x-forwarded-for') : req.ip.replace('::ffff:', ''), process.env.streamSalt);
            switch (req.params.type) {
                case 'json':
                    try {
                        let request = req.body;
                        let chck = checkJSONPost(request);
                        if (request.url && chck) {
                            chck["ip"] = ip;
                            let j = await getJSON(chck["url"], languageCode(req), chck)
                            res.status(j.status).json(j.body);
                        } else if (request.url && !chck) {
                            let j = apiJSON(3, { t: loc(languageCode(req), 'ErrorCouldntFetch') });
                            res.status(j.status).json(j.body);
                        } else {
                            let j = apiJSON(3, { t: loc(languageCode(req), 'ErrorNoLink') })
                            res.status(j.status).json(j.body);
                        }
                    } catch (e) {
                        res.status(500).json({ 'status': 'error', 'text': loc(languageCode(req), 'ErrorCantProcess') })
                    }
                    break;
                default:
                    let j = apiJSON(0, { t: "unknown response type" })
                    res.status(j.status).json(j.body);
                    break;
            }
        } catch (e) {
            res.status(500).json({ 'status': 'error', 'text': loc(languageCode(req), 'ErrorCantProcess') })
        }
    });
    app.get('/api/:type', cors({ origin: process.env.selfURL, optionsSuccessStatus: 200 }), (req, res) => {
        try {
            let ip = encrypt(req.header('x-forwarded-for') ? req.header('x-forwarded-for') : req.ip.replace('::ffff:', ''), process.env.streamSalt);
            switch (req.params.type) {
                case 'json':
                    res.status(405).json({ 'status': 'error', 'text': 'GET method for this request has been deprecated. see https://github.com/wukko/cobalt/blob/current/docs/API.md for up-to-date API documentation.' });
                    break;
                case 'stream':
                    if (req.query.p) {
                        res.status(200).json({ "status": "continue" });
                    } else if (req.query.t && req.query.h && req.query.e) {
                        stream(res, ip, req.query.t, req.query.h, req.query.e);
                    } else {
                        let j = apiJSON(0, { t: "no stream id" })
                        res.status(j.status).json(j.body);
                    }
                    break;
                case 'onDemand':
                    if (req.query.blockId) {
                        let blockId = req.query.blockId.slice(0, 3)
                        let r, j;
                        switch(blockId) {
                            case "0":
                                r = changelogHistory();
                                j = r ? apiJSON(3, { t: r }) : apiJSON(0, { t: "couldn't render this block" })
                                break;
                            default:
                                j = apiJSON(0, { t: "couldn't find a block with this id" })
                                break;
                        }
                        res.status(j.status).json(j.body);
                    } else {
                        let j = apiJSON(0, { t: "no block id" })
                        res.status(j.status).json(j.body);
                    }
                    break;
                default:
                    let j = apiJSON(0, { t: "unknown response type" })
                    res.status(j.status).json(j.body);
                    break;
            }
        } catch (e) {
            res.status(500).json({ 'status': 'error', 'text': loc(languageCode(req), 'ErrorCantProcess') })
        }
    });
    app.get("/api", (req, res) => {
        res.redirect('/api/json')
    });
    app.get("/", (req, res) => {
        if (req.header("user-agent") && req.header("user-agent").includes("Trident")) {
            if (internetExplorerRedirect.newNT.includes(req.header("user-agent").split('NT ')[1].split(';')[0])) {
                res.redirect(internetExplorerRedirect.new)
            } else {
                res.redirect(internetExplorerRedirect.old)
            }
        } else {
            res.send(renderPage({
                "hash": commitHash,
                "type": "default",
                "lang": languageCode(req),
                "useragent": req.header('user-agent') ? req.header('user-agent') : genericUserAgent
            }))
        }
    });
    app.get("/favicon.ico", (req, res) => {
        res.redirect('/icons/favicon.ico');
    });
    app.get("/*", (req, res) => {
        res.redirect('/')
    });
    app.listen(process.env.port, () => {
        console.log(`\n${Cyan(appName)} ${Bright(`v.${version}-${commitHash}`)}\n\nURL: ${Cyan(`${process.env.selfURL}`)}\nPort: ${process.env.port}\nStart time: ${Bright(new Date().toUTCString())}\n`)
    });
} else {
    console.log(Red(`cobalt hasn't been configured yet or configuration is invalid.\n`) + Bright(`please run the setup script to fix this: `) + Green(`npm run setup`))
}
