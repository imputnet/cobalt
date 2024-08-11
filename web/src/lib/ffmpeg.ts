import { FFmpeg } from "@imput/ffmpeg.wasm";
import ffmpegCore from "@imput/ffmpeg-core?url";
import ffmpegCoreWASM from "@imput/ffmpeg-core/wasm?url";

import mime from "mime";

type InputFileKind = "video" | "audio";

type FileInfo = {
    type?: string | null,
    kind: InputFileKind,
    extension: string,
}

type RenderParams = {
    file: File,
    output?: FileInfo,
    args: string[],
}

export default class FFmpegWrapper {
    initialized: boolean;
    ffmpeg: FFmpeg;
    concurrency: number;

    constructor() {
        this.ffmpeg = new FFmpeg();
        this.initialized = false;

        this.concurrency = Math.min(4, navigator.hardwareConcurrency);
    }

    async init() {
        if (this.initialized) {
            this.ffmpeg.terminate();
        } else {
            this.initialized = true;
            this.ffmpeg.on("log", ({ message }) => {
                console.log(message);
            });
        }

        await this.ffmpeg.load({
            coreURL: ffmpegCore,
            wasmURL: ffmpegCoreWASM,
            workerURL: "/ffmpeg-core.worker.js",
        });
    }

    terminate() {
        this.initialized = false;
        return this.ffmpeg.terminate();
    }

    async renderFile({ file, output, args }: RenderParams) {
        const inputKind = file.type.split("/")[0];
        const inputExtension = mime.getExtension(file.type);

        if (inputKind !== "video" && inputKind !== "audio") return;
        if (!inputExtension) return;

        const input: FileInfo = {
            kind: inputKind,
            extension: inputExtension,
        }

        if (!output) output = input;

        output.type = mime.getType(output.extension);
        if (!output.type) return;

        const buffer = new Uint8Array(await file.arrayBuffer());
        await this.ffmpeg.writeFile(
            'input',
            buffer
        );

        await this.ffmpeg.exec([
            '-threads', this.concurrency.toString(),
            '-i', 'input',
            ...args,
            `output.${output.extension}`
        ]);

        const renderBlob = new Blob(
            [await this.ffmpeg.readFile(`output.${output.extension}`)],
            { type: output.type }
        );

        if (renderBlob.size === 0) return;
        return renderBlob;
    }
}
