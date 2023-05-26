import got from "got";

export default async function(obj) {
    // i hate this implementation but fetch doesn't work here for some reason (i personally blame facebook)
    let html;
    try {
        html = await got.get(`https://www.instagram.com/p/${obj.id}/`)
        html.on('error', () => {
            html = false;
        });
        html = html ? html.body : false;
    } catch (e) {
        html = false;
    }

    if (!html) return { error: 'ErrorCouldntFetch' };
    if (!html.includes('application/ld+json')) return { error: 'ErrorEmptyDownload' };

    let single, multiple = [], postInfo = JSON.parse(html.split('script type="application/ld+json"')[1].split('">')[1].split('</script>')[0]);

    if (postInfo.video.length > 1) {
        for (let i in postInfo.video) { multiple.push({type: "video", thumb: postInfo.video[i]["thumbnailUrl"], url: postInfo.video[i]["contentUrl"]}) }
    } else if (postInfo.video.length === 1) {
        single = postInfo.video[0]["contentUrl"]
    } else {
        return { error: 'ErrorEmptyDownload' }
    }

    if (single) {
        return { urls: single, filename: `instagram_${obj.id}.mp4`, audioFilename: `instagram_${obj.id}_audio` }
    } else if (multiple) {
        return { picker: multiple }
    } else {
        return { error: 'ErrorEmptyDownload' }
    }
}
