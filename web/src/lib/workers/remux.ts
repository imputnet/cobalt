import LibAVWrapper from "$lib/libav";
import type { FileInfo } from "$lib/types/libav";

const error = (code: string) => {
    self.postMessage({
        cobaltRemuxWorker: {
            error: `error.${code}`,
        }
    })
}

const ff = new LibAVWrapper((progress) => {
    self.postMessage({
        cobaltRemuxWorker: {
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

ff.init();

const remux = async (files: File[], args: string[], output: FileInfo, filename: string) => {
    if (!(files && output && args)) return;

    await ff.init();

    try {
        // probing just the first file in files array (usually audio) for duration progress
        const file_info = await ff.probe(files[0]).catch((e) => {
            if (e?.message?.toLowerCase().includes("out of memory")) {
                console.error("uh oh! out of memory");
                console.error(e);

                error("remux.out_of_resources");
                self.close();
            }
        });

        if (!file_info?.format) {
            return error("remux.corrupted");
        }

        self.postMessage({
            cobaltRemuxWorker: {
                progress: {
                    duration: Number(file_info.format.duration),
                }
            }
        });

        for (const file of files) {
            if (!file.type) {
                // TODO: better & more appropriate error code
                return error("remux.corrupted");
            }
        }

        const render = await ff
            .render({
                files,
                output,
                args,
            })
            .catch((e) => {
                console.error("uh-oh! render error");
                console.error(e);
                // TODO: better error codes, there are more reasons for a crash
                error("remux.out_of_resources");
            });

        if (!render) {
            console.log("not a valid file");
            return error("incorrect input or output");
        }

        self.postMessage({
            cobaltRemuxWorker: {
                render,
                filename
            }
        });
    } catch (e) {
        console.log(e);
    }
}

self.onmessage = async (event: MessageEvent) => {
    const ed = event.data.cobaltRemuxWorker;
    if (ed) {
        if (ed.files && ed.args && ed.output && ed.filename) {
            await remux(ed.files, ed.args, ed.output, ed.filename);
        }
    }
}
