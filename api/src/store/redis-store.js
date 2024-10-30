import { commandOptions, createClient } from "redis";
import { env } from "../config.js";
import { Store } from "./base-store.js";

export default class RedisStore extends Store {
    #client = createClient({
        url: env.redisURL,
    });
    #connected;

    constructor(name) {
        super(name);
        this.#connected = this.#client.connect();
    }

    #keyOf(key) {
        return this.id + '_' + key;
    }

    async _get(key) {
        await this.#connected;

        const data = await this.#client.hGetAll(
            commandOptions({ returnBuffers: true }),
            this.#keyOf(key)
        );

        if (!data.d) {
            return null;
        }

        const type = data.t;
        if (type && type[0] === 'b'.charCodeAt())
            return data.d;
        else
            return JSON.parse(data.d);
    }

    async _set(key, val, exp_sec = -1) {
        await this.#connected;

        const out = { d: val };
        if (val instanceof Buffer) {
            out.t = 'b';
        } else {
            out.d = JSON.stringify(val);
        }

        await this.#client.hSet(
            this.#keyOf(key),
            out
        );

        if (exp_sec > 0) {
            await this.#client.hExpire(
                this.#keyOf(key),
                Object.keys(out),
                exp_sec
            );
        }
    }
}
