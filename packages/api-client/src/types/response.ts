import { CobaltAPIErrorCode } from "./errors";

export enum CobaltResponseType {
    Error = 'error',
    Picker = 'picker',
    Redirect = 'redirect',
    Tunnel = 'tunnel',
}

export type CobaltErrorResponse = {
    status: CobaltResponseType.Error,
    error: {
        code: CobaltAPIErrorCode,
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

export type CobaltSession = {
    token: string,
    exp: number,
}

export type CobaltServerInfo = {
    cobalt: {
        version: string,
        url: string,
        startTime: string,
        durationLimit: number,
        services: string[]
    },
    git: {
        branch: string,
        commit: string,
        remote: string,
    }
}

export type CobaltSessionResponse = CobaltSession | CobaltErrorResponse;
export type CobaltServerInfoResponse = CobaltServerInfo | CobaltErrorResponse;

export type CobaltResponse = CobaltErrorResponse
                           | CobaltPickerResponse
                           | CobaltRedirectResponse
                           | CobaltTunnelResponse;
