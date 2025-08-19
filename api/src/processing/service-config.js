import UrlPattern from "url-pattern";

export const audioIgnore = new Set(["vk", "ok", "loom"]);
export const hlsExceptions = new Set(["dailymotion", "vimeo", "rutube", "bsky", "youtube"]);

export const services = {
    bilibili: {
        patterns: [
            "video/:comId",
            "video/:comId?p=:partId",
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
            "p/:postId",
            "tv/:postId",
            "reel/:postId",
            "reels/:postId",
            "stories/:username/:storyId",

            /*
                share & username links use the same url pattern,
                so we test the share pattern first, cuz id type is different.
                however, if someone has the "share" username and the user
                somehow gets a link of this ancient style, it's joever.
            */

            "share/:shareId",
            "share/p/:shareId",
            "share/reel/:shareId",

            ":username/p/:postId",
            ":username/reel/:postId",
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
        patterns: [
            "portal/view/:id",
            "audio/listen/:audioId",
        ]
    },
    reddit: {
        patterns: [
            "comments/:id",

            "r/:sub/comments/:id",
            "r/:sub/comments/:id/:title",
            "r/:sub/comments/:id/comment/:commentId",

            "user/:user/comments/:id",
            "user/:user/comments/:id/:title",
            "user/:user/comments/:id/comment/:commentId",

            "r/u_:user/comments/:id",
            "r/u_:user/comments/:id/:title",
            "r/u_:user/comments/:id/comment/:commentId",

            "r/:sub/s/:shareId",

            "video/:shortId",
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
            "o/:spotlightId",
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
            "i18n/share/video/:postId",
            ":shortLink",
            "t/:shortLink",
            ":user/photo/:postId",
            "v/:postId.html"
        ],
        subdomains: ["vt", "vm", "m", "t"],
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
        subdomains: ["clips", "www", "m"],
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
            "/channels/:user/:id",
            "groups/:groupId/videos/:id"
        ],
        subdomains: ["player"],
    },
    vk: {
        patterns: [
            "video:ownerId_:videoId",
            "clip:ownerId_:videoId",
            "video:ownerId_:videoId_:accessKey",
            "clip:ownerId_:videoId_:accessKey",

            // links with a duplicate author id and/or zipper query param
            "clips:duplicateId",
            "videos:duplicateId",
            "search/video"
        ],
        subdomains: ["m"],
        altDomains: ["vkvideo.ru", "vk.ru"],
    },
    xiaohongshu: {
        patterns: [
            "explore/:id?xsec_token=:token",
            "discovery/item/:id?xsec_token=:token",
            ":shareType/:shareId",
        ],
        altDomains: ["xhslink.com"],
    },
    youtube: {
        patterns: [
            "watch?v=:id",
            "embed/:id",
            "watch/:id",
            "v/:id"
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
