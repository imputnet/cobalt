const forbiddenCharsString = ['}', '{', '%', '>', '<', '^', ';', '`', '$', '"', "@", '='];

export function metadataManager(obj) {
    let keys = Object.keys(obj);
    let tags = ["album", "composer", "genre", "copyright", "encoded_by", "title", "language", "artist", "album_artist", "performer", "disc", "publisher", "track", "encoder", "compilation", "date", "creation_time", "comment"]
    let commands = []

    for (let i in keys) { if (tags.includes(keys[i])) commands.push('-metadata', `${keys[i]}=${obj[keys[i]]}`) }
    return commands;
}

export function cleanString(string) {
    for (let i in forbiddenCharsString) {
        string = string.replaceAll("/", "_").replaceAll(forbiddenCharsString[i], '')
    }
    return string;
}
export function verifyLanguageCode(code) {
    return RegExp(/[a-z]{2}/).test(String(code.slice(0, 2).toLowerCase())) ? String(code.slice(0, 2).toLowerCase()) : "en"
}
export function languageCode(req) {
    return req.header('Accept-Language') ? verifyLanguageCode(req.header('Accept-Language')) : "en"
}
export function unicodeDecode(str) {
    return str.replace(/\\u[\dA-F]{4}/gi, (unicode) => {
        return String.fromCharCode(parseInt(unicode.replace(/\\u/g, ""), 16));
    });
}
export function cleanHTML(html) {
    let clean = html.replace(/ {4}/g, '');
    clean = clean.replace(/\n/g, '');
    return clean
}
