import { MinPriorityQueue } from '@datastructures-js/priority-queue';
import { Store } from './base-store.js';

// minimum delay between sweeps to avoid repeatedly
// sweeping entries close in proximity one by one.
const MIN_THRESHOLD_MS = 2500;

export default class MemoryStore extends Store {
    #store = new Map();
    #timeouts = new MinPriorityQueue/*<{ t: number, k: unknown }>*/((obj) => obj.t);
    #nextSweep = { id: null, t: null };

    constructor(name) {
        super(name);
    }

    _has(key) {
        return this.#store.has(key);
    }

    _get(key) {
        const val = this.#store.get(key);

        return val === undefined ? null : val;
    }

    _set(key, val, exp_sec = -1) {
        if (this.#store.has(key)) {
            this.#timeouts.remove(o => o.k === key);
        }

        if (exp_sec > 0) {
            const exp = 1000 * exp_sec;
            const timeout_at = +new Date() + exp;

            this.#timeouts.enqueue({ k: key, t: timeout_at });
        }

        this.#store.set(key, val);
        this.#reschedule();
    }

    #reschedule() {
        const current_time = new Date().getTime();
        const time = this.#timeouts.front()?.t;
        if (!time) {
            return;
        } else if (time < current_time) {
            return this.#sweepNow();
        }

        const sweep = this.#nextSweep;
        if (sweep.id === null || sweep.t > time) {
            if (sweep.id) {
                clearTimeout(sweep.id);
            }

            sweep.t = time;
            sweep.id = setTimeout(
                () => this.#sweepNow(),
                Math.max(MIN_THRESHOLD_MS, time - current_time)
            );
            sweep.id.unref();
        }
    }

    #sweepNow() {
        while (this.#timeouts.front()?.t < new Date().getTime()) {
            const item = this.#timeouts.dequeue();
            this.#store.delete(item.k);
        }

        this.#nextSweep.id = null;
        this.#nextSweep.t = null;
        this.#reschedule();
    }
}
