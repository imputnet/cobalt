export function switcher(obj) {
    let items = ``;
    switch(obj.name) {
        case "download":
            items = obj.items;
            break;
        default:
            for (let i = 0; i < obj.items.length; i++) {
                let classes = obj.items[i]["classes"] ? obj.items[i]["classes"] : []
                items += `<button id="${obj.name}-${obj.items[i]["action"]}" class="switch${classes.length > 0 ? ' ' + classes.join(' ') : ''}" onclick="changeSwitcher('${obj.name}', '${obj.items[i]["action"]}')">${obj.items[i]["text"] ? obj.items[i]["text"] : obj.items[i]["action"]}</button>`
            }
            break;
    }
    return `
        <div id="${obj.name}-switcher" class="switch-container">
            ${obj.subtitle ? `<div class="subtitle">${obj.subtitle}</div>` : ``}
            <div class="switches">${items}</div>
            ${obj.explanation ? `<div class="explanation">${obj.explanation}</div>` : ``}
        </div>`
}

export function checkbox(action, text, aria) {
    return `<label class="checkbox">
        <input id="${action}" type="checkbox" ${aria ? `aria-label="${aria}"` : ''} onclick="checkbox('${action}')">
        <span>${text}</span>
    </label>`
}

export function popup(obj) {
    let classes = obj.classes ? obj.classes : []
    let body = obj.body;
    if (Array.isArray(obj.body)) {
        body = ``
        for (let i = 0; i < obj.body.length; i++) {
            classes = obj.body[i]["classes"] ? obj.body[i]["classes"] : []
            if (i != obj.body.length - 1 && !obj.body[i]["nopadding"]) {
                classes.push("desc-padding")
            }
            body += obj.body[i]["raw"] ? obj.body[i]["text"] : `<div id="popup-desc" class="${classes.length > 0 ? classes.join(' ') : ''}">${obj.body[i]["text"]}</div>`
        }
    }
    return `
    ${obj.standalone ? `<div id="popup-${obj.name}" class="popup center box${classes.length > 0 ? ' ' + classes.join(' ') : ''}" style="visibility: hidden;">` : ''}
    ${obj.buttonOnly ? obj.emoji : ``}
        <div id="popup-header" class="popup-header">
            ${obj.standalone && !obj.buttonOnly ? `<button id="popup-close" class="button mono" onclick="popup('${obj.name}', 0)" ${obj.header.closeAria ? `aria-label="${obj.header.closeAria}"` : ''}>x</button>` : ''}
            ${obj.header.aboveTitle ? `<a id="popup-above-title" target="_blank" href="${obj.header.aboveTitle.url}">${obj.header.aboveTitle.text}</a>` : ''}
            ${obj.header.title ? `<div id="popup-title">${obj.header.title}</div>` : ''}
            ${obj.header.subtitle ? `<div id="popup-subtitle">${obj.header.subtitle}</div>` : ''}
        </div>
        <div id="popup-content"${obj.footer ? ' class="with-footer"' : ''}>
            ${body}${obj.buttonOnly ? `<button id="close-error" class="switch" onclick="popup('${obj.name}', 0)">${obj.buttonText}</button>` : ''}
        </div>
        ${obj.footer ? `<div id="popup-footer" class="popup-footer">
            <a id="popup-bottom" class="popup-footer-content" target="_blank" href="${obj.footer.url}">${obj.footer.text}</a>
        </div>` : ''}
    ${obj.standalone ? `</div>` : ''}`
}

export function multiPagePopup(obj) {
    let tabs = ``
    let tabContent = ``
    for (let i = 0; i < obj.tabs.length; i++) {
        tabs += `<button id="tab-button-${obj.name}-${obj.tabs[i]["name"]}" class="switch tab tab-${obj.name}" onclick="changeTab(event, 'tab-${obj.name}-${obj.tabs[i]["name"]}', '${obj.name}')">${obj.tabs[i]["title"]}</button>`
        tabContent += `<div id="tab-${obj.name}-${obj.tabs[i]["name"]}" class="popup-tab-content tab-content-${obj.name}">${obj.tabs[i]["content"]}</div>`
    }
    tabs += `<button id="close-bottom" class="switch tab-${obj.name}" onclick="popup('${obj.name}', 0)" ${obj.closeAria ? `aria-label="${obj.closeAria}"` : ''}>x</button>`
    return `
    <div id="popup-${obj.name}" class="popup center box scrollable" style="visibility: hidden;">
        
        <div id="popup-content">${obj.header ? `<div id="popup-header" class="popup-header">
        ${obj.header.aboveTitle ? `<a id="popup-above-title" target="_blank" href="${obj.header.aboveTitle.url}">${obj.header.aboveTitle.text}</a>` : ''}
        ${obj.header.title ? `<div id="popup-title">${obj.header.title}</div>` : ''}
        ${obj.header.subtitle ? `<div id="popup-subtitle">${obj.header.subtitle}</div>` : ''}</div>` : ''}${tabContent}</div>
        <div id="popup-tabs" class="switches popup-tabs">${tabs}</div>
    </div>`
}

export function backdropLink(link, text) {
    return `<a class="text-backdrop" href="${link}" target="_blank">${text}</a>`
}

export function settingsCategory(obj) {
    return `<div id="settings-${obj.name}" class="settings-category">
        <div class="category-title">${obj.title ? obj.title : obj.name}</div>
        <div class="settings-category-content">${obj.body}</div>
    </div>`
}

export function footerButtons(obj) {
    let items = ``
    for (let i = 0; i < obj.length; i++) {
        let func = `${obj[i]["type"] == "toggle" ? `toggle('${obj[i]["name"]}')` : `popup('${obj[i]["name"]}', 1)`}`;
        items += `<button id="${obj[i]["name"]}" class="button footer-button" onclick="${func}" aria-label="${obj[i]["aria"]}">${obj[i]["icon"]}</button>`;
    }
    return `
    <div id="footer-buttons">${items}</div>`
}
