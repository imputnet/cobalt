import * as fs from "fs";
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(
    dirname(fileURLToPath(import.meta.url)),
    '../../'
);

export function loadJSON(path) {
    try {
        return JSON.parse(fs.readFileSync(join(root, path), 'utf-8'))
    } catch {
        return false
    }
}

export function loadFile(path) {
    try {
        return fs.readFileSync(path, 'utf-8')
    } catch {
        return false
    }
}
