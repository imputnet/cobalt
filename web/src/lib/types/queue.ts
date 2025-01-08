type ProcessingStep = "mux" | "mux_hls" | "encode";
type ProcessingPreset = "mp4" | "webm" | "copy";
type ProcessingState = "completed" | "failed" | "canceled" | "waiting" | "downloading" | "muxing" | "converting";
type ProcessingType = "video" | "video_mute" | "audio" | "audio_convert" | "image" | "gif";
type QueueFileType = "video" | "audio" | "image" | "gif";

export type ProcessingStepItem = {
    type: ProcessingStep,
    preset?: ProcessingPreset,
}

export type QueueFile = {
    type: QueueFileType,
    url: string,
}

export type QueueItem = {
    id: string,
    status: ProcessingState,
    type: ProcessingType,
    filename: string,
    files: QueueFile[],
    processingSteps: ProcessingStepItem[],
}

export type OngoingQueueItem = {
    id: string,
    currentStep?: ProcessingStep,
    size?: {
        expected: number,
        current: number,
    },
    speed?: number,
}
