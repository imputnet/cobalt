import { genericUserAgent } from "../../config.js";

export default async function({ id }) {
    const req = await fetch(`https://coub.com/view/${id}/`, {
        method: "GET",
        headers: {
            "user-agent": genericUserAgent,
        }
    })
    .then(request => request.text())
    .catch(() => {});
    
    if (!req) return { error: 'ErrorEmptyDownload' };
    const infoScript = req?.split("<script id='coubPageCoubJson' type='text/json'>")[1].split('</script>')[0].replace('\n','');
    const infoJSON = JSON.parse(infoScript);
    const downloadLinks = infoJSON?.file_versions.html5;
    const videoUrl = downloadLinks?.video.high.url;
    const audioUrl = downloadLinks?.audio.high.url;
    
    if (videoUrl?.includes('.mp4') && audioUrl?.includes('.mp3')) {
        return {
            urls: [
                videoUrl,
                audioUrl
            ],
            filename: `coub_${id}.mp4`,
            audioFilename: `coub_${id}_audio`,
            filenameAttributes: {
                service: 'coub',
                id: id,
                title: infoJSON?.title,
                author: infoJSON?.channel.title,
                extension: 'mp4'
            },
        }
    }

    return { error: 'ErrorEmptyDownload' }
}
