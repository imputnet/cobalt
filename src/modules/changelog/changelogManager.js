import { replaceBase } from "../../localization/manager.js";
import loadJSON from "../sub/loadJSON.js";

let changelog = loadJSON('./src/modules/changelog/changelog.json')

export default function(string) {
    try {
        switch (string) {
            case "title":
                return `<span class="text-backdrop">${changelog["current"]["version"]}:</span> ${replaceBase(changelog["current"]["title"])}`;
            case "banner":
                return changelog["current"]["banner"] ? `updateBanners/${changelog["current"]["banner"]}` : false;
            case "content":
                return replaceBase(changelog["current"]["content"]);
            case "history":
                return changelog["history"].map((i) => {
                    return {
                        title: `<span class="text-backdrop">${i["version"]}:</span> ${replaceBase(i["title"])}`,
                        content: replaceBase(i["content"]),
                        version: i["version"],
                        banner: i["banner"] ? `updateBanners/${i["banner"]}` : false,
                    }
                });
            default:
                return replaceBase(changelog[string])
        }
    } catch (e) {
        return `!!CHANGELOG_${string}!!`
    }
}
