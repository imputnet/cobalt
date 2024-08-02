
import { Bright, Cyan } from "../modules/sub/consoleText.js";
import { languageCode } from "../modules/sub/utils.js";
import { version, env } from "../modules/config.js";

import { buildFront } from "../modules/build.js";
import findRendered from "../modules/pageRender/findRendered.js";

import { celebrationsEmoji } from "../modules/pageRender/elements.js";
import { changelogHistory } from "../modules/pageRender/onDemand.js";
import { createResponse } from "../modules/processing/request.js";

export async function runWeb(express, app, gitCommit, gitBranch, __dirname) {
    const startTime = new Date();
    const startTimestamp = Math.floor(startTime.getTime());

    await buildFront(gitCommit, gitBranch);

    app.use('/', express.static('./build/min'));
    app.use('/', express.static('./src/front'));

    app.use((req, res, next) => {
        try { decodeURIComponent(req.path) } catch (e) { return res.redirect('/') }
        next();
    })

    app.get('/onDemand', (req, res) => {
        try {
            if (typeof req.query.blockId !== 'string') {
                return res.status(400).json({
                    status: "error",
                    text: "couldn't render this block, please try again!"
                });
            }

            let blockId = req.query.blockId.slice(0, 3);
            let blockData;
            switch(blockId) {
                // changelog history
                case "0":
                    let history = changelogHistory();
                    if (history) {
                        blockData = createResponse("success", { t: history })
                    } else {
                        blockData = createResponse("error", {
                            t: "couldn't render this block, please try again!"
                        })
                    }
                    break;
                // celebrations emoji
                case "1":
                    let celebration = celebrationsEmoji();
                    if (celebration) {
                        blockData = createResponse("success", { t: celebration })
                    }
                    break;
                default:
                    blockData = createResponse("error", {
                        t: "couldn't find a block with this id"
                    })
                    break;
            }

            if (blockData?.body) {
                return res.status(blockData.status).json(blockData.body);
            } else {
                return res.status(204).end();
            }
        } catch {
            return res.status(400).json({
                status: "error",
                text: "couldn't render this block, please try again!"
            })
        }
    })

    app.get("/", (req, res) => {
        return res.sendFile(`${__dirname}/${findRendered(languageCode(req))}`)
    })

    app.get("/favicon.ico", (req, res) => {
        return res.sendFile(`${__dirname}/src/front/icons/favicon.ico`)
    })

    app.get("/*", (req, res) => {
        return res.redirect('/')
    })

    app.listen(env.webPort, () => {
        console.log(`\n` +
            `${Cyan("cobalt")} WEB ${Bright(`v.${version}-${gitCommit} (${gitBranch})`)}\n` +
            `Start time: ${Bright(`${startTime.toUTCString()} (${startTimestamp})`)}\n\n` +
            `URL: ${Cyan(`${env.webURL}`)}\n` +
            `Port: ${env.webPort}\n`
        )
    })
}
