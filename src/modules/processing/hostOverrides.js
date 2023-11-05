export default function (inHost, inURL) {
    let host = String(inHost);
    let url = String(inURL);

    switch(host) {
        case "tumblr":
            if (!url.includes("blog/view")) {
                if (url.slice(-1) === '/') url = url.slice(0, -1);
                url = url.replace(url.split('/')[5], '')
            }
            break;
        case "twitch":
            if (url.startsWith("https://clips.twitch.tv")) {
                url = url.split('?')[0].replace('clips.twitch.tv/', 'twitch.tv/_/clip/');
            }
            break;
        case "vxtwitter":
        case "fixvx":
        case "fxtwitter":
        case "twittpr":
        case "fixupx":
        case "x":
            if (url.startsWith("https://vxtwitter.com/")) {
                host = "twitter";
                url = url.replace("https://vxtwitter.com/", "https://twitter.com/")
            }
            if (url.startsWith("https://fixvx.com/")) {
                host = "twitter";
                url = url.replace("https://fixvx.com/", "https://twitter.com/")
            }
            if (url.match(/^https:\/\/(d\.|dl\.|)(fxtwitter|twittpr|fixupx).com\//g)) {
                host = "twitter";
                url = url.replace(url.match(/^https:\/\/(d\.|dl\.|)(fxtwitter|twittpr|fixupx).com\//g)[0], "https://twitter.com/")
                if (url.endsWith(".mp4")) url = url.replace(".mp4", "")
                if (url.endsWith('.jpg')) url = url.replace(".jpg", "")
                if (url.startsWith("https://twitter.com/dl/")) url = url.replace("https://twitter.com/dl/", "https://twitter.com/")
                if (url.startsWith("https://twitter.com/dir/")) url = url.replace("https://twitter.com/dir/", "https://twitter.com/")
            }
            if (url.startsWith("https://x.com/")) {
                host = "twitter";
                url = url.replace("https://x.com/", "https://twitter.com/")
            }
            break;
        case "youtube":
            if (url.startsWith("https://youtube.com/live/")) {
                url = `https://youtube.com/watch?v=${url.split("?")[0].replace("https://youtube.com/live/", "")}`
            }
            if (url.startsWith("https://youtube.com/shorts/")) {
                url = url.split('?')[0].replace('shorts/', 'watch?v=');
            }
            break;
        case "youtu":
            if (url.startsWith("https://youtu.be/")) {
                host = "youtube";
                url = `https://youtube.com/watch?v=${url.replace("https://youtu.be/", "")}`
            }
            break;
    }
    return {
        host: host,
        url: url
    }
}
