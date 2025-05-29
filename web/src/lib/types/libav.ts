export type FileInfo = {
    type?: string,
    format?: string,
}

export type RenderParams = {
    files: File[],
    output: FileInfo,
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
