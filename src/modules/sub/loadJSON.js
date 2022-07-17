import * as fs from "fs";

export default function(path) {
    try {
        return JSON.parse(fs.readFileSync(path, 'utf-8'))
    } catch(e) {
        return false
    }
}