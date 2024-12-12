import { env } from "../config.js";

let client, redis, redisLimiter;

export const createStore = async (name) => {
    if (!env.redisURL) return;

    if (!client) {
        redis = await import('redis');
        redisLimiter = await import('rate-limit-redis');
        client = redis.createClient({ url: env.redisURL });
        await client.connect();
    }

    return new redisLimiter.default({
        prefix: `RL${name}_`,
        sendCommand: (...args) => client.sendCommand(args),
    });
}
