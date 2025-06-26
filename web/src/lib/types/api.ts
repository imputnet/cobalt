import type { CobaltSettings } from "$lib/types/settings";

enum CobaltResponseType {
    Error = 'error',
    Picker = 'picker',
    Redirect = 'redirect',
    Tunnel = 'tunnel',
    LocalProcessing = 'local-processing',
}

export type CobaltErrorResponse = {
    status: CobaltResponseType.Error,
    error: {
        code: string,
        context?: {
            service?: string,
            limit?: number,
        }
    },
};

type CobaltPartialURLResponse = {
    url: string,
    filename: string,
}

type CobaltPickerResponse = {
    status: CobaltResponseType.Picker
    picker: {
        type: 'photo' | 'video' | 'gif',
        url: string,
        thumb?: string,
    }[];
    audio?: string,
    audioFilename?: string,
};

type CobaltRedirectResponse = {
    status: CobaltResponseType.Redirect,
} & CobaltPartialURLResponse;

type CobaltTunnelResponse = {
    status: CobaltResponseType.Tunnel,
} & CobaltPartialURLResponse;

export const CobaltFileMetadataKeys = [
    'album',
    'composer',
    'genre',
    'copyright',
    'title',
    'artist',
    'album_artist',
    'track',
    'date',
    'sublanguage',
];

export type CobaltFileMetadata = Record<
    typeof CobaltFileMetadataKeys[number], string | undefined
>;

export type CobaltLocalProcessingType = 'merge' | 'mute' | 'audio' | 'gif' | 'remux' | 'proxy';

export type CobaltLocalProcessingResponse = {
    status: CobaltResponseType.LocalProcessing,

    type: CobaltLocalProcessingType,
    service: string,
    tunnel: string[],

    output: {
        type: string, // mimetype
        filename: string,
        metadata?: CobaltFileMetadata,
        subtitles?: boolean,
    },

    audio?: {
        copy: boolean,
        format: string,
        bitrate: string,
        cover?: boolean,
        cropCover?: boolean,
    },

    isHLS?: boolean,
}

export type CobaltFileUrlType = "redirect" | "tunnel";

export type CobaltSession = {
    token: string,
    exp: number,
}

export type CobaltServerInfo = {
    cobalt: {
        version: string,
        url: string,
        startTime: string,
        turnstileSitekey?: string,
        services: string[]
    },
    git: {
        branch: string,
        commit: string,
        remote: string,
    }
}

// TODO: strict partial
// this allows for extra properties, which is not ideal,
// but i couldn't figure out how to make a strict partial :(
export type CobaltSaveRequestBody =
    { url: string } & Partial<Omit<CobaltSettings['save'], 'savingMethod'>>;

export type CobaltSessionResponse = CobaltSession | CobaltErrorResponse;
export type CobaltServerInfoResponse = CobaltServerInfo | CobaltErrorResponse;

export type CobaltAPIResponse = CobaltErrorResponse
                              | CobaltPickerResponse
                              | CobaltRedirectResponse
                              | CobaltTunnelResponse
                              | CobaltLocalProcessingResponse;
