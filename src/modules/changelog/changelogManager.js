import { replaceBase } from "../../localization/manager.js";
import loadJSON from "../sub/loadJSON.js";

let changelog = loadJSON('./src/modules/changelog/changelog.json')

export default function(string) {
    try {
        switch (string) {
            case "version":
                return `<span class="text-backdrop changelog-tag-version">v.${changelog["current"]["version"]}</span>${
                    changelog["current"]["date"] ? `<span class="changelog-tag-date">· ${changelog["current"]["date"]}</span>` : ''
                }`
            case "title":
                return replaceBase(changelog["current"]["title"]);
            case "banner":
                return changelog["current"]["banner"] ? {
                    url: `updateBanners/${changelog["current"]["banner"]["file"]}`,
                    width: changelog["current"]["banner"]["width"],
                    height: changelog["current"]["banner"]["height"]
                } : false;
            case "content":
                return replaceBase(changelog["current"]["content"]);
            case "history":
                return changelog["history"].map((i) => {
                    return {
                        title: replaceBase(i["title"]),
                        version: `<span class="text-backdrop changelog-tag-version">v.${i["version"]}</span>${
                            i["date"] ? `<span class="changelog-tag-date">· ${i["date"]}</span>` : ''
                        }`,
                        content: replaceBase(i["content"]),
                        banner: i["banner"] ? {
                            url: `updateBanners/${i["banner"]["file"]}`,
                            width: i["banner"]["width"],
                            height: i["banner"]["height"]
                        } : false,
                    }
                });
            default:
                return replaceBase(changelog[string])
        }
    } catch (e) {
        return `!!CHANGELOG_${string}!!`
    }
}
