import mime from "mime";
import LibAVWrapper from "$lib/libav";

const error = (code: string) => {
    return {
        error: `error.${code}`,
    }
}

const ff = new LibAVWrapper((progress) => {
    self.postMessage({
        progress: {
            durationProcessed: progress.out_time_sec,
            speed: progress.speed,
        }
    })
});

ff.init();

const remux = async (file: File) => {
    if (!file) return;

    await ff.init();

    try {
        const file_info = await ff.probe(file).catch((e) => {
            if (e?.message?.toLowerCase().includes("out of memory")) {
                console.error("uh oh! out of memory");
                console.error(e);

                self.postMessage(error("remux.out_of_resources"));
            }
        });

        if (!file_info?.format) {
            self.postMessage(error("remux.corrupted"));
            return;
        }

        self.postMessage({
            progressInfo: {
                duration: Number(file_info.format.duration),
            }
        });

        if (file instanceof File && !file.type) {
            file = new File([file], file.name, {
                type: mime.getType(file.name) ?? undefined,
            });
        }

        const render = await ff
            .render({
                blob: file,
                args: ["-c", "copy", "-map", "0"],
            })
            .catch((e) => {
                console.error("uh-oh! render error");
                console.error(e);

                self.postMessage(error("remux.out_of_resources"));
            });

        if (!render) {
            return console.log("not a valid file");
        }

        const filenameParts = file.name.split(".");
        const filenameExt = filenameParts.pop();

        const filename = `${filenameParts.join(".")} (remux).${filenameExt}`;

        self.postMessage({
            render,
            filename
        });
    } catch (e) {
        console.log(e);
    }
}

self.onmessage = async (event: MessageEvent) => {
    console.log(event.data);

    if (event.data.file) {
        await remux(event.data.file);
    }
}
