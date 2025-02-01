export class OPFSStorage {
    #root;
    #handle;
    #io;

    constructor(root: FileSystemDirectoryHandle, handle: FileSystemFileHandle, reader: FileSystemSyncAccessHandle) {
        this.#root = root;
        this.#handle = handle;
        this.#io = reader;
    }

    static async init() {
        const root = await navigator.storage.getDirectory();
        const cobaltDir = await root.getDirectoryHandle('cobalt-processing-data', { create: true });
        const handle = await cobaltDir.getFileHandle(crypto.randomUUID(), { create: true });
        const reader = await handle.createSyncAccessHandle();

        return new this(cobaltDir, handle, reader);
    }

    async res() {
        // await for compat with ios 15
        await this.#io.flush();
        await this.#io.close();
        return await this.#handle.getFile();
    }

    read(size: number, offset: number) {
        const out = new Uint8Array(size);
        const bytesRead = this.#io.read(out, { at: offset });

        return out.subarray(0, bytesRead);
    }

    async write(data: Uint8Array | Int8Array, offset: number) {
        const writ = this.#io.write(data, { at: offset });

        if (data.length !== writ) {
            console.log(data.length, writ);
        }

        return writ;
    }

    async destroy() {
        await this.#root.removeEntry(this.#handle.name);
    }

    static isAvailable() {
        return !!navigator.storage?.getDirectory;
    }
}

