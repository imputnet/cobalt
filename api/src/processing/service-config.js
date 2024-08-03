import UrlPattern from "url-pattern";

export const audioIgnore = ["vk", "ok", "loom"];
export const hlsExceptions = ["dailymotion", "vimeo", "rutube"];

export const services = {
    bilibili: {
        enabled: true,
        patterns: [
            "video/:comId",
            "_shortLink/:comShortLink",
            "_tv/:lang/video/:tvId",
            "_tv/video/:tvId"
        ],
        subdomains: ["m"],
    },
    dailymotion: {
        enabled: true,
        patterns: ["video/:id"],
    },
    facebook: {
        enabled: true,
        patterns: [
            "_shortLink/:shortLink",
            ":username/videos/:caption/:id",
            ":username/videos/:id",
            "reel/:id",
            "share/:shareType/:id"
        ],
        subdomains: ["web"],
        altDomains: ["fb.watch"],
    },
    instagram: {
        enabled: true,
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
        enabled: true,
        patterns: ["share/:id"],
    },
    ok: {
        enabled: true,
        patterns: [
            "video/:id",
            "videoembed/:id"
        ],
        tld: "ru",
    },
    pinterest: {
        enabled: true,
        patterns: [
            "pin/:id",
            "pin/:id/:garbage",
            "url_shortener/:shortLink"
        ],
    },
    reddit: {
        enabled: true,
        patterns: [
            "r/:sub/comments/:id/:title",
            "user/:user/comments/:id/:title"
        ],
        subdomains: "*",
    },
    rutube: {
        enabled: true,
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
        enabled: true,
        patterns: [
            ":shortLink",
            "spotlight/:spotlightId",
            "add/:username/:storyId",
            "u/:username/:storyId",
            "add/:username",
            "u/:username"
        ],
        subdomains: ["t", "story"],
    },
    soundcloud: {
        enabled: true,
        patterns: [
            ":author/:song/s-:accessKey",
            ":author/:song",
            ":shortLink"
        ],
        subdomains: ["on", "m"],
    },
    streamable: {
        enabled: true,
        patterns: [
            ":id",
            "o/:id",
            "e/:id",
            "s/:id"
        ],
    },
    tiktok: {
        enabled: true,
        patterns: [
            ":user/video/:postId",
            ":id",
            "t/:id",
            ":user/photo/:postId",
            "v/:id.html"
        ],
        subdomains: ["vt", "vm", "m"],
    },
    tumblr: {
        enabled: true,
        patterns: [
            "post/:id",
            "blog/view/:user/:id",
            ":user/:id",
            ":user/:id/:trackingId"
        ],
        subdomains: "*",
    },
    twitch: {
        enabled: true,
        patterns: [":channel/clip/:clip"],
        tld: "tv",
    },
    twitter: {
        enabled: true,
        patterns: [
            ":user/status/:id",
            ":user/status/:id/video/:index",
            ":user/status/:id/photo/:index",
            ":user/status/:id/mediaviewer",
            ":user/status/:id/mediaViewer"
        ],
        subdomains: ["mobile"],
        altDomains: ["x.com", "vxtwitter.com", "fixvx.com"],
    },
    vine: {
        enabled: true,
        patterns: ["v/:id"],
        tld: "co",
    },
    vimeo: {
        enabled: true,
        patterns: [
            ":id",
            "video/:id",
            ":id/:password",
            "/channels/:user/:id"
        ],
        subdomains: ["player"],
        bestAudio: "mp3",
    },
    vk: {
        enabled: true,
        patterns: [
            "video:userId_:videoId",
            "clip:userId_:videoId",
            "clips:duplicate?z=clip:userId_:videoId"
        ],
        subdomains: ["m"],
    },
    youtube: {
        enabled: true,
        patterns: [
            "watch?v=:id",
            "embed/:id",
            "watch/:id"
        ],
        subdomains: ["music", "m"],
        bestAudio: "opus",
    }
}

Object.values(services).forEach(service => {
    service.patterns = service.patterns.map(
        pattern => new UrlPattern(pattern, {
            segmentValueCharset: UrlPattern.defaultOptions.segmentValueCharset + '@\\.'
        })
    )
})
