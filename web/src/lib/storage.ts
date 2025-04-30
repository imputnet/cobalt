
const COBALT_PROCESSING_DIR = "cobalt-processing-data";

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
        const cobaltDir = await root.getDirectoryHandle(COBALT_PROCESSING_DIR, { create: true });
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
        if (typeof navigator === 'undefined')
            return false;

        return 'storage' in navigator && 'getDirectory' in navigator.storage;
    }
}

export const removeFromFileStorage = async (filename: string) => {
    const root = await navigator.storage.getDirectory();
    const cobaltDir = await root.getDirectoryHandle(COBALT_PROCESSING_DIR);
    return await cobaltDir.removeEntry(filename);
}

export const clearFileStorage = async () => {
    if (OPFSStorage.isAvailable()) {
        const root = await navigator.storage.getDirectory();
        try {
            await root.removeEntry(COBALT_PROCESSING_DIR, { recursive: true });
        } catch {
            // ignore the error because the dir might be missing and that's okay!
        }
    }
}
