import "dotenv/config";

import express from "express";

import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).slice(0, -4); // go up another level (get rid of src/)

import { getCurrentBranch, shortCommit } from "./modules/sub/currentCommit.js";
import { appName, genericUserAgent, version } from "./modules/config.js";
import { languageCode } from "./modules/sub/utils.js";
import { Bright, Cyan, Green, Red } from "./modules/sub/consoleText.js";
import { loadLoc } from "./localization/manager.js";
import { buildFront } from "./modules/build.js";
import findRendered from "./modules/pageRender/findRendered.js";

if (process.env.webURL && process.env.webPort) {
    const commitHash = shortCommit();
    const branch = getCurrentBranch();
    const app = express();

    app.disable('x-powered-by');

    // preload localization files and build static pages
    await loadLoc();
    await buildFront(commitHash, branch);

    app.use('/', express.static('./build/min'));
    app.use('/', express.static('./src/front'));

    app.use((req, res, next) => {
        try { decodeURIComponent(req.path) } catch (e) { return res.redirect('/') }
        next();
    });
    app.use((req, res, next) => {
        if (req.header("user-agent") && req.header("user-agent").includes("Trident")) res.destroy();
        next();
    });
    app.get("/status", (req, res) => {
        res.status(200).end()
    });
    app.get("/", (req, res) => {
        res.sendFile(`${__dirname}/${findRendered(languageCode(req), req.header('user-agent') ? req.header('user-agent') : genericUserAgent)}`);
    });
    app.get("/favicon.ico", (req, res) => {
        res.redirect('/icons/favicon.ico');
    });
    app.get("/*", (req, res) => {
        res.redirect('/')
    });

    app.listen(process.env.webPort, () => {
        let startTime = new Date();
        console.log(`\n${Cyan(appName)} WEB ${Bright(`v.${version}-${commitHash} (${branch})`)}\nStart time: ${Bright(`${startTime.toUTCString()} (${Math.floor(new Date().getTime())})`)}\n\nURL: ${Cyan(`${process.env.webURL}`)}\nPort: ${process.env.webPort}\n`)
    })
} else {
    console.log(Red(`cobalt web hasn't been configured yet or configuration is invalid.\n`) + Bright(`please run the setup script to fix this: `) + Green(`npm run setup`));
}
