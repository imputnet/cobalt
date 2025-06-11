import { AbstractStorage } from "./storage";
import { uuid } from "$lib/util";

export class MemoryStorage extends AbstractStorage {
    #chunkSize: number;
    #actualSize: number = 0;
    #chunks: Uint8Array[] = [];

    constructor(chunkSize: number) {
        super();
        this.#chunkSize = chunkSize;
    }

    static async init(expectedSize: number) {
        const MB = 1024 * 1024;
        const chunkSize = Math.min(512 * MB, expectedSize);

        const storage = new this(chunkSize);

        // since we expect the output file to be roughly the same size
        // as inputs, preallocate its size for the output
        for (
            let toAllocate = expectedSize;
            toAllocate > 0;
            toAllocate -= chunkSize
        ) {
            storage.#chunks.push(new Uint8Array(chunkSize));
        }

        return storage;
    }

    async res() {
        // if we didn't need as much space as we allocated for some reason,
        // shrink the buffers so that we don't inflate the file with zeroes
        const outputView: Uint8Array[] = [];

        for (let i = 0; i < this.#chunks.length; ++i) {
            outputView.push(
                this.#chunks[i].subarray(
                    0,
                    Math.min(this.#chunkSize, this.#actualSize),
                ),
            );

            this.#actualSize -= this.#chunkSize;
            if (this.#actualSize <= 0) {
                break;
            }
        }

        return new File(outputView, uuid());
    }

    #expand(size: number) {
        while (size > this.#chunkSize * this.#chunks.length) {
            this.#chunks.push(new Uint8Array(this.#chunkSize));
        }
    }

    async write(data: Uint8Array | Int8Array, pos: number) {
        const writeEnd = pos + data.length;
        this.#expand(writeEnd);

        const chunkIndex = pos / this.#chunkSize | 0;
        const offset = pos - (this.#chunkSize * chunkIndex);

        if (offset + data.length > this.#chunkSize) {
            this.#chunks[chunkIndex].set(
                data.subarray(0, this.#chunkSize - offset),
                offset,
            );
            this.#chunks[chunkIndex + 1].set(
                data.subarray(this.#chunkSize - offset),
                0,
            );
        } else {
            this.#chunks[chunkIndex].set(data, offset);
        }

        this.#actualSize = Math.max(writeEnd, this.#actualSize);
        return data.length;
    }

    async destroy() {
        this.#chunks = [];
    }

    static async isAvailable() {
        return true;
    }
}
