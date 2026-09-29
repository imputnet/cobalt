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

    async _has(key) {
        await this.#connected;

        return this.#client.hExists(key);
    }

    async _get(key) {
        await this.#connected;

        const redisKey = this.#keyOf(key);
        const [valueType, value] = await Promise.all([
            this.#client.get(redisKey + '_t'),
            this.#client.get(
                commandOptions({ returnBuffers: true }),
                redisKey
            )
        ]);

        if (!value) {
            return null;
        }

        if (valueType === 'b')
            return value;
        else
            return JSON.parse(value);
    }

    async _set(key, val, exp_sec = -1) {
        await this.#connected;

        const options = exp_sec > 0 ? { EX: exp_sec } : undefined;

        if (val instanceof Buffer) {
            await this.#client.set(
                this.#keyOf(key) + '_t',
                'b',
                options
            );
        }

        await this.#client.set(
            this.#keyOf(key),
            val,
            options
        );
    }
}
