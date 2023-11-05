import { spawn } from "child_process";
import ffmpeg from "ffmpeg-static";
import { ffmpegArgs, genericUserAgent } from "../config.js";
import { getThreads, metadataManager } from "../sub/utils.js";
import { request } from "undici";
import { create as contentDisposition } from "content-disposition-header";
import { AbortController } from "abort-controller"

function closeRequest(controller) {
    try { controller.abort() } catch {}
}

function closeResponse(res) {
    if (!res.headersSent) res.sendStatus(500);
    return res.destroy();
}

function killProcess(p) {
    p?.kill();
    setTimeout(() => {
        if (p?.exitCode === null)
            p?.kill(9);
    }, 5000);
}

export async function streamDefault(streamInfo, res) {
    const abortController = new AbortController();
    const shutdown = () => (closeRequest(abortController), closeResponse(res));

    try {
        const filename = streamInfo.isAudioOnly ? `${streamInfo.filename}.${streamInfo.audioFormat}` : streamInfo.filename;
        res.setHeader('Content-disposition', contentDisposition(filename));

        const { body: stream, headers } = await request(streamInfo.urls, {
            headers: { 'user-agent': genericUserAgent },
            signal: abortController.signal,
            maxRedirections: 16
        });

        res.setHeader('content-type', headers['content-type']);
        res.setHeader('content-length', headers['content-length']);

        stream.on('error', shutdown)
              .pipe(res).on('error', shutdown);
    } catch {
        shutdown();
    }
}

export async function streamLiveRender(streamInfo, res) {
    let abortController = new AbortController(), process;
    const shutdown = () => (closeRequest(abortController), killProcess(process), closeResponse(res));

    try {
        if (streamInfo.urls.length !== 2) return shutdown();

        const { body: audio } = await request(streamInfo.urls[1], {
            maxRedirections: 16, signal: abortController.signal
        });

        let format = streamInfo.filename.split('.')[streamInfo.filename.split('.').length - 1],
        args = [
            '-loglevel', '-8',
            '-threads', `${getThreads()}`,
            '-i', streamInfo.urls[0],
            '-i', 'pipe:3',
            '-map', '0:v',
            '-map', '1:a',
        ];

        args = args.concat(ffmpegArgs[format]);
        if (streamInfo.metadata) args = args.concat(metadataManager(streamInfo.metadata));
        args.push('-f', format, 'pipe:4');

        process = spawn(ffmpeg, args, {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe', 'pipe'
            ],
        });

        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', contentDisposition(streamInfo.filename));

        audio.on('error', shutdown)
             .pipe(process.stdio[3]).on('error', shutdown);

        process.stdio[4].pipe(res).on('error', shutdown);
        process.on('close', shutdown);
        res.on('finish', shutdown);
        res.on('close', shutdown);
    } catch {
        shutdown();
    }
}

export function streamAudioOnly(streamInfo, res) {
    let process;
    const shutdown = () => (killProcess(process), closeResponse(res));

    try {
        let args = [
            '-loglevel', '-8',
            '-threads', `${getThreads()}`,
            '-i', streamInfo.urls
        ]

        if (streamInfo.metadata) {
            if (streamInfo.metadata.cover) { // currently corrupts the audio
                args.push('-i', streamInfo.metadata.cover, '-map', '0:a', '-map', '1:0')
            } else {
                args.push('-vn')
            }
            args = args.concat(metadataManager(streamInfo.metadata))
        } else {
            args.push('-vn')
        }

        let arg = streamInfo.copy ? ffmpegArgs["copy"] : ffmpegArgs["audio"];
        args = args.concat(arg);

        if (ffmpegArgs[streamInfo.audioFormat]) args = args.concat(ffmpegArgs[streamInfo.audioFormat]);
        args.push('-f', streamInfo.audioFormat === "m4a" ? "ipod" : streamInfo.audioFormat, 'pipe:3');

        process = spawn(ffmpeg, args, {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe'
            ],
        });
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', contentDisposition(`${streamInfo.filename}.${streamInfo.audioFormat}`));

        process.stdio[3].pipe(res);
        process.on('close', shutdown);
        res.on('finish', shutdown);
        res.on('close', shutdown);
    } catch {
        shutdown();
    }
}

export function streamVideoOnly(streamInfo, res) {
    let process;
    const shutdown = () => (killProcess(process), closeResponse(res));

    try {
        let format = streamInfo.filename.split('.')[streamInfo.filename.split('.').length - 1], args = [
            '-loglevel', '-8',
            '-threads', `${getThreads()}`,
            '-i', streamInfo.urls,
            '-c', 'copy'
        ]
        if (streamInfo.mute) args.push('-an');
        if (streamInfo.service === "vimeo" || streamInfo.service === "rutube") args.push('-bsf:a', 'aac_adtstoasc');
        if (format === "mp4") args.push('-movflags', 'faststart+frag_keyframe+empty_moov');
        args.push('-f', format, 'pipe:3');
        process = spawn(ffmpeg, args, {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe'
            ],
        });
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', contentDisposition(streamInfo.filename));

        process.stdio[3].pipe(res);
        process.on('close', shutdown);
        res.on('finish', shutdown);
        res.on('close', shutdown);
    } catch {
        shutdown();
    }
}
