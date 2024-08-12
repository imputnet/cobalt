import mime from "mime";
import LibAV, { type LibAV as LibAVInstance } from "@imput/libav.js-remux-cli";

type InputFileKind = "video" | "audio";

type FileInfo = {
    type?: string | null,
    kind: InputFileKind,
    extension: string,
}

type RenderParams = {
    blob: Blob,
    output?: FileInfo,
    args: string[],
}

export default class LibAVWrapper {
    libav!: LibAVInstance | null;
    concurrency: number;

    constructor() {
        this.concurrency = Math.min(4, navigator.hardwareConcurrency);
    }

    async init() {
        if (!this.libav) {
            this.libav = await LibAV.LibAV({
                yesthreads: true,
                base: '/_libav/'
            })
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
        let writtenData = new Uint8Array(0);

        this.libav.onwrite = (name, pos, data) => {
            if (name !== outputName) return;

            const newLen = Math.max(writtenData.length, pos + data.length);
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

        // FIXME: this is not correct, and needs to be replaced
        //        with unlinkmkreadaheadfile().
        await this.libav.unlink("input");

        const renderBlob = new Blob(
            [ writtenData ],
            { type: output.type }
        );

        if (renderBlob.size === 0) return;
        return renderBlob;
    }
}