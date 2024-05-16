import * as esbuild from "esbuild";
import * as fs from "fs";
import { loadLoc, languageList } from "../localization/manager.js";
import { cleanHTML } from "./sub/utils.js";

import page from "./pageRender/page.js";

export async function buildFront(commitHash, branch) {
    try {
        // preload localization files
        await loadLoc();

        // build html
        if (!fs.existsSync('./build/')){
            fs.mkdirSync('./build/');
        }
        // get rid of old build path
        if (fs.existsSync('./min')) {
            fs.rmSync('./min', { recursive: true, force: true });
        }
        for (let i in languageList) {
            i = languageList[i];
            let params = {
                "hash": commitHash,
                "lang": i,
                "branch": branch
            }
            fs.writeFileSync(`./build/${i}.html`, cleanHTML(page(params)));
        }
        // build js & css
        await esbuild.build({
            entryPoints: ['src/front/cobalt.js', 'src/front/cobalt.css'],
            outdir: 'build/min/',
            minify: true,
            loader: { '.js': 'js', '.css': 'css', },
            charset: 'utf8'
        })
    } catch {
        return;
    }
}
