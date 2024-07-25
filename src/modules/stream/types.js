import { request } from "undici";
import ffmpeg from "ffmpeg-static";
import { spawn } from "child_process";
import { create as contentDisposition } from "content-disposition-header";

import { metadataManager } from "../sub/utils.js";
import { destroyInternalStream } from "./manage.js";
import { env, ffmpegArgs, hlsExceptions } from "../config.js";
import { getHeaders, closeRequest, closeResponse, pipe } from "./shared.js";

function toRawHeaders(headers) {
    return Object.entries(headers)
                 .map(([key, value]) => `${key}: ${value}\r\n`)
                 .join('');
}

function killProcess(p) {
    // ask the process to terminate itself gracefully
    p?.kill('SIGTERM');
    setTimeout(() => {
        if (p?.exitCode === null)
            // brutally murder the process if it didn't quit
            p?.kill('SIGKILL');
    }, 5000);
}

function getCommand(args) {
    if (typeof env.processingPriority === 'number' && !isNaN(env.processingPriority)) {
        return ['nice', ['-n', env.processingPriority.toString(), ffmpeg, ...args]]
    }
    return [ffmpeg, args]
}

export async function streamDefault(streamInfo, res) {
    const abortController = new AbortController();
    const shutdown = () => (
        closeRequest(abortController),
        closeResponse(res),
        destroyInternalStream(streamInfo.urls)
    );

    try {
        let filename = streamInfo.filename;
        if (streamInfo.isAudioOnly) {
            filename = `${streamInfo.filename}.${streamInfo.audioFormat}`
        }
        res.setHeader('Content-disposition', contentDisposition(filename));

        const { body: stream, headers } = await request(streamInfo.urls, {
            headers: getHeaders(streamInfo.service),
            signal: abortController.signal,
            maxRedirections: 16
        });

        for (const headerName of ['content-type', 'content-length']) {
            if (headers[headerName]) {
                res.setHeader(headerName, headers[headerName]);
            }
        }

        pipe(stream, res, shutdown);
    } catch {
        shutdown();
    }
}

export function streamLiveRender(streamInfo, res) {
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

export function streamAudioOnly(streamInfo, res) {
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

        if (streamInfo.metadata) {
            args = args.concat(metadataManager(streamInfo.metadata))
        }

        args = args.concat(ffmpegArgs[streamInfo.copy ? 'copy' : 'audio']);
        if (ffmpegArgs[streamInfo.audioFormat]) {
            args = args.concat(ffmpegArgs[streamInfo.audioFormat])
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
        res.setHeader('Content-Disposition', contentDisposition(`${streamInfo.filename}.${streamInfo.audioFormat}`));

        pipe(muxOutput, res, shutdown);
        res.on('finish', shutdown);
    } catch {
        shutdown();
    }
}

export function streamVideoOnly(streamInfo, res) {
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
            '-c', 'copy'
        )

        if (streamInfo.mute) {
            args.push('-an')
        }

        if (hlsExceptions.includes(streamInfo.service)) {
            args.push('-bsf:a', 'aac_adtstoasc')
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

export function convertToGif(streamInfo, res) {
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
        args = args.concat(ffmpegArgs["gif"]);
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
