export abstract class AbstractStorage {
    static init(_expected_size: number): Promise<AbstractStorage> {
        throw "init() call on abstract implementation";
    }

    static async isAvailable(): Promise<boolean> {
        return false;
    }

    abstract res(): Promise<File>;
    abstract write(data: Uint8Array | Int8Array, offset: number): Promise<number>;
    abstract destroy(): Promise<void>;
};
