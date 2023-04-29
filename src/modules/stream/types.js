import { spawn } from "child_process";
import { Constants as YTConstants, Utils } from "youtubei.js";
import ffmpeg from "ffmpeg-static";
import got from "got";
import { ffmpegArgs, genericUserAgent } from "../config.js";
import { metadataManager, msToTime } from "../sub/utils.js";
import { Readable } from "stream";

export function streamDefault(streamInfo, res) {
    try {
        let format = streamInfo.filename.split('.')[streamInfo.filename.split('.').length - 1];
        let regFilename = !streamInfo.mute ? streamInfo.filename : `${streamInfo.filename.split('.')[0]}_mute.${format}`;
        res.setHeader('Content-disposition', `attachment; filename="${streamInfo.isAudioOnly ? `${streamInfo.filename}.${streamInfo.audioFormat}` : regFilename}"`);
        const stream = got.get(streamInfo.urls, {
            headers: {
                "user-agent": genericUserAgent
            },
            isStream: true
        });
        stream.pipe(res).on('error', () => {
            res.destroy();
        });
        stream.on('error', () => {
            res.destroy();
        });
        stream.on('aborted', () => {
            res.destroy();
        });
    } catch (e) {
        res.destroy();
    }
}
function createYoutubeStream(format_url) {
    // We need to download in chunks.
    const chunk_size = 1048576 * 10; // 10MB

    let chunk_start = 0;
    let chunk_end = chunk_size;
    let must_end = false;

    let cancel;
    let is_fetching = false;

    const url = new URL(format_url);
    const content_length = Number(url.searchParams.get('__clen'));
    url.searchParams.delete('__clen');
    format_url = url.toString();

    return new Readable({
        read() {
            if (is_fetching) return;
            if (must_end) {
                this.push(null);
                return;
            }
            is_fetching = true;
            
            if (chunk_end >= content_length) {
                must_end = true;
            }
            
            cancel = new AbortController();

            const chunk = got.get(`${format_url}&range=${chunk_start}-${chunk_end || ''}`, {
                headers: {
                    ...YTConstants.STREAM_HEADERS,
                    'User-Agent': Utils.getRandomUserAgent('desktop'),
                },
                isStream: true,
                responseType: 'buffer',
                signal: cancel.signal
            });
            
            chunk.on('data', data => {
                this.push(data);
            });

            chunk.on('end', () => {
                is_fetching = false;
                chunk_start = chunk_end + 1;
                chunk_end += chunk_size;
            });
            
            chunk.on('error', e => {
                this.emit('error', e);
                chunk.destroy();
            });
        },
        destroy() {
            if (is_fetching)
                cancel.abort();
        }
    });
}
export function streamLiveRender(streamInfo, res) {
    try {
        if (streamInfo.urls.length !== 2) {
            res.destroy();
            return;
        }
        let audio = streamInfo.service === 'youtube' ? createYoutubeStream(streamInfo.urls[1]) : got.get(streamInfo.urls[1], { isStream: true });
        let video = streamInfo.service === 'youtube' ? createYoutubeStream(streamInfo.urls[0]) : got.get(streamInfo.urls[0], { isStream: true });

        let format = streamInfo.filename.split('.')[streamInfo.filename.split('.').length - 1], args = [
            '-loglevel', '-8',
            '-i', 'pipe:5',
            '-i', 'pipe:3',
            '-map', '0:v',
            '-map', '1:a',
        ];
        args = args.concat(ffmpegArgs[format])
        if (streamInfo.time) args.push('-t', msToTime(streamInfo.time));
        args.push('-f', format, 'pipe:4');
        let ffmpegProcess = spawn(ffmpeg, args, {
            windowsHide: true,
            stdio: [
                'inherit', 'inherit', 'inherit',
                'pipe', 'pipe', 'pipe'
            ],
        });
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', `attachment; filename="${streamInfo.filename}"`);
        res.on('error', () => {
            ffmpegProcess.kill();
            res.destroy();
        });
        ffmpegProcess.stdio[4].pipe(res).on('error', () => {
            ffmpegProcess.kill();
            res.destroy();
        });

        audio.pipe(ffmpegProcess.stdio[3]).on('error', () => {
            ffmpegProcess.kill();
            res.destroy();
        });
        audio.on('error', () => {
            ffmpegProcess.kill();
            res.destroy();
        });
        audio.on('aborted', () => {
            ffmpegProcess.kill();
            res.destroy();
        });

        video.pipe(ffmpegProcess.stdio[5]).on('error', () => {
            ffmpegProcess.kill();
            res.destroy();
        });
        video.on('error', () => {
            ffmpegProcess.kill();
            res.destroy();
        });
        video.on('aborted', () => {
            ffmpegProcess.kill();
            res.destroy();
        });

        ffmpegProcess.on('disconnect', () => ffmpegProcess.kill());
        ffmpegProcess.on('close', () => ffmpegProcess.kill());
        ffmpegProcess.on('exit', () => ffmpegProcess.kill());
        res.on('finish', () => ffmpegProcess.kill());
        res.on('close', () => ffmpegProcess.kill());
        ffmpegProcess.on('error', () => {
            ffmpegProcess.kill();
            res.destroy();
        });

    } catch (e) {
        res.destroy();
    }
}
export function streamAudioOnly(streamInfo, res) {
    try {
        const usePipedAudio = streamInfo.service === 'youtube';
        let args = [
            '-loglevel', '-8',
            '-i', usePipedAudio ? 'pipe:4' : streamInfo.urls
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
                'pipe', 'pipe'
            ],
        });
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', `attachment; filename="${streamInfo.filename}.${streamInfo.audioFormat}"`);
        ffmpegProcess.stdio[3].pipe(res);

        if (usePipedAudio) {
            const audio = streamInfo.service === 'youtube' ? createYoutubeStream(streamInfo.urls) : got.get(streamInfo.urls, { isStream: true });
            audio.pipe(ffmpegProcess.stdio[4]).on('error', () => {
                ffmpegProcess.kill();
                res.destroy();
            });
            audio.on('error', () => {
                ffmpegProcess.kill();
                res.destroy();
            });
            audio.on('aborted', () => {
                ffmpegProcess.kill();
                res.destroy();
            });
            res.on('error', () => {
                ffmpegProcess.kill();
                res.destroy();
            });
        }

        ffmpegProcess.on('disconnect', () => ffmpegProcess.kill());
        ffmpegProcess.on('close', () => ffmpegProcess.kill());
        ffmpegProcess.on('exit', () => ffmpegProcess.kill());
        res.on('finish', () => ffmpegProcess.kill());
        res.on('close', () => ffmpegProcess.kill());
        ffmpegProcess.on('error', () => {
            ffmpegProcess.kill();
            res.destroy();
        });
    } catch (e) {
        res.destroy();
    }
}
export function streamVideoOnly(streamInfo, res) {
    try {
        const usePipedVideo = streamInfo.service === 'youtube';
        let format = streamInfo.filename.split('.')[streamInfo.filename.split('.').length - 1], args = [
            '-loglevel', '-8',
            '-i', usePipedVideo ? 'pipe:4' : streamInfo.urls,
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
                'pipe', 'pipe'
            ],
        });
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Content-Disposition', `attachment; filename="${streamInfo.filename.split('.')[0]}${streamInfo.mute ? '_mute' : ''}.${format}"`);
        ffmpegProcess.stdio[3].pipe(res);

        if (usePipedVideo) {
            const video = streamInfo.service === 'youtube' ? createYoutubeStream(streamInfo.urls) : got.get(streamInfo.urls, { isStream: true });
            video.pipe(ffmpegProcess.stdio[4]).on('error', () => {
                ffmpegProcess.kill();
                res.destroy();
            });
            video.on('error', () => {
                ffmpegProcess.kill();
                res.destroy();
            });
            video.on('aborted', () => {
                ffmpegProcess.kill();
                res.destroy();
            });
            res.on('error', () => {
                ffmpegProcess.kill();
                res.destroy();
            });
        }

        ffmpegProcess.on('disconnect', () => ffmpegProcess.kill());
        ffmpegProcess.on('close', () => ffmpegProcess.kill());
        ffmpegProcess.on('exit', () => ffmpegProcess.kill());
        res.on('finish', () => ffmpegProcess.kill());
        res.on('close', () => ffmpegProcess.kill());
        ffmpegProcess.on('error', () => {
            ffmpegProcess.kill();
            res.destroy();
        });
    } catch (e) {
        res.destroy();
    }
}
