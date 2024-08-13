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


export type FFmpegProgressStatus = "continue" | "end" | "unknown";
export type FFmpegProgressEvent = {
    status: FFmpegProgressStatus,
    frame?: number,
    fps?: number,
    total_size?: number,
    dup_frames?: number,
    drop_frames?: number,
    speed?: number,
    out_time_sec?: number,
}

export type FFmpegProgressCallback = (info: FFmpegProgressEvent) => void;
