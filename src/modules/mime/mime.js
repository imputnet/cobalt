import loadJson from "../sub/loadJSON.js";

export default function loadMime (filename, defaultMime = "text/plain") {
    const mimeList = loadJson("./src/modules/mime/_list.json")

    // i love ES2020 for this thing
    // not needed to do variable with list
    // and take last item by (array.length - 1) index
    const extension = filename.split(".").at(-1);

    for (let mimeData of mimeList) {
        const { extensions, mime } = mimeData
        if (extensions.includes(extension)) {
            return mime;
        }
    }

    return defaultMime;
}
