import * as Storage from "$lib/storage";
import LibAV, { type LibAV as LibAVInstance } from "@imput/libav.js-remux-cli";
import EncodeLibAV from "@imput/libav.js-encode-cli";

import type { FfprobeData } from "fluent-ffmpeg";
import type { FFmpegProgressCallback, FFmpegProgressEvent, FFmpegProgressStatus, RenderParams } from "$lib/types/libav";

export default class LibAVWrapper {
    libav: Promise<LibAVInstance> | null;
    concurrency: number;
    onProgress?: FFmpegProgressCallback;

    constructor(onProgress?: FFmpegProgressCallback) {
        this.libav = null;
        this.concurrency = Math.min(4, navigator.hardwareConcurrency || 0);
        this.onProgress = onProgress;
    }

    init(options?: LibAV.LibAVOpts) {
        const variant = options?.variant || 'remux';
        let constructor: typeof LibAV.LibAV;

        if (variant === 'remux') {
            constructor = LibAV.LibAV;
        } else if (variant === 'encode') {
            constructor = EncodeLibAV.LibAV;
        } else {
            throw "invalid variant";
        }

        if (this.concurrency && !this.libav) {
            this.libav = constructor({
                ...options,
                variant: undefined,
                yesthreads: true,
                base: '/_libav'
            });
        }
    }

    async terminate() {
        if (this.libav) {
            const libav = await this.libav;
            libav.terminate();
        }
    }

    async probe(blob: Blob) {
        if (!this.libav) throw new Error("LibAV wasn't initialized");
        const libav = await this.libav;

        await libav.mkreadaheadfile('input', blob);

        try {
            await libav.ffprobe([
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_format',
                '-show_streams',
                'input',
                '-o', 'output.json'
            ]);

            const copy = await libav.readFile('output.json');
            const text = new TextDecoder().decode(copy);
            await libav.unlink('output.json');

            return JSON.parse(text) as FfprobeData;
        } finally {
            await libav.unlinkreadaheadfile('input');
        }
    }

    async render({ files, output, args }: RenderParams) {
        if (!this.libav) throw new Error("LibAV wasn't initialized");
        const libav = await this.libav;

        if (!(output.format && output.type)) {
            throw new Error("output's format or type is missing");
        }

        const outputName = `output.${output.format}`;
        const ffInputs = [];

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];

                await libav.mkreadaheadfile(`input${i}`, file);
                ffInputs.push('-i', `input${i}`);
            }

            await libav.mkwriterdev(outputName);
            await libav.mkwriterdev('progress.txt');

            const totalInputSize = files.reduce((a, b) => a + b.size, 0);
            const storage = await Storage.init(totalInputSize);

            libav.onwrite = async (name, pos, data) => {
                if (name === 'progress.txt') {
                    try {
                        return this.#emitProgress(data);
                    } catch (e) {
                        console.error(e);
                    }
                } else if (name !== outputName) return;

                await storage.write(data, pos);
            };

            await libav.ffmpeg([
                '-nostdin', '-y',
                '-loglevel', 'error',
                '-progress', 'progress.txt',
                '-threads', this.concurrency.toString(),
                ...ffInputs,
                ...args,
                outputName
            ]);

            const file = Storage.retype(await storage.res(), output.type);
            if (file.size === 0) return;

            return file;
        } finally {
            try {
                await libav.unlink(outputName);
                await libav.unlink('progress.txt');

                await Promise.allSettled(
                    files.map((_, i) =>
                        libav.unlinkreadaheadfile(`input${i}`)
                    ));
            } catch { /* catch & ignore */ }
        }
    }

    #emitProgress(data: Uint8Array | Int8Array) {
        if (!this.onProgress) return;

        const copy = new Uint8Array(data);
        const text = new TextDecoder().decode(copy);
        const entries = Object.fromEntries(
            text.split('\n')
                .filter(a => a)
                .map(a => a.split('='))
        );

        const status: FFmpegProgressStatus = (() => {
            const { progress } = entries;

            if (progress === 'continue' || progress === 'end') {
                return progress;
            }

            return "unknown";
        })();

        const tryNumber = (str: string, transform?: (n: number) => number) => {
            if (str) {
                const num = Number(str);
                if (!isNaN(num)) {
                    if (transform)
                        return transform(num);
                    else
                        return num;
                }
            }
        }

        const progress: FFmpegProgressEvent = {
            status,
            frame: tryNumber(entries.frame),
            fps: tryNumber(entries.fps),
            total_size: tryNumber(entries.total_size),
            dup_frames: tryNumber(entries.dup_frames),
            drop_frames: tryNumber(entries.drop_frames),
            speed: tryNumber(entries.speed?.trim()?.replace('x', '')),
            out_time_sec: tryNumber(entries.out_time_us, n => Math.floor(n / 1e6))
        };

        this.onProgress(progress);
    }
}
