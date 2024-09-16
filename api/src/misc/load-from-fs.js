import * as fs from "fs";
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(
    dirname(fileURLToPath(import.meta.url)),
    '../../'
);

export function loadFile(path) {
    return fs.readFileSync(join(root, path), 'utf-8')
}

export function loadJSON(path) {
    try {
        return JSON.parse(loadFile(path))
    } catch {
        return false
    }
}
