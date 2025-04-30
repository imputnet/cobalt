export abstract class AbstractStorage {
    static init(): Promise<AbstractStorage> {
        throw "init() call on abstract implementation";
    }

    static isAvailable(): boolean {
        return false;
    }

    abstract res(): Promise<Blob>;
    abstract write(data: Uint8Array | Int8Array, offset: number): Promise<number>;
    abstract destroy(): Promise<void>;
};

