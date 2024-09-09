import { request } from "undici";
import ffmpeg from "ffmpeg-static";
import { spawn } from "child_process";
import { create as contentDisposition } from "content-disposition-header";

import { env } from "../config.js";
import { metadataManager } from "../misc/utils.js";
import { destroyInternalStream } from "./manage.js";
import { hlsExceptions } from "../processing/service-config.js";
import { getHeaders, closeRequest, closeResponse, pipe } from "./shared.js";

const ffmpegArgs = {
    webm: ["-c:v", "copy", "-c:a", "copy"],
    mp4: ["-c:v", "copy", "-c:a", "copy", "-movflags", "faststart+frag_keyframe+empty_moov"],
    m4a: ["-movflags", "frag_keyframe+empty_moov"],
    gif: ["-vf", "scale=-1:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse", "-loop", "0"]
}

const toRawHeaders = (headers) => {
    return Object.entries(headers)
                 .map(([key, value]) => `${key}: ${value}\r\n`)
                 .join('');
}

const killProcess = (p) => {
    p?.kill('SIGTERM'); // ask the process to terminate itself gracefully

    setTimeout(() => {
        if (p?.exitCode === null)
            p?.kill('SIGKILL'); // brutally murder the process if it didn't quit
    }, 5000);
}

const getCommand = (args) => {
    if (typeof env.processingPriority === 'number' && !isNaN(env.processingPriority)) {
        return ['nice', ['-n', env.processingPriority.toString(), ffmpeg, ...args]]
    }
    return [ffmpeg, args]
}

const proxy = async (streamInfo, res) => {
    const abortController = new AbortController();
    const shutdown = () => (
        closeRequest(abortController),
        closeResponse(res),
        destroyInternalStream(streamInfo.urls)
    );

    try {
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        res.setHeader('Content-disposition', contentDisposition(streamInfo.filename));

        const { body: stream, headers, statusCode } = await request(streamInfo.urls, {
            headers: {
                ...getHeaders(streamInfo.service),
                Range: streamInfo.range
            },
            signal: abortController.signal,
            maxRedirections: 16
        });

        res.status(statusCode);

        for (const headerName of ['accept-ranges', 'content-type', 'content-length']) {
            if (headers[headerName]) {
                res.setHeader(headerName, headers[headerName]);
            }
        }

        pipe(stream, res, shutdown);
    } catch {
        shutdown();
    }
}

const merge = (streamInfo, res) => {
    let process;
    const shutdown = () => (
        killProcess(process),
        closeResponse(res),
        streamInfo.urls.map(destroyInternalStream)
    );

    const headers = getHeaders(streamInfo.service);
    const rawHeaders = toRawHeaders(headers);

    try {
        if (streamInfo.urls.length !== 2) return shutdown();

        const format = streamInfo.filename.split('.')[streamInfo.filename.split('.').length - 1];

        let args = [
            '-loglevel', '-8',
            '-headers', rawHeaders,
            '-i', streamInfo.urls[0],
            '-headers', rawHeaders,
            '-i', streamInfo.urls[1],
            '-map', '0:v',
            '-map', '1:a',
        ]

        args = args.concat(ffmpegArgs[format]);

        if (hlsExceptions.includes(streamInfo.service)) {
            args.push('-bsf:a', 'aac_adtstoasc')
        }

        if (streamInfo.metadata) {
            args = args.concat(metadataManager(streamInfo.metadata))
        }

        args.push('-f', format, 'pipe:3');

        process = spawn(...getCommand(args), {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe'
            ],
        });

        const [,,, muxOutput] = process.stdio;

        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', contentDisposition(streamInfo.filename));

        pipe(muxOutput, res, shutdown);

        process.on('close', shutdown);
        res.on('finish', shutdown);
    } catch {
        shutdown();
    }
}

const remux = (streamInfo, res) => {
    let process;
    const shutdown = () => (
        killProcess(process),
        closeResponse(res),
        destroyInternalStream(streamInfo.urls)
    );

    try {
        let args = [
            '-loglevel', '-8',
            '-headers', toRawHeaders(getHeaders(streamInfo.service)),
        ]

        if (streamInfo.service === "twitter") {
            args.push('-seekable', '0')
        }

        args.push(
            '-i', streamInfo.urls,
            '-c:v', 'copy',
        )

        if (streamInfo.type === "mute") {
            args.push('-an');
        }

        if (hlsExceptions.includes(streamInfo.service)) {
            if (streamInfo.type !== "mute") {
                args.push('-c:a', 'aac')
            }
            args.push('-bsf:a', 'aac_adtstoasc');
        }

        let format = streamInfo.filename.split('.')[streamInfo.filename.split('.').length - 1];
        if (format === "mp4") {
            args.push('-movflags', 'faststart+frag_keyframe+empty_moov')
        }

        args.push('-f', format, 'pipe:3');

        process = spawn(...getCommand(args), {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe'
            ],
        });

        const [,,, muxOutput] = process.stdio;

        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', contentDisposition(streamInfo.filename));

        pipe(muxOutput, res, shutdown);

        process.on('close', shutdown);
        res.on('finish', shutdown);
    } catch {
        shutdown();
    }
}

const convertAudio = (streamInfo, res) => {
    let process;
    const shutdown = () => (
        killProcess(process),
        closeResponse(res),
        destroyInternalStream(streamInfo.urls)
    );

    try {
        let args = [
            '-loglevel', '-8',
            '-headers', toRawHeaders(getHeaders(streamInfo.service)),
        ]

        if (streamInfo.service === "twitter") {
            args.push('-seekable', '0');
        }

        args.push(
            '-i', streamInfo.urls,
            '-vn'
        )

        if (streamInfo.audioCopy) {
            args.push("-c:a", "copy")
        } else {
            args.push("-b:a", `${streamInfo.audioBitrate}k`)
        }

        if (streamInfo.audioFormat === "mp3" && streamInfo.audioBitrate === "8") {
            args.push("-ar", "12000");
        }

        if (streamInfo.audioFormat === "opus") {
            args.push("-vbr", "off")
        }

        if (ffmpegArgs[streamInfo.audioFormat]) {
            args = args.concat(ffmpegArgs[streamInfo.audioFormat])
        }

        if (streamInfo.metadata) {
            args = args.concat(metadataManager(streamInfo.metadata))
        }

        args.push('-f', streamInfo.audioFormat === "m4a" ? "ipod" : streamInfo.audioFormat, 'pipe:3');

        process = spawn(...getCommand(args), {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe'
            ],
        });

        const [,,, muxOutput] = process.stdio;

        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', contentDisposition(streamInfo.filename));

        pipe(muxOutput, res, shutdown);
        res.on('finish', shutdown);
    } catch {
        shutdown();
    }
}

const convertGif = (streamInfo, res) => {
    let process;
    const shutdown = () => (killProcess(process), closeResponse(res));

    try {
        let args = [
            '-loglevel', '-8'
        ]

        if (streamInfo.service === "twitter") {
            args.push('-seekable', '0')
        }

        args.push('-i', streamInfo.urls);
        args = args.concat(ffmpegArgs.gif);
        args.push('-f', "gif", 'pipe:3');

        process = spawn(...getCommand(args), {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe'
            ],
        });

        const [,,, muxOutput] = process.stdio;

        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', contentDisposition(streamInfo.filename.split('.')[0] + ".gif"));

        pipe(muxOutput, res, shutdown);

        process.on('close', shutdown);
        res.on('finish', shutdown);
    } catch {
        shutdown();
    }
}

export default {
    proxy,
    merge,
    remux,
    convertAudio,
    convertGif,
}
