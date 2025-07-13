import * as cluster from "../../misc/cluster.js";

import { Agent } from "undici";
import { env } from "../../config.js";
import { Green, Yellow } from "../../misc/console-text.js";

const defaultAgent = new Agent();

let session;

const validateSession = (sessionResponse) => {
    if (!sessionResponse.potoken) {
        throw "no poToken in session response";
    }

    if (!sessionResponse.visitor_data) {
        throw "no visitor_data in session response";
    }

    if (!sessionResponse.updated) {
        throw "no last update timestamp in session response";
    }

    // https://github.com/iv-org/youtube-trusted-session-generator/blob/c2dfe3f/potoken_generator/main.py#L25
    if (sessionResponse.potoken.length < 160) {
        console.error(`${Yellow('[!]')} poToken is too short and might not work (${new Date().toISOString()})`);
    }
}

const updateSession = (newSession) => {
    session = newSession;
}

const loadSession = async () => {
    const sessionServerUrl = new URL(env.ytSessionServer);
    sessionServerUrl.pathname = "/token";

    const newSession = await fetch(
        sessionServerUrl,
        { dispatcher: defaultAgent }
    ).then(a => a.json());

    validateSession(newSession);

    if (!session || session.updated < newSession?.updated) {
        cluster.broadcast({ youtube_session: newSession });
        updateSession(newSession);
    }
}

const wrapLoad = (initial = false) => {
    loadSession()
    .then(() => {
        if (initial) {
            console.log(`${Green('[✓]')} poToken & visitor_data loaded successfully!`);
        }
    })
    .catch((e) => {
        console.error(`${Yellow('[!]')} Failed loading poToken & visitor_data at ${new Date().toISOString()}.`);
        console.error('Error:', e);
    })
}

export const getYouTubeSession = () => {
    return session;
}

export const setup = () => {
    if (cluster.isPrimary) {
        wrapLoad(true);
        if (env.ytSessionReloadInterval > 0) {
            setInterval(wrapLoad, env.ytSessionReloadInterval * 1000);
        }
    } else if (cluster.isWorker) {
        process.on('message', (message) => {
            if ('youtube_session' in message) {
                updateSession(message.youtube_session);
            }
        });
    }
}
