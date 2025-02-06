const cobaltProcessingDir = "cobalt-processing-data";

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
        const cobaltDir = await root.getDirectoryHandle(cobaltProcessingDir, { create: true });
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
        return this.#io.write(data, { at: offset })
    }

    async destroy() {
        await this.#root.removeEntry(this.#handle.name);
    }

    static isAvailable() {
        return !!navigator.storage?.getDirectory;
    }
}

export const removeFromFileStorage = async (filename: string) => {
    const root = await navigator.storage.getDirectory();
    const cobaltDir = await root.getDirectoryHandle(cobaltProcessingDir);
    return await cobaltDir.removeEntry(filename);
}

export const clearFileStorage = async () => {
    if (navigator.storage.getDirectory) {
        const root = await navigator.storage.getDirectory();
        try {
            await root.removeEntry(cobaltProcessingDir, { recursive: true });
        } catch {
            // ignore the error because the dir might be missing and that's okay!
        }
    }
}

export const clearCacheStorage = async () => {
    const keys = await caches.keys();

    for (const key of keys) {
        caches.delete(key);
    }
}

export const getStorageQuota = async () => {
    let estimate;
    if (navigator.storage.estimate) {
        estimate = await navigator.storage.estimate();
    }
    return estimate;
}
