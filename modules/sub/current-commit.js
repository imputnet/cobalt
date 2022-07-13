import { execSync } from "child_process";

export function shortCommit() {
    return execSync('git rev-parse --short HEAD').toString().trim()
}
export function getCommitInfo() {
    return execSync(`git show -s --format='%s;;;%B'`).toString().trim().slice(1,-1).replace(/[\r\n]/gm, '\n').split(';;;')
}