export type QueueItem = {
    id: string,
    type: "video" | "audio" | "mute" | "image" | "gif",
    filename: string,
    status: string,
    progress: number,
}
