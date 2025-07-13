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

        const [major, minor] = process.versions.node.split('.').map(Number);
        return major > 23 || (major === 23 && minor >= 1);
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

export const send = (message) => {
    if (!isCluster) {
        return;
    }

    if (cluster.isPrimary) {
        return broadcast(message);
    } else {
        return process.send(message);
    }
}

export const waitFor = (key) => {
    return new Promise(resolve => {
        const listener = (message) => {
            if (key in message) {
                process.off('message', listener);
                return resolve(message);
            }
        }

        process.on('message', listener);
    });
}

export const mainOnMessage = (cb) => {
    for (const worker of Object.values(cluster.workers)) {
        worker.on('message', cb);
    }
}
