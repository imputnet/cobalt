export abstract class AbstractStorage {
    static init(): Promise<AbstractStorage> {
        throw "init() call on abstract implementation";
    }

    static isAvailable(): boolean {
        return false;
    }

    abstract res(): Promise<File>;
    abstract read(size: number, offset: number): Uint8Array;
    abstract write(data: Uint8Array | Int8Array, offset: number): Promise<number>;
    abstract destroy(): Promise<void>;
};

