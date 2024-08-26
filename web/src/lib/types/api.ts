enum CobaltResponseType {
    Error = 'error',
    Picker = 'picker',
    Redirect = 'redirect',
    Stream = 'stream',
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
}

type CobaltPickerResponse = {
    status: CobaltResponseType.Picker
    picker: {
        type: 'photo' | 'video' | 'gif',
        url: string,
        thumb?: string,
    }[];
    audio?: string,
};

type CobaltRedirectResponse = {
    status: CobaltResponseType.Redirect,
} & CobaltPartialURLResponse;

type CobaltStreamResponse = {
    status: CobaltResponseType.Stream,
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

export type CobaltAPIResponse = CobaltErrorResponse
                            | CobaltPickerResponse
                            | CobaltRedirectResponse
                            | CobaltStreamResponse;
