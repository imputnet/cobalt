// src/types.ts

export interface CobaltApiRequest {
    url: string;
    // 修复：按照官方API schema的格式
    videoQuality?: 'max' | '4320' | '2160' | '1440' | '1080' | '720' | '480' | '360' | '240' | '144';
    filenameStyle?: 'classic' | 'pretty' | 'basic' | 'nerdy';
    disableMetadata?: boolean;
    localProcessing?: 'disabled' | 'preferred' | 'forced';
    alwaysProxy?: boolean;
    downloadMode?: 'auto' | 'audio' | 'mute';
    audioFormat?: 'best' | 'mp3' | 'ogg' | 'wav' | 'opus';
    subtitleLang?: string;
    audioBitrate?: '320' | '256' | '128' | '96' | '64' | '8';
    tiktokFullAudio?: boolean;
    youtubeDubLang?: string;
    youtubeBetterAudio?: boolean;
    youtubeVideoCodec?: 'h264' | 'av1' | 'vp9';
    youtubeVideoContainer?: 'auto' | 'mp4' | 'webm' | 'mkv';
    youtubeHLS?: boolean;
    allowH265?: boolean;
    convertGif?: boolean;
}

export interface CobaltResponse {
    status: 'stream' | 'success' | 'redirect' | 'error' | 'local-processing' | 'picker' | 'tunnel';
    text?: string;
    url?: string;
    videoUrl?: string;
    audioUrl?: string;
    filename?: string;
    picker?: {
        type: string;
        options: any[];
    } | any[];
}

export interface QueuedItem {
    id: number;
    status: 'queued' | 'processing' | 'done' | 'error';
    response: CobaltResponse;
    progress?: number;
    currentStep?: string; // 当前处理步骤描述
} 