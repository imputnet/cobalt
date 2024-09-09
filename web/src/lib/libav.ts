import mime from "mime";
import LibAV, { type LibAV as LibAVInstance } from "@imput/libav.js-remux-cli";
import type { FFmpegProgressCallback, FFmpegProgressEvent, FFmpegProgressStatus, FileInfo, RenderParams } from "./types/libav";
import type { FfprobeData } from "fluent-ffmpeg";
import { browser } from "$app/environment";

export default class LibAVWrapper {
    libav: Promise<LibAVInstance> | null;
    concurrency: number;
    onProgress?: FFmpegProgressCallback;

    constructor(onProgress?: FFmpegProgressCallback) {
        this.libav = null;
        this.concurrency = Math.min(4, browser ? navigator.hardwareConcurrency : 0);
        this.onProgress = onProgress;
    }

    init() {
        if (this.concurrency && !this.libav) {
            this.libav = LibAV.LibAV({
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

    static getExtensionFromType(blob: Blob) {
        const extensions = mime.getAllExtensions(blob.type);
        const overrides = ['mp3', 'mov'];

        if (!extensions)
            return;

        for (const override of overrides)
            if (extensions?.has(override))
                return override;

        return [...extensions][0];
    }

    async render({ blob, output, args }: RenderParams) {
        if (!this.libav) throw new Error("LibAV wasn't initialized");
        const libav = await this.libav;
        const inputKind = blob.type.split("/")[0];
        const inputExtension = LibAVWrapper.getExtensionFromType(blob);

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

        try {
            await libav.mkreadaheadfile("input", blob);

            // https://github.com/Yahweasel/libav.js/blob/7d359f69/docs/IO.md#block-writer-devices
            await libav.mkwriterdev(outputName);
            await libav.mkwriterdev('progress.txt');

            const MB = 1024 * 1024;
            const chunks: Uint8Array[] = [];
            const chunkSize = Math.min(512 * MB, blob.size);

            // since we expect the output file to be roughly the same size
            // as the original, preallocate its size for the output
            for (let toAllocate = blob.size; toAllocate > 0; toAllocate -= chunkSize) {
                chunks.push(new Uint8Array(chunkSize));
            }

            let actualSize = 0;
            libav.onwrite = (name, pos, data) => {
                if (name === 'progress.txt') {
                    try {
                        return this.#emitProgress(data);
                    } catch(e) {
                        console.error(e);
                    }
                } else if (name !== outputName) return;

                const writeEnd = pos + data.length;
                if (writeEnd > chunkSize * chunks.length) {
                    chunks.push(new Uint8Array(chunkSize));
                }

                const chunkIndex = pos / chunkSize | 0;
                const offset = pos - (chunkSize * chunkIndex);

                if (offset + data.length > chunkSize) {
                    chunks[chunkIndex].set(
                        data.subarray(0, chunkSize - offset), offset
                    );
                    chunks[chunkIndex + 1].set(
                        data.subarray(chunkSize - offset), 0
                    );
                } else {
                    chunks[chunkIndex].set(data, offset);
                }

                actualSize = Math.max(writeEnd, actualSize);
            };

            await libav.ffmpeg([
                '-nostdin', '-y',
                '-loglevel', 'error',
                '-progress', 'progress.txt',
                '-threads', this.concurrency.toString(),
                '-i', 'input',
                ...args,
                outputName
            ]);

            // if we didn't need as much space as we allocated for some reason,
            // shrink the buffers so that we don't inflate the file with zeroes
            const outputView: Uint8Array[] = [];

            for (let i = 0; i < chunks.length; ++i) {
                outputView.push(
                    chunks[i].subarray(
                        0, Math.min(chunkSize, actualSize)
                    )
                );

                actualSize -= chunkSize;
                if (actualSize <= 0) {
                    break;
                }
            }

            const renderBlob = new Blob(
                outputView,
                { type: output.type }
            );

            if (renderBlob.size === 0) return;
            return renderBlob;
        } finally {
            try {
                await libav.unlink(outputName);
                await libav.unlink('progress.txt');
                await libav.unlinkreadaheadfile("input");
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
                .map(a => a.split('=', ))
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