import { spawn } from "child_process";
import ffmpeg from "ffmpeg-static";
import got from "got";
import { ffmpegArgs, genericUserAgent } from "../config.js";
import { msToTime } from "../sub/api-helper.js";
import { internalError } from "../sub/errors.js";
import loc from "../sub/i18n.js";

export async function streamDefault(streamInfo, res) {
    try {
        res.setHeader('Content-disposition', `attachment; filename="${streamInfo.filename}"`);
        const stream = got.get(streamInfo.urls, {
            headers: {
                "user-agent": genericUserAgent
            },
            isStream: true
        });
        stream.pipe(res).on('error', (err) => {
            throw Error("File stream pipe error.");
        });
        stream.on('error', (err) => {
            throw Error("File stream error.")
        });
    } catch (e) {
        internalError(res);
    }
}
export async function streamLiveRender(streamInfo, res) {
    try {
        if (streamInfo.urls.length == 2) {
            let headers = {};
            if (streamInfo.service == "bilibili") {
                headers = { "user-agent": genericUserAgent };
            }
            const audio = got.get(streamInfo.urls[1], { isStream: true, headers: headers });
            const video = got.get(streamInfo.urls[0], { isStream: true, headers: headers });
            let format = streamInfo.filename.split('.')[streamInfo.filename.split('.').length - 1], args = [
                '-loglevel', '-8',
                '-i', 'pipe:3',
                '-i', 'pipe:4',
                '-map', '0:v',
                '-map', '1:a',
            ];
            args = args.concat(ffmpegArgs[format])
            args.push('-t', msToTime(streamInfo.time), '-f', format, 'pipe:5');
            const ffmpegProcess = spawn(ffmpeg, args, {
                windowsHide: true,
                stdio: [
                    'inherit', 'inherit', 'inherit',
                    'pipe', 'pipe', 'pipe'
                ],
            });
            ffmpegProcess.on('error', (err) => {
                ffmpegProcess.kill();
            });
            audio.on('error', (err) => {
                ffmpegProcess.kill();
            });
            video.on('error', (err) => {
                ffmpegProcess.kill();
            });
            res.setHeader('Content-Disposition', `attachment; filename="${streamInfo.filename}"`);
            ffmpegProcess.stdio[5].pipe(res);
            video.pipe(ffmpegProcess.stdio[3]).on('error', (err) => {
                ffmpegProcess.kill();
            });
            audio.pipe(ffmpegProcess.stdio[4]).on('error', (err) => {
                ffmpegProcess.kill();
            });
        } else {
            res.status(400).json({ status: "error", text: loc('en', 'apiError', 'corruptedVideo') });
        }
    } catch (e) {
        internalError(res);
    }
}
export async function streamAudioOnly(streamInfo, res) {
    try {
        let headers = {};
        if (streamInfo.service == "bilibili") {
            headers = { "user-agent": genericUserAgent };
        }
        const audio = got.get(streamInfo.urls[0], { isStream: true, headers: headers });
        const ffmpegProcess = spawn(ffmpeg, [
            '-loglevel', '-8',
            '-i', 'pipe:3',
            '-vn',
            '-c:a', 'copy',
            '-f', `${streamInfo.filename.split('.')[streamInfo.filename.split('.').length - 1]}`,
            'pipe:4',
        ], {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe', 'pipe'
            ],
        });
        ffmpegProcess.on('error', (err) => {
            ffmpegProcess.kill();
        });
        audio.on('error', (err) => {
            ffmpegProcess.kill();
        });
        res.setHeader('Content-Disposition', `attachment; filename="${streamInfo.filename}"`);
        ffmpegProcess.stdio[4].pipe(res);
        audio.pipe(ffmpegProcess.stdio[3]).on('error', (err) => {
            ffmpegProcess.kill();
        });
    } catch (e) {
        internalError(res);
    }
}