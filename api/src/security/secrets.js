import cluster from "node:cluster";
import { createHmac, randomBytes } from "node:crypto";

const generateSalt = () => {
    if (cluster.isPrimary)
        return randomBytes(64);

    return null;
}

let rateSalt = generateSalt();
let streamSalt = generateSalt();

export const syncSecrets = () => {
    return new Promise((resolve, reject) => {
        if (cluster.isPrimary) {
            let remaining = Object.values(cluster.workers).length;
            const handleReady = (worker, m) => {
                if (m.ready)
                    worker.send({ rateSalt, streamSalt });

                if (!--remaining)
                    resolve();
            }

            for (const worker of Object.values(cluster.workers)) {
                worker.once(
                    'message',
                    (m) => handleReady(worker, m)
                );
            }
        } else if (cluster.isWorker) {
            if (rateSalt || streamSalt)
                return reject();

            process.send({ ready: true });
            process.once('message', (message) => {
                if (rateSalt || streamSalt)
                    return reject();

                if (message.rateSalt && message.streamSalt) {
                    streamSalt = Buffer.from(message.streamSalt);
                    rateSalt = Buffer.from(message.rateSalt);
                    resolve();
                }
            });
        } else reject();
    });
}


export const hashHmac = (value, type) => {
    let salt;
    if (type === 'rate')
        salt = rateSalt;
    else if (type === 'stream')
        salt = streamSalt;
    else
        throw "unknown salt";

    return createHmac("sha256", salt).update(value).digest();
}
