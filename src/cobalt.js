import "dotenv/config";

import express from "express";
import { setGlobalDispatcher } from "undici";
import { socksDispatcher } from "fetch-socks";
import { Bright, Green, Red } from "./modules/sub/consoleText.js";
import { getCurrentBranch, shortCommit } from "./modules/sub/currentCommit.js";
import { loadLoc } from "./localization/manager.js";

import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const gitCommit = shortCommit();
const gitBranch = getCurrentBranch();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).slice(0, -4);

app.disable('x-powered-by');

await loadLoc();

const torEnabled = (process.env.torHost && process.env.torPort && true) ? true : false;
const torGlobal = (process.env.torGlobal && process.env.torGlobal == "true") ? true : false;
global.torEnabled = torEnabled;

if (torEnabled) {
    let torProxy = {
        type: 5,
        host: process.env.torHost,
        port: Number(process.env.torPort)
    }
    let torOptions = {
        connect: {
            timeout: 30000
        }
    }
    let twitterTorOptions = torOptions;
    twitterTorOptions['connect']['rejectUnauthorized'] = false;

    global.torDispatcher = socksDispatcher(torProxy, torOptions)
    global.twitterTorDispatcher = socksDispatcher(torProxy, twitterTorOptions)
    if (torGlobal) setGlobalDispatcher(global.torDispatcher)
}

const apiMode = (process.env.apiURL && process.env.apiPort && !((process.env.webURL && process.env.webPort) || (process.env.selfURL && process.env.port))) ? true : false;
const webMode = (process.env.webURL && process.env.webPort && !((process.env.apiURL && process.env.apiPort) || (process.env.selfURL && process.env.port))) ? true : false;

if (apiMode) {
    const { runAPI } = await import('./core/api.js');
    runAPI(express, app, gitCommit, gitBranch, __dirname)
} else if (webMode) {
    const { runWeb } = await import('./core/web.js');
    await runWeb(express, app, gitCommit, gitBranch, __dirname)
} else {
    console.log(Red(`cobalt wasn't configured yet or configuration is invalid.\n`) + Bright(`please run the setup script to fix this: `) + Green(`npm run setup`))
}
