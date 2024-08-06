enum CobaltResponseType {
    Error = 'error',
    Picker = 'picker',
    Redirect = 'redirect',
    Stream = 'stream',
}

type CobaltErrorResponse = {
    status: CobaltResponseType.Error,
    error: {
        code: string,
        context?: {
            service?: string,
            limit?: number,
        }
    }
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

export type CobaltAPIResponse = CobaltErrorResponse
                            | CobaltPickerResponse
                            | CobaltRedirectResponse
                            | CobaltStreamResponse;
