import cluster from "node:cluster";
import net from "node:net";
import { syncSecrets } from "../security/secrets.js";
import { env } from "../config.js";

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
