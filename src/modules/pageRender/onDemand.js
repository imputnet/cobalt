import changelogManager from "../changelog/changelogManager.js"

export function changelogHistory() { // blockId 0
    let history = changelogManager("history");
    let render = ``;

    for (let i in history) {
        render += `<div id="popup-desc" class="changelog-subtitle">${history[i]["title"]}</div><div id="popup-desc" class="desc-padding">${history[i]["content"]}</div>`
    }
    return render;
}