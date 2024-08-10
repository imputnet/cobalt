// workaround so that vite doesn't fuck up the worker file
// and we can serve it from the same page at the same time

import ffmpegCoreWorker from "@imput/ffmpeg-core/worker?raw";

export function GET() {
    return new Response(ffmpegCoreWorker, {
        headers: {
            "Content-Type": "text/javascript"
        }
    })
}
