import UrlPattern from "url-pattern";

export const audioIgnore = ["vk", "ok", "loom"];
export const hlsExceptions = ["dailymotion", "vimeo", "rutube", "bsky", "youtube"];

export const services = {
    bilibili: {
        patterns: [
            "video/:comId",
            "_shortLink/:comShortLink",
            "_tv/:lang/video/:tvId",
            "_tv/video/:tvId"
        ],
        subdomains: ["m"],
    },
    bsky: {
        patterns: [
            "profile/:user/post/:post"
        ],
        tld: "app",
    },
    dailymotion: {
        patterns: ["video/:id"],
    },
    facebook: {
        patterns: [
            "_shortLink/:shortLink",
            ":username/videos/:caption/:id",
            ":username/videos/:id",
            "reel/:id",
            "share/:shareType/:id"
        ],
        subdomains: ["web", "m"],
        altDomains: ["fb.watch"],
    },
    instagram: {
        patterns: [
            "reels/:postId",
            ":username/reel/:postId",
            "reel/:postId",
            "p/:postId",
            ":username/p/:postId",
            "tv/:postId",
            "stories/:username/:storyId"
        ],
        altDomains: ["ddinstagram.com"],
    },
    loom: {
        patterns: ["share/:id", "embed/:id"],
    },
    ok: {
        patterns: [
            "video/:id",
            "videoembed/:id"
        ],
        tld: "ru",
    },
    pinterest: {
        patterns: [
            "pin/:id",
            "pin/:id/:garbage",
            "url_shortener/:shortLink"
        ],
    },
    newgrounds: {
        patterns: [":type/:method/:id"]
    },
    reddit: {
        patterns: [
            "r/:sub/comments/:id/:title",
            "user/:user/comments/:id/:title"
        ],
        subdomains: "*",
    },
    rutube: {
        patterns: [
            "video/:id",
            "play/embed/:id",
            "shorts/:id",
            "yappy/:yappyId",
            "video/private/:id?p=:key",
            "video/private/:id"
        ],
        tld: "ru",
    },
    snapchat: {
        patterns: [
            ":shortLink",
            "spotlight/:spotlightId",
            "add/:username/:storyId",
            "u/:username/:storyId",
            "add/:username",
            "u/:username",
            "t/:shortLink",
        ],
        subdomains: ["t", "story"],
    },
    soundcloud: {
        patterns: [
            ":author/:song/s-:accessKey",
            ":author/:song",
            ":shortLink"
        ],
        subdomains: ["on", "m"],
    },
    streamable: {
        patterns: [
            ":id",
            "o/:id",
            "e/:id",
            "s/:id"
        ],
    },
    tiktok: {
        patterns: [
            ":user/video/:postId",
            ":shortLink",
            "t/:shortLink",
            ":user/photo/:postId",
            "v/:postId.html"
        ],
        subdomains: ["vt", "vm", "m"],
    },
    tumblr: {
        patterns: [
            "post/:id",
            "blog/view/:user/:id",
            ":user/:id",
            ":user/:id/:trackingId"
        ],
        subdomains: "*",
    },
    twitch: {
        patterns: [":channel/clip/:clip"],
        tld: "tv",
    },
    twitter: {
        patterns: [
            ":user/status/:id",
            ":user/status/:id/video/:index",
            ":user/status/:id/photo/:index",
            ":user/status/:id/mediaviewer",
            ":user/status/:id/mediaViewer",
            "i/bookmarks?post_id=:id"
        ],
        subdomains: ["mobile"],
        altDomains: ["x.com", "vxtwitter.com", "fixvx.com"],
    },
    vimeo: {
        patterns: [
            ":id",
            "video/:id",
            ":id/:password",
            "/channels/:user/:id"
        ],
        subdomains: ["player"],
    },
    vk: {
        patterns: [
            "video:ownerId_:videoId",
            "clip:ownerId_:videoId",
            "clips:duplicate?z=clip:ownerId_:videoId",
            "videos:duplicate?z=video:ownerId_:videoId",
            "video:ownerId_:videoId_:accessKey",
            "clip:ownerId_:videoId_:accessKey",
            "clips:duplicate?z=clip:ownerId_:videoId_:accessKey",
            "videos:duplicate?z=video:ownerId_:videoId_:accessKey"
        ],
        subdomains: ["m"],
        altDomains: ["vkvideo.ru", "vk.ru"],
    },
    youtube: {
        patterns: [
            "watch?v=:id",
            "embed/:id",
            "watch/:id"
        ],
        subdomains: ["music", "m"],
    }
}

Object.values(services).forEach(service => {
    service.patterns = service.patterns.map(
        pattern => new UrlPattern(pattern, {
            segmentValueCharset: UrlPattern.defaultOptions.segmentValueCharset + '@\\.:'
        })
    )
})
