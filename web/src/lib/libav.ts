import mime from "mime";
import LibAV, { type LibAV as LibAVInstance } from "@imput/libav.js-remux-cli";
import type { FileInfo, RenderParams } from "./types/libav";

export default class LibAVWrapper {
    libav: LibAVInstance | null;
    concurrency: number;

    constructor() {
        this.libav = null;
        this.concurrency = Math.min(4, navigator.hardwareConcurrency);
    }

    async init() {
        if (!this.libav) {
            this.libav = await LibAV.LibAV({
                yesthreads: true,
                base: '/_libav'
            });
        }
    }

    async render({ blob, output, args }: RenderParams) {
        if (!this.libav) throw new Error("LibAV wasn't initialized");

        const inputKind = blob.type.split("/")[0];
        const inputExtension = mime.getExtension(blob.type);

        if (inputKind !== "video" && inputKind !== "audio") return;
        if (!inputExtension) return;

        const input: FileInfo = {
            kind: inputKind,
            extension: inputExtension,
        }

        if (!output) output = input;

        output.type = mime.getType(output.extension);
        if (!output.type) return;

        const outputName = `output.${output.extension}`;

        await this.libav.mkreadaheadfile("input", blob);

        // https://github.com/Yahweasel/libav.js/blob/7d359f69/docs/IO.md#block-writer-devices
        await this.libav.mkwriterdev(outputName);

        // since we expect the output file to be roughly the same size
        // as the original, preallocate its size for the output
        let writtenData = new Uint8Array(blob.size), actualSize = 0;

        this.libav.onwrite = (name, pos, data) => {
            if (name !== outputName) return;

            actualSize = Math.max(pos + data.length, actualSize);
            const newLen = Math.max(pos + data.length, writtenData.length);
            if (newLen > writtenData.length) {
                const newData = new Uint8Array(newLen);
                newData.set(writtenData);
                writtenData = newData;
            }
            writtenData.set(data, pos);
        };

        await this.libav.ffmpeg([
            '-nostdin', '-y',
            '-threads', this.concurrency.toString(),
            '-i', 'input',
            ...args,
            outputName
        ]);

        await this.libav.unlink(outputName);
        await this.libav.unlinkreadaheadfile("input");

        // if we didn't need as much space as we allocated for some reason,
        // shrink the buffer so that we don't inflate the file with zeros
        if (writtenData.length > actualSize) {
            writtenData = writtenData.slice(0, actualSize);
        }

        const renderBlob = new Blob(
            [ writtenData ],
            { type: output.type }
        );

        if (renderBlob.size === 0) return;
        return renderBlob;
    }
}