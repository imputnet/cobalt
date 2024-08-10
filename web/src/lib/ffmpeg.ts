import ffmpegCore from "@imput/ffmpeg-core?url";
import ffmpegCoreWASM from "@imput/ffmpeg-core/wasm?url";

import { FFmpeg } from "@imput/ffmpeg.wasm";
import { fetchFile } from "@imput/ffmpeg-util";

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

    async renderFile(url: string, type: string, format: string) {
        const input = `input.${format}`;

        await this.ffmpeg.writeFile(
            input,
            await fetchFile(url)
        )

        await this.ffmpeg.exec([
            '-threads', this.concurrency.toString(),
            '-i', input,
            '-c', 'copy',
            `output.${format}`
        ]);

        const data = await this.ffmpeg.readFile(`output.${format}`);
        const finalBlob = URL.createObjectURL(
            new Blob([data], { type: `${type}/${format}` })
        );

        return finalBlob
    }
}
