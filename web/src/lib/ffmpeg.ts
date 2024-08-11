import ffmpegCore from "@imput/ffmpeg-core?url";
import ffmpegCoreWASM from "@imput/ffmpeg-core/wasm?url";

import { FFmpeg } from "@imput/ffmpeg.wasm";
import { fetchFile } from "@imput/ffmpeg-util";

type renderParams = {
    url: string,
    input: {
        type: string,
        format: string,
    },
    output: {
        type: string,
        format: string,
    },
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

    async renderFile({ url, input, output, args }: renderParams) {
        const inputFile = `input.${input.format}`;

        await this.ffmpeg.writeFile(
            inputFile,
            await fetchFile(url)
        )

        await this.ffmpeg.exec([
            '-threads', this.concurrency.toString(),
            '-i', inputFile,
            ...args,
            `output.${output.format}`
        ]);

        const data = await this.ffmpeg.readFile(`output.${output.format}`);
        const finalBlob = URL.createObjectURL(
            new Blob([data], { type: `${output.type}/${output.format}` })
        );

        return finalBlob
    }
}
