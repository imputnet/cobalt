import * as esbuild from "esbuild";
import * as fs from "fs";
import { languageList } from "../localization/manager.js";
import page from "./pageRender/page.js";

function cleanHTML(html) {
    let clean = html.replace(/ {4}/g, '');
    clean = clean.replace(/\n/g, '');
    return clean
}
export async function buildFront(commitHash, branch) {
    try {
        // build html
        if (!fs.existsSync('./build/')){
            fs.mkdirSync('./build/');
            fs.mkdirSync('./build/ios/');
            fs.mkdirSync('./build/pc/');
            fs.mkdirSync('./build/mob/');
        }
        for (let i in languageList) {
            i = languageList[i];
            let params = {
                "hash": commitHash,
                "lang": i,
                "useragent": "pc",
                "branch": branch
            }
            fs.writeFileSync(`./build/pc/${i}.html`, cleanHTML(page(params)));

            params["useragent"] = "iphone os";
            fs.writeFileSync(`./build/ios/${i}.html`, cleanHTML(page(params)));

            params["useragent"] = "android";
            fs.writeFileSync(`./build/mob/${i}.html`, cleanHTML(page(params)));
        }
        // build js & css
        await esbuild.build({
            entryPoints: ['src/front/cobalt.js', 'src/front/cobalt.css'],
            outdir: 'min/',
            minify: true,
            loader: { '.js': 'js', '.css': 'css', },
            charset: 'utf8'
        })
    } catch (e) {
        return;
    }
}
