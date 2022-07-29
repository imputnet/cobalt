import { shortCommit } from "./sub/currentCommit.js";
import * as esbuild from "esbuild";
import { readdir } from "fs/promises";

export async function buildBundle () {
    const currentCommitId = shortCommit();
    const outdir = `dist/${currentCommitId}/`;
    const entryPoints = ['src/static/cobalt.js', 'src/static/cobalt.css'];

    const allFonts = await readdir("src/static/fonts/");
    for (let item of allFonts) {
        if (item.includes('.')) {
            break;
        }

        const fontDir = await readdir(`src/static/fonts/${item}/`);
        fontDir.forEach(function (file) {
            entryPoints.push(`src/static/fonts/${item}/${file}`);
        })
    }

    await esbuild.build({
        entryPoints,
        outdir,
        bundle: true,
        minify: true,
        loader: {".js": "js", ".css": "css", ".woff": "file", ".woff2": "file"}
    })
}