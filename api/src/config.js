const genericUserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36";
const supportedAudio = ["mp3", "ogg", "wav", "opus"];
const ffmpegArgs = {
    webm: ["-c:v", "copy", "-c:a", "copy"],
    mp4: ["-c:v", "copy", "-c:a", "copy", "-movflags", "faststart+frag_keyframe+empty_moov"],
    copy: ["-c:a", "copy"],
    audio: ["-ar", "48000", "-ac", "2", "-b:a", "320k"],
    m4a: ["-movflags", "frag_keyframe+empty_moov"],
    gif: ["-vf", "scale=-1:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse", "-loop", "0"]
}

const env = {
    apiURL: process.env.API_URL || '',
    apiPort: process.env.API_PORT || 9000,

    listenAddress: process.env.API_LISTEN_ADDRESS,
    freebindCIDR: process.platform === 'linux' && process.env.FREEBIND_CIDR,

    corsWildcard: process.env.CORS_WILDCARD !== '0',
    corsURL: process.env.CORS_URL,

    cookiePath: process.env.COOKIE_PATH,

    rateLimitWindow: (process.env.RATELIMIT_WINDOW && parseInt(process.env.RATELIMIT_WINDOW)) || 60,
    rateLimitMax: (process.env.RATELIMIT_MAX && parseInt(process.env.RATELIMIT_MAX)) || 20,

    durationLimit: (process.env.DURATION_LIMIT && parseInt(process.env.DURATION_LIMIT)) || 10800,
    streamLifespan: 90,

    processingPriority: process.platform !== 'win32'
        && process.env.PROCESSING_PRIORITY
        && parseInt(process.env.PROCESSING_PRIORITY),

    externalProxy: process.env.API_EXTERNAL_PROXY,
}

export {
    env,

    genericUserAgent,
    supportedAudio,
    ffmpegArgs,
}
