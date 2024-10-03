import mime from "mime";
import LibAVWrapper from "$lib/libav";

let speed;
let processedDuration;

const ff = new LibAVWrapper(progress => {
    if (progress.out_time_sec) {
        processedDuration = progress.out_time_sec;
    }

    if (progress.speed) {
        speed = progress.speed;
    }
});

ff.init();

export const silentRemux = async (file: File) => {
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
        });

    if (!render) {
        return console.log("not a valid file");
    }

    const filenameParts = file.name.split(".");
    const filenameExt = filenameParts.pop();

    const filename = `${filenameParts.join(".")} (remux).${filenameExt}`;

    return new File([render], filename, {
        type: render.type
    })

}