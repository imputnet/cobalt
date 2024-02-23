import { genericUserAgent, version } from "../modules/config.js";
import { apiJSON, languageCode } from "../modules/sub/utils.js";
import { Bright, Cyan } from "../modules/sub/consoleText.js";

import { buildFront } from "../modules/build.js";
import findRendered from "../modules/pageRender/findRendered.js";

import { celebrationsEmoji } from "../modules/pageRender/elements.js";
import { changelogHistory } from "../modules/pageRender/onDemand.js";

export async function runWeb(express, app, gitCommit, gitBranch, __dirname) {
    const startTime = new Date();
    const startTimestamp = Math.floor(startTime.getTime());

    await buildFront(gitCommit, gitBranch);

    app.use('/', express.static('./build/min'));
    app.use('/', express.static('./src/front'));

    app.use((req, res, next) => {
        try { decodeURIComponent(req.path) } catch (e) { return res.redirect('/') }
        next();
    });
    app.get('/onDemand', (req, res) => {
        try {
            if (req.query.blockId) {
                let blockId = req.query.blockId.slice(0, 3);
                let r, j;
                switch(blockId) {
                    // changelog history
                    case "0":
                        r = changelogHistory();
                        j = r ? apiJSON(3, { t: r }) : apiJSON(0, {
                            t: "couldn't render this block, please try again!"
                        })
                        break;
                    // celebrations emoji
                    case "1":
                        r = celebrationsEmoji();
                        j = r ? apiJSON(3, { t: r }) : false
                        break;
                    default:
                        j = apiJSON(0, {
                            t: "couldn't find a block with this id"
                        })
                        break;
                }
                if (j.body) {
                    return res.status(j.status).json(j.body);
                } else {
                    return res.status(204).end();
                }
            } else {
                return res.status(400).json({
                    status: "error",
                    text: "couldn't render this block, please try again!"
                });
            }
        } catch (e) {
            return res.status(400).json({
                status: "error",
                text: "couldn't render this block, please try again!"
            })
        }
    });
    app.get("/status", (req, res) => {
        return res.status(200).end()
    });
    app.get("/", (req, res) => {
        return res.sendFile(`${__dirname}/${findRendered(languageCode(req), req.header('user-agent') ? req.header('user-agent') : genericUserAgent)}`)
    });
    app.get("/favicon.ico", (req, res) => {
        return res.sendFile(`${__dirname}/src/front/icons/favicon.ico`)
    });
    app.get("/*", (req, res) => {
        return res.redirect('/')
    });

    app.listen(process.env.webPort || 9001, () => {
        console.log(`\n` +
            `${Cyan("cobalt")} WEB ${Bright(`v.${version}-${gitCommit} (${gitBranch})`)}\n` +
            `Start time: ${Bright(`${startTime.toUTCString()} (${startTimestamp})`)}\n\n` +
            `URL: ${Cyan(`${process.env.webURL}`)}\n` +
            `Port: ${process.env.webPort || 9001}\n`
        )
    })
}
