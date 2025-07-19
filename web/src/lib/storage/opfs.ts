import { AbstractStorage } from "./storage";
import { uuid } from "$lib/util";

const COBALT_PROCESSING_DIR = "cobalt-processing-data";

export class OPFSStorage extends AbstractStorage {
    #root;
    #handle;
    #io;

    static #isAvailable?: boolean;

    constructor(root: FileSystemDirectoryHandle, handle: FileSystemFileHandle, reader: FileSystemSyncAccessHandle) {
        super();
        this.#root = root;
        this.#handle = handle;
        this.#io = reader;
    }

    static async init() {
        const root = await navigator.storage.getDirectory();
        const cobaltDir = await root.getDirectoryHandle(COBALT_PROCESSING_DIR, { create: true });
        const handle = await cobaltDir.getFileHandle(uuid(), { create: true });
        const reader = await handle.createSyncAccessHandle();

        return new this(cobaltDir, handle, reader);
    }

    async res() {
        // await for compat with ios 15
        await this.#io.flush();
        await this.#io.close();
        return await this.#handle.getFile();
    }

    async write(data: Uint8Array | Int8Array, offset: number) {
        return this.#io.write(data, { at: offset })
    }

    async destroy() {
        await this.#root.removeEntry(this.#handle.name);
    }

    static async #computeIsAvailable() {
        let tempFile = uuid(), ok = true;

        if (typeof navigator === 'undefined')
            return false;

        if ('storage' in navigator && 'getDirectory' in navigator.storage) {
            try {
                const root = await navigator.storage.getDirectory();
                const handle = await root.getFileHandle(tempFile, { create: true });
                const syncAccess = await handle.createSyncAccessHandle();
                syncAccess.close();
            } catch {
                ok = false;
            }

            try {
                const root = await navigator.storage.getDirectory();
                await root.removeEntry(tempFile, { recursive: true });
            } catch {
                ok = false;
            }

            return ok;
        }

        return false;
    }

    static async isAvailable() {
        if (this.#isAvailable === undefined) {
            this.#isAvailable = await this.#computeIsAvailable();
        }

        return this.#isAvailable;
    }
}

export const removeFromFileStorage = async (filename: string) => {
    if (await OPFSStorage.isAvailable()) {
        const root = await navigator.storage.getDirectory();

        try {
            const cobaltDir = await root.getDirectoryHandle(COBALT_PROCESSING_DIR);
            await cobaltDir.removeEntry(filename);
        } catch {
            // catch and ignore
        }
    }
}

export const clearFileStorage = async () => {
    if (await OPFSStorage.isAvailable()) {
        const root = await navigator.storage.getDirectory();
        try {
            await root.removeEntry(COBALT_PROCESSING_DIR, { recursive: true });
        } catch {
            // ignore the error because the dir might be missing and that's okay!
        }
    }
}
