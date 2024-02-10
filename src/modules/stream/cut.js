import { strict as assert } from 'node:assert';
import { spawn } from './shared.js';
import { path as ffprobe } from 'ffprobe-static';

function mapFormat(format) {
    if (format?.includes('webm'))
        return 'webm';

    if (format?.includes('mp4'))
        return 'mp4';

    throw new Error(`unknown format: ${format}`);
}

const close_enough = (a, b) => Math.abs(a - b) < 0.02;
const last = arr => arr[arr.length - 1];
const output = process => last(process.stdio);
const lerp = (a, b, α) => Number(a) + α * (b - a);

function getKeyframesAround(url, { start, end }) {
    start = Math.floor(start), end = Math.ceil(end);
    assert(end > start);

    const ε = 30;
    return new Promise((resolve, reject) => {
        let process;
        try {
            process = spawn(ffprobe, [
                '-loglevel', '-8',
                '-of', 'json',
                '-skip_frame', 'nokey',
                '-show_entries', [
                    'stream=duration,codec_name,bit_rate',
                    'format=bit_rate,format_name',
                    'frame=pts_time'
                ].join(':'),
                '-select_streams', 'v:0',
                '-read_intervals', Object.values({
                    startInterval: `${start}%+${ε}`,
                    endInterval: `${end - ε}%+${ε * 2}`
                }).join(','),
                url
            ]);

            const bufs = [];
            process.stdout.on('data', buf => bufs.push(buf))
            process.on('exit', (code) => {
                if (code !== 0) {
                    return reject('non-zero/unexpected return value');
                }

                const data = JSON.parse(Buffer.concat(bufs));

                if (!data?.streams?.[0]?.duration) {
                    return reject('could not get video duration');
                }

                if (Number(data?.streams[0]?.duration) < Number(end)) {
                    return reject(
                        'cut out of bounds: ' +
                        `(duration ${data?.streams[0]?.duration} < end ${start})`
                    )
                }

                const stream = data.streams[0];
                const out = {
                    keyframes: data.frames.map(f => f.pts_time),
                    codec: stream?.codec_name,
                    format: mapFormat(data.format?.format_name),
                    bitrate: data?.format?.bit_rate
                };

                if (!out.codec || !out.bitrate || !out.format) {
                    return reject('could not get stream info');
                }

                return resolve(out);
            });

            process.on('error', reject);
            process.stdout.on('error', reject);
        } catch {
            process.kill('SIGKILL');
        }
    })
}

async function getBoundingKeyframes(url, { start, end }) {
    const { keyframes, ...info } = await getKeyframesAround(url, { start, end });
    const afterStart = keyframes.find(k => Number(k) >= Number(start)),
           beforeEnd = keyframes.findLast(k => Number(k) <= Number(end));

    const afterStartNext = keyframes[keyframes.indexOf(afterStart) + 1];
    const beforeEndNext = keyframes[keyframes.indexOf(beforeEnd) + 1];

    if (!afterStartNext || !beforeEndNext)
        throw 'not enough keyframes'

    return {
        afterStart, beforeEnd,
        cleanCut: {
            start: close_enough(afterStart, start),
            end: close_enough(beforeEnd, end)
        },
        shifted: {
            /* we need to provide a timestamp that is little bit after the actual keyframe
             * this is due to the fact that ffmpeg's lossless cut actually cuts on the
             * "previous" keyframe, so if we supply the exact keyframe timestamp, it won't
             * line up and the start/end transcodes will not sync up with it */
            afterStart: lerp(afterStart, afterStartNext, 0.2),
            beforeEnd: lerp(beforeEnd, beforeEndNext, 0.2),
        },
        ...info
    };
}

function spawnStream(args, inputs = 0) {
    return spawn(
        'ffmpeg',
        [ '-loglevel', '-8', ...args, 'pipe:' + (inputs + 3) ],
        {
            stdio: [
                'inherit', 'inherit', 'inherit',
                ...Array(inputs).fill('pipe'),
                'pipe'
            ]
        }
    )
}

function makeStream(...args) {
    const process = spawnStream(...args);
    output(process).process = process;
    return output(process);
}

function transcode(url, from, to, { bitrate, format, codec, filter }) {
    return makeStream([
        '-ss', from,
        '-i', url,
        '-copyts',
        '-to', to,
        ...(filter ? ['-filter:v', filter] : []),
        '-an',
        '-b:v', (bitrate * 1.2).toFixed(6),
        '-f', format,
        '-movflags', 'frag_keyframe+empty_moov',
        '-vcodec', codec
    ]);
}

function cut(type, url, from, to, info) {
    let toggles;

    switch (type) {
        case 'audio':
            toggles = ['-vn'];
            break;
        case 'video':
            toggles = [ '-c:v', 'copy', '-an' ];
            from = info.shifted.afterStart;
            to = info.shifted.beforeEnd;
            break;
        default:
            throw `invalid cut type: ${type}`;
    }

    return makeStream([
        '-ss', from,
        '-i', url,
        '-copyts',
        '-to', to,
        '-f', info.format,
        '-movflags', 'frag_keyframe+empty_moov',
        ...toggles
    ]);
}

function mergeVideoOnly(streams, info) {
    let fd = 3;
    const input = streams.map(
        () => `file 'pipe:${++fd}'`
    ).join('\n')

    const args = [
        '-f', 'concat',
        '-safe', '0',
        '-protocol_whitelist', 'file,pipe',
        '-i', 'pipe:3',
        '-c', 'copy',
        '-movflags', 'frag_keyframe+empty_moov',
        '-f', info.format
    ];

    const process = spawnStream(args, fd - 2);
          process.stdio[3].write(input);
          process.stdio[3].end();

    return process;
}

function mergeAudioVideo(info) {
    return spawnStream([
        '-i', 'pipe:3',
        '-i', 'pipe:4',
        '-movflags', 'frag_keyframe+empty_moov',
        '-f', info.format,
        '-c', 'copy',
    ], 2);
}

export async function makeCut(url, { start, end }, audio) {
    let processes = [];

    try {
        const {
            afterStart, beforeEnd,
            cleanCut, ...info
        } = await getBoundingKeyframes(url, { start, end });

        let streams = [];
        if (!cleanCut.start) {
            streams.push(
                transcode(url, start, afterStart, {
                    filter: `select=not(eq(t\\,${afterStart}))`,
                    ...info
                })
            )
        }

        streams.push(cut('video', url, afterStart, beforeEnd, info))

        if (!cleanCut.end) {
            streams.push(
                transcode(url, beforeEnd, end, {
                    filter: 'select=not(eq(n\\,0))',
                    ...info
                })
            )
        }

        processes.push(...streams.map(s => s.process));

        if (audio) {
            audio = cut('audio', audio, start, end, info);
            processes.push(audio.process);
        }

        const videoMerge = mergeVideoOnly(streams, info);
        processes.push(videoMerge);

        for (let fd = 0; fd < streams.length; ++fd) {
            streams[fd].pipe(videoMerge.stdio[4 + fd]);
        }

        let finalMerge = videoMerge;
        if (audio) {
            finalMerge = mergeAudioVideo(info);
            const [,,, audioIn, videoIn] = finalMerge.stdio;
        
            output(videoMerge).pipe(videoIn);
            audio.pipe(audioIn);
        }

        return output(finalMerge);
    } catch {
        for (const process of processes)
            process.kill('SIGKILL');
    }
}