import libxmljs from "libxmljs";

export default async function(obj) {
    const htmlContent = await fetch(obj.url.href).then((r) => {
        return r.status === 200 ? r.text() : false
    }).catch(() => { return false });
    const htmlDoc = await libxmljs.parseHtmlAsync(htmlContent)
        .then((d) => { return d });
    const rawData = htmlDoc.find("//script[@type='application/ld+json']")[0];
    const json = JSON.parse(rawData.text());

    let fileMetadata = {
        title: json.video.name,
        author: json.author.name
    }

    return {
        urls: json.video.contentUrl,
        filenameAttributes: {
            service: "linkedin",
            id: obj.id,
            title: fileMetadata.title,
            author: fileMetadata.author,
            extension: "mp4"
        }
    }
}
