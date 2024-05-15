const forbiddenCharsString = ['}', '{', '%', '>', '<', '^', ';', '`', '$', '"', "@", '='];

export function metadataManager(obj) {
    const keys = Object.keys(obj);
    const tags = [
        "album",
        "copyright",
        "title",
        "artist",
        "track",
        "date"
    ]
    let commands = []

    for (const i in keys) {
        if (tags.includes(keys[i]))
            commands.push('-metadata', `${keys[i]}=${obj[keys[i]]}`)
        }
    return commands;
}

export function cleanString(string) {
    for (const i in forbiddenCharsString) {
        string = string.replaceAll("/", "_")
                       .replaceAll(forbiddenCharsString[i], '')
    }
    return string;
}
export function verifyLanguageCode(code) {
    const langCode = String(code.slice(0, 2).toLowerCase());
    if (RegExp(/[a-z]{2}/).test(code)) {
        return langCode
    }
    return "en"
}
export function languageCode(req) {
    if (req.header('Accept-Language')) {
        return verifyLanguageCode(req.header('Accept-Language'))
    }
    return "en"
}
export function cleanHTML(html) {
    let clean = html.replace(/ {4}/g, '');
    clean = clean.replace(/\n/g, '');
    return clean
}
