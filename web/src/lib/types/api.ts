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

type CobaltPartialImagesPickerResponse = {
    pickerType: 'images',
    picker: CobaltPartialURLResponse[],
}

type CobaltPartialVariousPickerResponse = {
    pickerType: 'various',
    picker: {
        type: 'photo' | 'video',
        url: string,
        thumb: string,
    }[];
}

type CobaltPickerResponse = {
    status: CobaltResponseType.Picker
    audio: string | false,
} & (CobaltPartialImagesPickerResponse | CobaltPartialVariousPickerResponse);

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
