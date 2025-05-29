import LibAVWrapper from "$lib/libav";
import type { FileInfo } from "$lib/types/libav";

const ffmpeg = async (variant: string, files: File[], args: string[], output: FileInfo) => {
    if (!(files && output && args)) {
        self.postMessage({
            cobaltFFmpegWorker: {
                error: "queue.ffmpeg.no_args",
            }
        });
        return;
    }

    const ff = new LibAVWrapper((progress) => {
        self.postMessage({
            cobaltFFmpegWorker: {
                progress: {
                    durationProcessed: progress.out_time_sec,
                    speed: progress.speed,
                    size: progress.total_size,
                    currentFrame: progress.frame,
                    fps: progress.fps,
                }
            }
        })
    });

    ff.init({ variant });

    const error = (code: string) => {
        self.postMessage({
            cobaltFFmpegWorker: {
                error: code,
            }
        });
        ff.terminate();
    }

    try {
        // probing just the first file in files array (usually audio) for duration progress
        const probeFile = files[0];
        if (!probeFile) {
            return error("queue.ffmpeg.probe_failed");
        }

        let file_info;

        try {
            file_info = await ff.probe(probeFile);
        } catch (e) {
            console.error("error from ffmpeg worker @ file_info:");
            if (e instanceof Error && e?.message?.toLowerCase().includes("out of memory")) {
                console.error(e);

                error("queue.ffmpeg.out_of_memory");
                return self.close();
            } else {
                console.error(e);
                return error("queue.ffmpeg.probe_failed");
            }
        }

        if (!file_info?.format) {
            return error("queue.ffmpeg.no_input_format");
        }

        self.postMessage({
            cobaltFFmpegWorker: {
                progress: {
                    duration: Number(file_info.format.duration),
                }
            }
        });

        for (const file of files) {
            if (!file.type) {
                return error("queue.ffmpeg.no_input_type");
            }
        }

        let render;

        try {
            render = await ff.render({
                files,
                output,
                args,
            });
        } catch (e) {
            console.error("error from the ffmpeg worker @ render:");
            console.error(e);
            // TODO: more granular error codes
            return error("queue.ffmpeg.crashed");
        }

        if (!render) {
            return error("queue.ffmpeg.no_render");
        }

        await ff.terminate();

        self.postMessage({
            cobaltFFmpegWorker: {
                render
            }
        });
    } catch (e) {
        console.error("error from the ffmpeg worker:")
        console.error(e);
        return error("queue.ffmpeg.crashed");
    }
}

self.onmessage = async (event: MessageEvent) => {
    const ed = event.data.cobaltFFmpegWorker;
    if (ed?.variant && ed?.files && ed?.args && ed?.output) {
        await ffmpeg(ed.variant, ed.files, ed.args, ed.output);
    }
}
