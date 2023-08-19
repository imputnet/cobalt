export default async function(obj) {
    const video = await fetch(`https://api.streamable.com/videos/${obj.id}`)
        .then((r) => {
            if (r.status === 404)
                return undefined;
            else
                return r.json(); 
        }).catch(() => { return false });

    if (video === undefined) return { error: 'ErrorEmptyDownload' } ;
    else if (!video) return { error: 'ErrorCouldntFetch' };

    let best;
    if (obj.isAudioOnly || obj.quality === "max" || obj.quality >= "720") // audio seems to be compressed on the mp4-mobile version so isAudioOnly only uses the higest quality
        best = video.files.mp4 ?? video.files['mp4-mobile'];
    else
        best = video.files['mp4-mobile'] ?? video.files.mp4;

    if (best) return { urls: best.url, filename: `streamable_${obj.id}_${best.width}x${best.height}.mp4`, audioFilename: `streamable_${obj.id}_audio` };
    else return { error: 'ErrorEmptyDownload' }
}
