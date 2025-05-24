import { getVersion } from "@imput/version-info";
import { loadEnvs, validateEnvs } from "./core/env.js";

const version = await getVersion();

let env = loadEnvs();

const genericUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
const cobaltUserAgent = `cobalt/${version} (+https://github.com/imputnet/cobalt)`;

export const setTunnelPort = (port) => env.tunnelPort = port;
export const isCluster = env.instanceCount > 1;

await validateEnvs(env);

export {
    env,
    genericUserAgent,
    cobaltUserAgent,
}
