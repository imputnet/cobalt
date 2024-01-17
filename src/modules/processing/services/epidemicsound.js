export default async function(obj) {
    let json = await fetch(`https://www.epidemicsound.com/json/track/${obj.id}`).then((r) => {
        return r.status === 200 ? r.json() : false
    }).catch(() => { return false });

    let fileMetadata = {
        title: json.title,
        artist: (json.creatives.mainArtists || []).map(artist => artist.name).join(", ")
    }

    return {
        urls: json.stems.full.lqMp3Url,
        filenameAttributes: {
            service: "epidemicsound",
            id: json.id,
            title: fileMetadata.title,
            author: fileMetadata.artist
        },
        isMp3: true,
        fileMetadata
    }
}
