import * as fs from "fs";

import path from 'path';
import { fileURLToPath } from 'url';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '../../');

export function loadJSON(filePath) {
    try {
        return JSON.parse(fs.readFileSync(path.join(dir, filePath), 'utf-8'))
    } catch(e) {
        return false
    }
}
