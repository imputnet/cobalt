// src/types.ts

export interface CobaltApiRequest {
    url: string;
    vQuality?: 'max' | '1080' | '720' | '480' | '360' | '240' | '144';
    filenamePattern?: 'classic' | 'pretty' | 'basic' | 'nerdy';
    isAudioOnly?: boolean;
    isNoTTWatermark?: boolean;
    isTTFullAudio?: boolean;
    dubLang?: boolean;
    disableMetadata?: boolean;
    localProcessing?: 'preferred' | 'required' | 'disabled';
    alwaysProxy?: boolean;
    downloadMode?: 'video' | 'audio' | 'mute';
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
    }
}

export interface QueuedItem {
    id: number;
    status: 'queued' | 'processing' | 'done' | 'error';
    response: CobaltResponse;
    progress?: number;
} 