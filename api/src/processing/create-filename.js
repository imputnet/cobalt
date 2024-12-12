const illegalCharacters = ['}', '{', '%', '>', '<', '^', ';', ':', '`', '$', '"', "@", '=', '?', '|', '*'];

const sanitizeString = (string) => {
    for (const i in illegalCharacters) {
        string = string.replaceAll("/", "_").replaceAll("\\", "_")
                       .replaceAll(illegalCharacters[i], '')
    }
    return string;
}

export default (f, style, isAudioOnly, isAudioMuted) => {
    let filename = '';

    let infoBase = [f.service, f.id];
    let classicTags = [...infoBase];
    let basicTags = [];

    let title = sanitizeString(f.title);

    if (f.author) {
        title += ` - ${sanitizeString(f.author)}`;
    }

    if (f.resolution) {
        classicTags.push(f.resolution);
    }

    if (f.qualityLabel) {
        basicTags.push(f.qualityLabel);
    }

    if (f.youtubeFormat) {
        classicTags.push(f.youtubeFormat);
        basicTags.push(f.youtubeFormat);
    }

    if (isAudioMuted) {
        classicTags.push("mute");
        basicTags.push("mute");
    } else if (f.youtubeDubName) {
        classicTags.push(f.youtubeDubName);
        basicTags.push(f.youtubeDubName);
    }

    switch (style) {
        default:
        case "classic":
            if (isAudioOnly) {
                if (f.youtubeDubName) {
                    infoBase.push(f.youtubeDubName);
                }
                return `${infoBase.join("_")}_audio`;
            }
            filename = classicTags.join("_");
            break;
        case "basic":
            if (isAudioOnly) return title;
            filename = `${title} (${basicTags.join(", ")})`;
            break;
        case "pretty":
            if (isAudioOnly) return `${title} (${infoBase[0]})`;
            filename = `${title} (${[...basicTags, infoBase[0]].join(", ")})`;
            break;
        case "nerdy":
            if (isAudioOnly) return `${title} (${infoBase.join(", ")})`;
            filename = `${title} (${basicTags.concat(infoBase).join(", ")})`;
            break;
    }
    return `${filename}.${f.extension}`;
}
