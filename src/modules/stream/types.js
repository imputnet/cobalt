import { spawn } from "child_process";
import ffmpeg from "ffmpeg-static";
import { ffmpegArgs, genericUserAgent } from "../config.js";
import { getThreads, metadataManager, msToTime } from "../sub/utils.js";
import { request } from 'undici';

function fail(res) {
    if (!res.headersSent) res.sendStatus(500);
    return res.destroy();
}

export async function streamDefault(streamInfo, res) {
    try {
        let format = streamInfo.filename.split('.')[streamInfo.filename.split('.').length - 1];
        let regFilename = !streamInfo.mute ? streamInfo.filename : `${streamInfo.filename.split('.')[0]}_mute.${format}`;
        res.setHeader('Content-disposition', `attachment; filename="${streamInfo.isAudioOnly ? `${streamInfo.filename}.${streamInfo.audioFormat}` : regFilename}"`);

        const { body: stream, headers } = await request(streamInfo.urls, {
            headers: { 'user-agent': genericUserAgent }
        });

        res.setHeader('content-type', headers['content-type']);
        res.setHeader('content-length', headers['content-length']);

        stream.pipe(res).on('error', () => fail(res));
        stream.on('error', () => fail(res));
        stream.on('aborted', () => fail(res));
    } catch (e) {
        fail(res);
    }
}
export async function streamLiveRender(streamInfo, res) {
    try {
        if (streamInfo.urls.length !== 2) return fail(res);

        let { body: audio } = await request(streamInfo.urls[1]);

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
        let ffmpegProcess = spawn(ffmpeg, args, {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe', 'pipe'
            ],
        });
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', `attachment; filename="${streamInfo.filename}"`);
        res.on('error', () => {
            ffmpegProcess.kill();
            fail(res);
        });
        ffmpegProcess.stdio[4].pipe(res).on('error', () => {
            ffmpegProcess.kill();
            fail(res);
        });
        audio.pipe(ffmpegProcess.stdio[3]).on('error', () => {
            ffmpegProcess.kill();
            fail(res);
        });
        
        audio.on('error', () => {
            ffmpegProcess.kill();
            fail(res);
        });
        audio.on('aborted', () => {
            ffmpegProcess.kill();
            fail(res);
        });

        ffmpegProcess.on('disconnect', () => ffmpegProcess.kill());
        ffmpegProcess.on('close', () => ffmpegProcess.kill());
        ffmpegProcess.on('exit', () => ffmpegProcess.kill());
        res.on('finish', () => ffmpegProcess.kill());
        res.on('close', () => ffmpegProcess.kill());
        ffmpegProcess.on('error', () => {
            ffmpegProcess.kill();
            fail(res);
        });

    } catch (e) {
        fail(res);
    }
}
export function streamAudioOnly(streamInfo, res) {
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

        const ffmpegProcess = spawn(ffmpeg, args, {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe'
            ],
        });
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', `attachment; filename="${streamInfo.filename}.${streamInfo.audioFormat}"`);
        ffmpegProcess.stdio[3].pipe(res);

        ffmpegProcess.on('disconnect', () => ffmpegProcess.kill());
        ffmpegProcess.on('close', () => ffmpegProcess.kill());
        ffmpegProcess.on('exit', () => ffmpegProcess.kill());
        res.on('finish', () => ffmpegProcess.kill());
        res.on('close', () => ffmpegProcess.kill());
        ffmpegProcess.on('error', () => {
            ffmpegProcess.kill();
            fail(res);
        });
    } catch (e) {
        fail(res);
    }
}
export function streamVideoOnly(streamInfo, res) {
    try {
        let format = streamInfo.filename.split('.')[streamInfo.filename.split('.').length - 1], args = [
            '-loglevel', '-8',
            '-threads', `${getThreads()}`,
            '-i', streamInfo.urls,
            '-c', 'copy'
        ]
        if (streamInfo.mute) args.push('-an');
        if (streamInfo.service === "vimeo") args.push('-bsf:a', 'aac_adtstoasc');
        if (format === "mp4") args.push('-movflags', 'faststart+frag_keyframe+empty_moov');
        args.push('-f', format, 'pipe:3');
        const ffmpegProcess = spawn(ffmpeg, args, {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe'
            ],
        });
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', `attachment; filename="${streamInfo.filename.split('.')[0]}${streamInfo.mute ? '_mute' : ''}.${format}"`);
        ffmpegProcess.stdio[3].pipe(res);

        ffmpegProcess.on('disconnect', () => ffmpegProcess.kill());
        ffmpegProcess.on('close', () => ffmpegProcess.kill());
        ffmpegProcess.on('exit', () => ffmpegProcess.kill());
        res.on('finish', () => ffmpegProcess.kill());
        res.on('close', () => ffmpegProcess.kill());
        ffmpegProcess.on('error', () => {
            ffmpegProcess.kill();
            fail(res);
        });
    } catch (e) {
        fail(res);
    }
}
