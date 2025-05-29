import { getVersion } from "@imput/version-info";
import { loadEnvs, validateEnvs, setupEnvWatcher } from "./core/env.js";
import * as cluster from "./misc/cluster.js";

const version = await getVersion();

const env = loadEnvs();

const genericUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
const cobaltUserAgent = `cobalt/${version} (+https://github.com/imputnet/cobalt)`;

export const canonicalEnv = Object.freeze(structuredClone(process.env));
export const setTunnelPort = (port) => env.tunnelPort = port;
export const isCluster = env.instanceCount > 1;
export const updateEnv = (newEnv) => {
    // tunnelPort is special and needs to get carried over here
    newEnv.tunnelPort = env.tunnelPort;

    for (const key in env) {
        env[key] = newEnv[key];
    }

    cluster.broadcast({ env_update: newEnv });
}

await validateEnvs(env);

if (env.envFile) {
    setupEnvWatcher();
}

export {
    env,
    genericUserAgent,
    cobaltUserAgent,
}
