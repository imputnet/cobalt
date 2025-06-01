import { EventEmitter } from 'node:events';
import * as fs from 'node:fs/promises';

export class FileWatcher extends EventEmitter {
    #path;
    #hasWatcher = false;
    #lastChange = new Date().getTime();

    constructor({ path, ...rest }) {
        super(rest);
        this.#path = path;
    }

    async #setupWatcher() {
        if (this.#hasWatcher)
            return;

        this.#hasWatcher = true;
        const watcher = fs.watch(this.#path);
        for await (const _ of watcher) {
            if (new Date() - this.#lastChange > 50) {
                this.emit('file-updated');
                this.#lastChange = new Date().getTime();
            }
        }
    }

    read() {
        this.#setupWatcher();
        return fs.readFile(this.#path, 'utf8');
    }

    static fromFileProtocol(url_) {
        const url = new URL(url_);
        if (url.protocol !== 'file:') {
            return;
        }

        const pathname = url.pathname === '/' ? '' : url.pathname;
        const file_path = decodeURIComponent(url.host + pathname);
        return new this({ path: file_path });
    }
}
