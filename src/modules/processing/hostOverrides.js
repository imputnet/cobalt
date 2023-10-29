export default function (inHost, inURL) {
    let host = String(inHost);
    let url = String(inURL);

    switch(host) {
        case "reddittorjg6rue252oqsxryoxengawnmo46qy4kyii5wtqnwfj4ooad":
            if (url.startsWith("https://reddittorjg6rue252oqsxryoxengawnmo46qy4kyii5wtqnwfj4ooad.onion/")) {
                host = "reddit";
                url = url.replace("https://reddittorjg6rue252oqsxryoxengawnmo46qy4kyii5wtqnwfj4ooad.onion/", "https://reddit.com/")
            }
            break;
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
        case "twitter3e4tixl4xyajtrzo62zg5vztmjuricljdp2c5kshju4avyoid":
            if (url.startsWith("https://vxtwitter.com/")) {
                host = "twitter";
                url = url.replace("https://vxtwitter.com/", "https://twitter.com/")
            }
            if (url.startsWith("https://fixvx.com/")) {
                host = "twitter";
                url = url.replace("https://fixvx.com/", "https://twitter.com/")
            }
            if (url.startsWith("https://fxtwitter.com/")) {
                host = "twitter";
                url = url.replace("https://fxtwitter.com/", "https://twitter.com/")
            }
            if (url.startsWith("https://d.fxtwitter.com/")) {
                host = "twitter";
                url = url.replace("https://d.fxtwitter.com/", "https://twitter.com/")
            }
            if (url.startsWith("https://twittpr.com/")) {
                host = "twitter";
                url = url.replace("https://twittpr.com/", "https://twitter.com/")
            }
            if (url.startsWith("https://d.twittpr.com/")) {
                host = "twitter";
                url = url.replace("https://d.twittpr.com/", "https://twitter.com/")
            }
            if (url.startsWith("https://fixupx.com/")) {
                host = "twitter";
                url = url.replace("https://fixupx.com/", "https://twitter.com/")
            }
            if (url.startsWith("https://d.fixupx.com/")) {
                host = "twitter";
                url = url.replace("https://d.fixupx.com/", "https://twitter.com/")
            }
            if (url.startsWith("https://x.com/")) {
                host = "twitter";
                url = url.replace("https://x.com/", "https://twitter.com/")
            }
            if (url.startsWith("https://twitter3e4tixl4xyajtrzo62zg5vztmjuricljdp2c5kshju4avyoid.onion/")) {
                host = "twitter";
                url = url.replace("https://twitter3e4tixl4xyajtrzo62zg5vztmjuricljdp2c5kshju4avyoid.onion/", "https://twitter.com/")
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
