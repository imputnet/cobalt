import { execSync } from "child_process";

export function shortCommit() {
    return execSync('git rev-parse --short HEAD').toString().trim()
}
export function getCommitInfo() {
    let d = execSync(`git show -s --format='%s;;;%B'`).toString().trim().replace(/[\r\n]/gm, '\n').split(';;;')
    d[1] = d[1].replace(d[0], '').trim().toString().replace(/[\r\n]/gm, '<br>')
    return d
}
