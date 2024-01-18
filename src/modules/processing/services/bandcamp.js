import libxmljs from "libxmljs";

export default async function(obj) {
    const htmlContent = await fetch(obj.url.href).then((r) => {
        return r.status === 200 ? r.text() : false
    }).catch(() => { return false });
    const htmlDoc = await libxmljs.parseHtmlAsync(htmlContent)
        .then((d) => { return d });
    const rawData = htmlDoc.find("//script[@data-tralbum]")[0];
    const json = JSON.parse(rawData.getAttribute("data-tralbum").value());

    let fileMetadata = {
        title: json.current.title,
        artist: json.artist
    }

    return {
        urls: json.trackinfo[0].file["mp3-128"],
        filenameAttributes: {
            service: "bandcamp",
            id: json.trackinfo[0].id,
            title: fileMetadata.title,
            artist: fileMetadata.artist,
            extension: "mp3"
        },
        isMp3: true,
        fileMetadata
    }
}
