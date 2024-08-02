import { languageList } from "../../localization/manager.js";

export default function(lang) {
    let language = languageList.includes(lang) ? lang : "en";
    return `/build/${language}.html`;
}
