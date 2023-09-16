export default function (inHost, inURL) {
    let host = String(inHost);
    let url = String(inURL);

    switch(host) {
        case "youtube":
            if (url.startsWith("https://youtube.com/live/") || url.startsWith("https://www.youtube.com/live/")) {
                url = url.split("?")[0].replace("www.", "");
                url = `https://youtube.com/watch?v=${url.replace("https://youtube.com/live/", "")}`
            }
            if (url.includes('youtube.com/shorts/')) {
                url = url.split('?')[0].replace('shorts/', 'watch?v=');
            }
            break;
        case "youtu":
            if (url.startsWith("https://youtu.be/")) {
                host = "youtube";
                url = `https://youtube.com/watch?v=${url.replace("https://youtu.be/", "")}`
            }
            break;
        case "vxtwitter":
        case "x":
            if (url.startsWith("https://x.com/")) {
                host = "twitter";
                url = url.replace("https://x.com/", "https://twitter.com/")
            }
            if (url.startsWith("https://vxtwitter.com/")) {
                host = "twitter";
                url = url.replace("https://vxtwitter.com/", "https://twitter.com/")
            }
            break;
        case "tumblr":
            if (!url.includes("blog/view")) {
                if (url.slice(-1) === '/') url = url.slice(0, -1);
                url = url.replace(url.split('/')[5], '')
            }
            break;
        case "twitch":
            if (url.includes('clips.twitch.tv')) {
                url = url.split('?')[0].replace('clips.twitch.tv/', 'twitch.tv/_/clip/');
            }
            break;
    }
    return {
        host: host,
        url: url
    }
}
