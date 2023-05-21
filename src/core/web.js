import { appName, genericUserAgent, version } from "../modules/config.js";
import { languageCode } from "../modules/sub/utils.js";
import { Bright, Cyan } from "../modules/sub/consoleText.js";
import { buildFront } from "../modules/build.js";
import findRendered from "../modules/pageRender/findRendered.js";

export async function runWeb(express, app, gitCommit, gitBranch, __dirname) {
    await buildFront(gitCommit, gitBranch);

    app.use('/', express.static('./build/min'));
    app.use('/', express.static('./src/front'));

    app.use((req, res, next) => {
        try { decodeURIComponent(req.path) } catch (e) { return res.redirect('/') }
        next();
    });
    app.get("/status", (req, res) => {
        res.status(200).end()
    });
    app.get("/", (req, res) => {
        res.sendFile(`${__dirname}/${findRendered(languageCode(req), req.header('user-agent') ? req.header('user-agent') : genericUserAgent)}`)
    });
    app.get("/favicon.ico", (req, res) => {
        res.sendFile(`${__dirname}/src/front/icons/favicon.ico`)
    });
    app.get("/*", (req, res) => {
        res.redirect('/')
    });

    app.listen(process.env.webPort, () => {
        let startTime = new Date();
        console.log(`\n${Cyan(appName)} WEB ${Bright(`v.${version}-${gitCommit} (${gitBranch})`)}\nStart time: ${Bright(`${startTime.toUTCString()} (${Math.floor(new Date().getTime())})`)}\n\nURL: ${Cyan(`${process.env.webURL}`)}\nPort: ${process.env.webPort}\n`)
    })
}
