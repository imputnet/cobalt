import "dotenv/config";
import "./misc/alias-envs.js";

import express from "express";

import { Bright, Green, Red } from "./misc/console-text.js";
import { getCurrentBranch, shortCommit } from "./misc/current-commit.js";
import { env } from "./config.js"

import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

const gitCommit = shortCommit();
const gitBranch = getCurrentBranch();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).slice(0, -4);

app.disable('x-powered-by');

if (env.apiURL) {
    const { runAPI } = await import('./core/api.js');
    runAPI(express, app, gitCommit, gitBranch, __dirname)
} else {
    console.log(
        Red(`cobalt wasn't configured yet or configuration is invalid.\n`)
        + Bright(`please run the setup script to fix this: `)
        + Green(`npm run setup`)
    )
}
