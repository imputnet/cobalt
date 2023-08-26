export const testers = {
    "twitter": (patternMatch) => (patternMatch["id"] && patternMatch["id"].length < 20)
        || (patternMatch["spaceId"] && patternMatch["spaceId"].length === 13),

    "vk": (patternMatch) => (patternMatch["userId"] && patternMatch["videoId"]
        && patternMatch["userId"].length <= 10 && patternMatch["videoId"].length <= 10),

    "bilibili": (patternMatch) => (patternMatch["id"] && patternMatch["id"].length <= 12),

    "youtube": (patternMatch) => (patternMatch["id"] && patternMatch["id"].length <= 11),

    "reddit": (patternMatch) => (patternMatch["sub"] && patternMatch["id"] && patternMatch["title"]
        && patternMatch["sub"].length <= 22 && patternMatch["id"].length <= 10 && patternMatch["title"].length <= 96),

    "tiktok": (patternMatch) => ((patternMatch["user"] && patternMatch["postId"] && patternMatch["postId"].length <= 21)
        || (patternMatch["id"] && patternMatch["id"].length <= 13)),

    "douyin": (patternMatch) => ((patternMatch["postId"] && patternMatch["postId"].length <= 21)
        || (patternMatch["id"] && patternMatch["id"].length <= 13)),

    "tumblr": (patternMatch) => ((patternMatch["id"] && patternMatch["id"].length < 21)
        || (patternMatch["id"] && patternMatch["id"].length < 21 && patternMatch["user"] && patternMatch["user"].length <= 32)),

    "vimeo": (patternMatch) => ((patternMatch["id"] && patternMatch["id"].length <= 11)),
    
    "soundcloud": (patternMatch) => (patternMatch["author"]?.length <= 25 && patternMatch["song"]?.length <= 255)
                                    || (patternMatch["shortLink"] && patternMatch["shortLink"].length <= 32),

    "instagram": (patternMatch) => (patternMatch.postId?.length <= 12) 
                                    || (patternMatch.username?.length <= 30 && patternMatch.storyId?.length <= 24),
    
    "vine": (patternMatch) => (patternMatch["id"] && patternMatch["id"].length <= 12),
    
    "pinterest": (patternMatch) => (patternMatch["id"] && patternMatch["id"].length <= 128),

    "streamable": (patternMatch) => (patternMatch["id"] && patternMatch["id"].length === 6)
}
