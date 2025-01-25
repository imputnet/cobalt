import { strict as assert } from 'node:assert';

export default class Cookie {
    constructor(input) {
        assert(typeof input === 'object');
        this._values = {};

        for (const [ k, v ] of Object.entries(input))
            this.set(k, v);
    }

    set(key, value) {
        const old = this._values[key];
        if (old === value)
            return false;

        this._values[key] = value;
        return true;
    }

    unset(keys) {
        for (const key of keys) delete this._values[key]
    }

    static fromString(str) {
        const obj = {};

        str.split('; ').forEach(cookie => {
            const key = cookie.split('=')[0];
            const value = cookie.split('=').splice(1).join('=');
            obj[key] = value
        })

        return new Cookie(obj)
    }

    toString() {
        return Object.entries(this._values).map(([ name, value ]) => `${name}=${value}`).join('; ')
    }

    toJSON() {
        return this.toString()
    }

    values() {
        return Object.freeze({ ...this._values })
    }
}
