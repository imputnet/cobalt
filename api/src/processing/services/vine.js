export default async function(obj) {
    let post = await fetch(`https://archive.vine.co/posts/${obj.id}.json`)
                    .then(r => r.json())
                    .catch(() => {});

    if (!post) return { error: "fetch.empty" };

    if (post.videoUrl) return {
        urls: post.videoUrl.replace("http://", "https://"),
        filename: `vine_${obj.id}.mp4`,
        audioFilename: `vine_${obj.id}_audio`
    }

    return { error: "fetch.empty" }
}
