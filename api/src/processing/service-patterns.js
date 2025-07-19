export const testers = {
    "bilibili": pattern =>
        pattern.comId?.length <= 12 || pattern.comShortLink?.length <= 16
        || pattern.tvId?.length <= 24,

    "dailymotion": pattern => pattern.id?.length <= 32,

    "instagram": pattern =>
        pattern.postId?.length <= 48
        || pattern.shareId?.length <= 16
        || (pattern.username?.length <= 30 && pattern.storyId?.length <= 24),

    "loom": pattern =>
        pattern.id?.length <= 32,

    "ok": pattern =>
        pattern.id?.length <= 16,

    "pinterest": pattern =>
        pattern.id?.length <= 128 || pattern.shortLink?.length <= 32,

    "reddit": pattern =>
        pattern.id?.length <= 16 && !pattern.sub && !pattern.user
        || (pattern.sub?.length <= 22 && pattern.id?.length <= 16)
        || (pattern.user?.length <= 22 && pattern.id?.length <= 16)
        || (pattern.sub?.length <= 22 && pattern.shareId?.length <= 16)
        || (pattern.shortId?.length <= 16),

    "rutube": pattern =>
        (pattern.id?.length === 32 && pattern.key?.length <= 32) ||
        pattern.id?.length === 32 || pattern.yappyId?.length === 32,

    "soundcloud": pattern =>
        (pattern.author?.length <= 255 && pattern.song?.length <= 255)
        || pattern.shortLink?.length <= 32,

    "snapchat": pattern =>
        (pattern.username?.length <= 32 && (!pattern.storyId || pattern.storyId?.length <= 255))
        || pattern.spotlightId?.length <= 255
        || pattern.shortLink?.length <= 16,

    "streamable": pattern =>
        pattern.id?.length <= 6,

    "tiktok": pattern =>
        pattern.postId?.length <= 21 || pattern.shortLink?.length <= 21,

    "tumblr": pattern =>
        pattern.id?.length < 21
        || (pattern.id?.length < 21 && pattern.user?.length <= 32),

    "twitch": pattern =>
        pattern.channel && pattern.clip?.length <= 100,

    "twitter": pattern =>
        pattern.id?.length < 20,

    "vimeo": pattern =>
        pattern.id?.length <= 11
        && (!pattern.password || pattern.password.length < 16),

    "vk": pattern =>
        (pattern.ownerId?.length <= 10 && pattern.videoId?.length <= 10) ||
        (pattern.ownerId?.length <= 10 && pattern.videoId?.length <= 10 && pattern.videoId?.accessKey <= 18),

    "youtube": pattern =>
        pattern.id?.length <= 11,

    "facebook": pattern =>
        pattern.shortLink?.length <= 11
        || pattern.username?.length <= 30
        || pattern.caption?.length <= 255
        || pattern.id?.length <= 20 && !pattern.shareType
        || pattern.id?.length <= 20 && pattern.shareType?.length === 1,

    "bsky": pattern =>
        pattern.user?.length <= 128 && pattern.post?.length <= 128,

    "xiaohongshu": pattern =>
        pattern.id?.length <= 24 && pattern.token?.length <= 64
        || pattern.shareId?.length <= 24,

    "newgrounds": pattern =>
        pattern.id?.length <= 12 || pattern.audioId?.length <= 12,
}
