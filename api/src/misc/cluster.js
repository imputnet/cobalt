import net from "node:net";
import cluster from "node:cluster";
import { isCluster } from "../config.js";

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
    const { getSalt } = await import("../stream/manage.js");
    const salt = getSalt();

    for (let i = 1; i < env.instanceCount; ++i) {
        const worker = cluster.fork();
        worker.once('message', () => {
            worker.send({ salt });
        });
    }
}
