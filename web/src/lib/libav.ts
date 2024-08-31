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

    async init() {
        if (this.concurrency && !this.libav) {
            this.libav = LibAV.LibAV({
                yesthreads: true,
                base: '/_libav'
            });
        }
    }

    async probe(blob: Blob) {
        if (!this.libav) throw new Error("LibAV wasn't initialized");
        const libav = await this.libav;

        const OUT_FILE = 'output.json';
        await libav.mkreadaheadfile('input', blob);
        await libav.mkwriterdev(OUT_FILE);

        let writtenData = new Uint8Array(0);

        libav.onwrite = (name, pos, data) => {
            if (name !== OUT_FILE) return;

            const newLen = Math.max(pos + data.length, writtenData.length);
            if (newLen > writtenData.length) {
                const newData = new Uint8Array(newLen);
                newData.set(writtenData);
                writtenData = newData;
            }
            writtenData.set(data, pos);
        };

        await libav.ffprobe([
            '-v', 'quiet',
            '-print_format', 'json',
            '-show_format',
            '-show_streams',
            'input',
            '-o', OUT_FILE
        ]);

        await libav.unlink(OUT_FILE);
        await libav.unlinkreadaheadfile('input');

        const copy = new Uint8Array(writtenData);
        const text = new TextDecoder().decode(copy);
        return JSON.parse(text) as FfprobeData;
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

        await libav.mkreadaheadfile("input", blob);

        // https://github.com/Yahweasel/libav.js/blob/7d359f69/docs/IO.md#block-writer-devices
        await libav.mkwriterdev(outputName);
        await libav.mkwriterdev('progress.txt');

        // since we expect the output file to be roughly the same size
        // as the original, preallocate its size for the output
        let writtenData = new Uint8Array(blob.size), actualSize = 0;

        libav.onwrite = (name, pos, data) => {
            if (name === 'progress.txt') {
                try {
                    return this.#emitProgress(data);
                } catch(e) {
                    console.error(e);
                }
            } else if (name !== outputName) return;

            actualSize = Math.max(pos + data.length, actualSize);
            const newLen = Math.max(pos + data.length, writtenData.length);
            if (newLen > writtenData.length) {
                const newData = new Uint8Array(newLen);
                newData.set(writtenData);
                writtenData = newData;
            }
            writtenData.set(data, pos);
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

        await libav.unlink(outputName);
        await libav.unlink('progress.txt');
        await libav.unlinkreadaheadfile("input");

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