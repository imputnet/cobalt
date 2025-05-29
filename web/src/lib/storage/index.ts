import type { AbstractStorage } from "./storage";
import { MemoryStorage } from "./memory";
import { OPFSStorage } from "./opfs";

export function init(expectedSize?: number): Promise<AbstractStorage> {
    if (OPFSStorage.isAvailable()) {
        return OPFSStorage.init();
    }

    if (MemoryStorage.isAvailable()) {
        return MemoryStorage.init(expectedSize || 0);
    }

    throw "no storage method is available";
}

export function retype(file: File, type: string) {
    return new File([ file ], file.name, { type });
}
