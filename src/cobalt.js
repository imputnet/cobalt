import "dotenv/config";

import express from "express";

import { Bright, Green, Red } from "./modules/sub/consoleText.js";
import { getCurrentBranch, shortCommit } from "./modules/sub/currentCommit.js";
import { loadLoc } from "./localization/manager.js";

import path from 'path';
import { fileURLToPath } from 'url';

import { runWeb } from "./core/web.js";
import { runAPI } from "./core/api.js";

const app = express();

const gitCommit = shortCommit();
const gitBranch = getCurrentBranch();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).slice(0, -4);

app.disable('x-powered-by');

await loadLoc();

const apiMode = process.env.apiURL && process.env.apiPort && !((process.env.webURL && process.env.webPort) || (process.env.selfURL && process.env.port));
const webMode = process.env.webURL && process.env.webPort && !((process.env.apiURL && process.env.apiPort) || (process.env.selfURL && process.env.port));

if (apiMode) {
    runAPI(express, app, gitCommit, gitBranch, __dirname)
} else if (webMode) {
    await runWeb(express, app, gitCommit, gitBranch, __dirname)
} else {
    console.log(Red(`cobalt wasn't configured yet or configuration is invalid.\n`) + Bright(`please run the setup script to fix this: `) + Green(`npm run setup`))
}
