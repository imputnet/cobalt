export var testers = {
    "bilibili": (patternMatch) => patternMatch["id"] && patternMatch["id"].length >= 12,

    "reddit": (patternMatch) => patternMatch["sub"] && patternMatch["id"] && patternMatch["title"] &&
    patternMatch["sub"].length <= 22 && patternMatch["id"].length <= 10 && patternMatch["title"].length <= 96,

    "twitter": (patternMatch) => patternMatch["id"] && patternMatch["id"].length < 20,

    "vk": (patternMatch) => patternMatch["userId"] && patternMatch["videoId"] &&
    patternMatch["userId"].length <= 10 && patternMatch["videoId"].length == 9,

    "youtube": (patternMatch) => patternMatch["id"] && patternMatch["id"].length >= 11,

    "tiktok": (patternMatch) => (patternMatch["user"] && patternMatch["postId"] && patternMatch["postId"].length <= 21) ||
    (patternMatch["id"] && patternMatch["id"].length <= 13),

    "douyin": (patternMatch) => (patternMatch["postId"] && patternMatch["postId"].length <= 21) ||
    (patternMatch["id"] && patternMatch["id"].length <= 13),

    "instagram": (patternMatch) => patternMatch["id"] && patternMatch["id"].length == 11
};