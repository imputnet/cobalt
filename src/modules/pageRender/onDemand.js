import changelogManager from "../changelog/changelogManager.js"

let cache = {}

export function changelogHistory() { // blockId 0
    if (cache['0']) return cache['0'];
    let history = changelogManager("history");
    let render = ``;
    
    let historyLen = history.length;
    for (let i in history) {
        let separator = (i !== 0 && i !== historyLen) ? '<div class="separator"></div>' : '';
        render += `${separator}${history[i]["banner"] ? `<div class="changelog-banner"><img class="changelog-img" src="${history[i]["banner"]}" onerror="this.style.display='none'"></img></div>` : ''}<div id="popup-desc" class="changelog-subtitle">${history[i]["title"]}</div><div id="popup-desc" class="desc-padding">${history[i]["content"]}</div>`
    }
    cache['0'] = render;
    return render;
}
