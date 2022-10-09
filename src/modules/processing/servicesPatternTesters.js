export const testers = {
    "twitter": (patternMatch) => (patternMatch["id"] && patternMatch["id"].length < 20),

    "vk": (patternMatch) => (patternMatch["userId"] && patternMatch["videoId"] &&
        patternMatch["userId"].length <= 10 && patternMatch["videoId"].length == 9),

    "bilibili": (patternMatch) => (patternMatch["id"] && patternMatch["id"].length >= 12),

    "youtube": (patternMatch) => (patternMatch["id"] && patternMatch["id"].length >= 11),

    "reddit": (patternMatch) => (patternMatch["sub"] && patternMatch["id"] && patternMatch["title"] &&
        patternMatch["sub"].length <= 22 && patternMatch["id"].length <= 10 && patternMatch["title"].length <= 96),

    "tiktok": (patternMatch) => ((patternMatch["user"] && patternMatch["postId"] && patternMatch["postId"].length <= 21) ||
        (patternMatch["id"] && patternMatch["id"].length <= 13)),

    "douyin": (patternMatch) => ((patternMatch["postId"] && patternMatch["postId"].length <= 21) ||
        (patternMatch["id"] && patternMatch["id"].length <= 13)),

    "tumblr": (patternMatch) => ((patternMatch["id"] && patternMatch["id"].length < 21) ||
        (patternMatch["id"] && patternMatch["id"].length < 21 && patternMatch["user"] && patternMatch["user"].length <= 32)),

    "vimeo": (patternMatch) => ((patternMatch["id"] && patternMatch["id"].length <= 11)),
    
    "soundcloud": (patternMatch) => ((patternMatch["author"] && patternMatch["song"] && (patternMatch["author"].length + patternMatch["song"].length) <= 96) ||
        (patternMatch["shortLink"] && patternMatch["shortLink"].length <= 32))
};