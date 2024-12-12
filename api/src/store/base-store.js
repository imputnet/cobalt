const _stores = new Set();

export class Store {
    id;

    constructor(name) {
        name = name.toUpperCase();

        if (_stores.has(name))
            throw `${name} store already exists`;
        _stores.add(name);

        this.id = name;
    }

    async _has(_key) { await Promise.reject("needs implementation"); }
    has(key) {
        if (typeof key !== 'string') {
            key = key.toString();
        }

        return this._has(key);
    }

    async _get(_key) { await Promise.reject("needs implementation"); }
    async get(key) {
        if (typeof key !== 'string') {
            key = key.toString();
        }

        const val = await this._get(key);
        if (val === null)
            return null;

        return val;
    }

    async _set(_key, _val, _exp_sec = -1) { await Promise.reject("needs implementation") }
    set(key, val, exp_sec = -1) {
        if (typeof key !== 'string') {
            key = key.toString();
        }

        exp_sec = Math.round(exp_sec);

        return this._set(key, val, exp_sec);
    }
};
