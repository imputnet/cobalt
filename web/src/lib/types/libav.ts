export type InputFileKind = "video" | "audio";

export type FileInfo = {
    type?: string | null,
    kind: InputFileKind,
    extension: string,
}

export type RenderParams = {
    blob: Blob,
    output?: FileInfo,
    args: string[],
}

