import cluster from "node:cluster";
import net from "node:net";
import { syncSecrets } from "../security/secrets.js";
import { env, isCluster } from "../config.js";

export { isPrimary, isWorker } from "node:cluster";

export const supportsReusePort = async () => {
    try {
        await new Promise((resolve, reject) => {
            const server = net.createServer().listen({ port: 0, reusePort: true });
            server.on('listening', () => server.close(resolve));
            server.on('error', (err) => (server.close(), reject(err)));
        });

        return true;
    } catch {
        return false;
    }
}

export const initCluster = async () => {
    if (cluster.isPrimary) {
        for (let i = 1; i < env.instanceCount; ++i) {
            cluster.fork();
        }
    }

    await syncSecrets();
}

export const broadcast = (message) => {
    if (!isCluster || !cluster.isPrimary || !cluster.workers) {
        return;
    }

    for (const worker of Object.values(cluster.workers)) {
        worker.send(message);
    }
}
