async function a(id) {
    const req = await fetch(`https://coub.com/view/${id}/`, {
        method: "GET",
        headers: {
            "user-agent": "firefox",
        }
    })
    .then(request => request.text())
    .catch(() => {return {error:'ClickToCopy'}});
    
    if (!req) return { error: 'ErrorEmptyDownload' };
    const infoScript = req?.split('{"flag":')[1]
    const downloadLinks = infoScript?.split('"html5":')[1].split(',"mobile"')[0];
    const videoUrl = downloadLinks?.split('"https://')[1].split('"')[0];
    const audioUrl = downloadLinks?.split('"https://')[3].split('"')[0];
    
    if (videoUrl?.includes('.mp4') && audioUrl?.includes('.mp3')) {
        return {
            urls: [
                'https://' + videoUrl,
                'https://' + audioUrl
            ],
            filename: `coub_${id}.mp4`,
            audioFilename: `coub_${id}_audio`
        }
    }

    return { error: 'ErrorEmptyDownload' }
}

a("dhxy").then(console.log)