import { celebrations } from "../config.js";
import emoji from "../emoji.js";

export function switcher(obj) {
    let items = ``;
    if (obj.name === "download") {
        items = obj.items;
    } else {
        for (let i = 0; i < obj.items.length; i++) {
            let classes = obj.items[i]["classes"] ? obj.items[i]["classes"] : []
            items += `<button id="${obj.name}-${obj.items[i]["action"]}" class="switch${classes.length > 0 ? ' ' + classes.join(' ') : ''}" onclick="changeSwitcher('${obj.name}', '${obj.items[i]["action"]}')">${obj.items[i]["text"] ? obj.items[i]["text"] : obj.items[i]["action"]}</button>`
        }
    }

    if (obj.noParent) return `<div class="switches">${items}</div>`;
    return `<div id="${obj.name}-switcher" class="switch-container">
            ${obj.subtitle ? `<div class="subtitle">${obj.subtitle}</div>` : ``}
            <div class="switches">${items}</div>
            ${obj.explanation ? `<div class="explanation">${obj.explanation}</div>` : ``}
        </div>`
}

export function checkbox(action, text, paddingType, aria) {
    let paddingClass = ` `
    switch (paddingType) {
        case 1:
            paddingClass += "bottom-margin"
            break;
        case 2:
            paddingClass += "top-margin"
            break;
        case 3:
            paddingClass += "no-margin"
            break;
        case 4:
            paddingClass += "top-margin-only"
    }
    return `<label id="${action}-chkbx" class="checkbox${paddingClass}">
        <input id="${action}" type="checkbox" ${aria ? `aria-label="${aria}"` : `aria-label="${text}"`} onclick="checkbox('${action}')">
        <span>${text}</span>
    </label>`
}
export function sep(paddingType) {
    let paddingClass = ``
    switch(paddingType) {
        case 0: 
            paddingClass += ` top-margin`;
            break;
    }
    return `<div class="separator${paddingClass}"></div>`
}
export function popup(obj) {
    let classes = obj.classes ? obj.classes : []
    let body = obj.body;
    if (Array.isArray(obj.body)) {
        body = ``
        for (let i = 0; i < obj.body.length; i++) {
            if (obj.body[i]["text"].length > 0) {
                classes = obj.body[i]["classes"] ? obj.body[i]["classes"] : []
                if (i !== obj.body.length - 1 && !obj.body[i]["nopadding"]) {
                    classes.push("desc-padding")
                }
                body += obj.body[i]["raw"] ? obj.body[i]["text"] : `<div id="popup-desc" class="${classes.length > 0 ? classes.join(' ') : ''}">${obj.body[i]["text"]}</div>`
            }
        }
    }
    return `
    ${obj.standalone ? `<div id="popup-${obj.name}" class="popup center box${classes.length > 0 ? ' ' + classes.join(' ') : ''}" style="visibility: hidden;">` : ''}
        <div id="popup-header" class="popup-header">
            ${obj.standalone && !obj.buttonOnly ? `<button id="close-button" class="switch up" onclick="popup('${obj.name}', 0)" ${obj.header.closeAria ? `aria-label="${obj.header.closeAria}"` : ''}>x</button>` : ''}
            ${obj.buttonOnly ? obj.header.emoji : ``}
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
    tabs += `<button id="close-button" class="switch tab-${obj.name}" onclick="popup('${obj.name}', 0)" ${obj.closeAria ? `aria-label="${obj.closeAria}"` : ''}>x</button>`
    return `
    <div id="popup-${obj.name}" class="popup center box scrollable" style="visibility: hidden;">
        <div id="popup-content">${obj.header ? `<div id="popup-header" class="popup-header">
        ${obj.header.aboveTitle ? `<a id="popup-above-title" target="_blank" href="${obj.header.aboveTitle.url}">${obj.header.aboveTitle.text}</a>` : ''}
        ${obj.header.title ? `<div id="popup-title">${obj.header.title}</div>` : ''}
        ${obj.header.subtitle ? `<div id="popup-subtitle">${obj.header.subtitle}</div>` : ''}</div>` : ''}${tabContent}</div>
        <div id="popup-tabs" class="switches popup-tabs">${tabs}</div>
    </div>`
}
export function collapsibleList(arr) {
    let items = ``
    for (let i = 0; i < arr.length; i++) {
        items += `<div id="${arr[i]["name"]}-collapse" class="collapse-list">
            <div class="collapse-header" onclick="expandCollapsible(event)">
                <div class="collapse-title">${arr[i]["title"]}</div>
                <div class="collapse-indicator">^</div>
            </div>
            <div id="${arr[i]["name"]}-body" class="collapse-body">${arr[i]["body"]}</div>
        </div>`
    }
    return items;
}
export function popupWithBottomButtons(obj) {
    let tabs = ``
    for (let i = 0; i < obj.buttons.length; i++) {
        tabs += obj.buttons[i]
    }
    tabs += `<button id="close-button" class="switch tab-${obj.name}" onclick="popup('${obj.name}', 0)" ${obj.closeAria ? `aria-label="${obj.closeAria}"` : ''}>x</button>`
    return `
    <div id="popup-${obj.name}" class="popup center box scrollable" style="visibility: hidden;">
        <div id="popup-content">${obj.header ? `<div id="popup-header" class="popup-header">
        ${obj.header.aboveTitle ? `<a id="popup-above-title" target="_blank" href="${obj.header.aboveTitle.url}">${obj.header.aboveTitle.text}</a>` : ''}
        ${obj.header.title ? `<div id="popup-title">${obj.header.title}</div>` : ''}
        ${obj.header.subtitle ? `<div id="popup-subtitle">${obj.header.subtitle}</div>` : ''}
        ${obj.header.explanation ? `<div class="explanation">${obj.header.explanation}</div>` : ''}</div>` : ''}${obj.content}</div>
        <div id="popup-buttons" class="switches popup-tabs">${tabs}</div>
    </div>`
}
export function backdropLink(link, text) {
    return `<a class="text-backdrop italic" href="${link}" target="_blank">${text}</a>`
}
export function socialLink(emji, name, handle, url) {
    return `<div class="cobalt-support-link">${emji} ${name}: <a class="text-backdrop italic" href="${url}" target="_blank">${handle}</a></div>`
}
export function settingsCategory(obj) {
    return `<div id="settings-${obj.name}" class="settings-category">
        <div class="category-title">${obj.title ? obj.title : obj.name}</div>
        <div class="category-content">${obj.body}</div>
    </div>`
}

export function footerButtons(obj) {
    let items = ``
    for (let i = 0; i < obj.length; i++) {
        switch (obj[i]["type"]) {
            case "toggle": 
                items += `<button id="${obj[i]["name"]}-footer" class="switch footer-button" onclick="toggle('${obj[i]["name"]}')" aria-label="${obj[i]["aria"]}">${obj[i]["text"]}</button>`;
                break;
            case "action":
                items += `<button id="${obj[i]["name"]}-footer" class="switch footer-button" onclick="${obj[i]["action"]}()" aria-label="${obj[i]["aria"]}">${obj[i]["text"]}</button>`;
                break;
            case "popup":
                let buttonName = obj[i]["context"] ? `${obj[i]["name"]}-${obj[i]["context"]}` : obj[i]["name"],
                    context = obj[i]["context"] ? `, '${obj[i]["context"]}'` : '',
                    buttonName2,
                    context2;

                if (obj[i+1]) {
                    buttonName2 = obj[i+1]["context"] ? `${obj[i+1]["name"]}-${obj[i+1]["context"]}` : obj[i+1]["name"];
                    context2 = obj[i+1]["context"] ? `, '${obj[i+1]["context"]}'` : '';
                }

                items += `
                <div class="footer-pair">
                    <button id="${buttonName}-footer" class="switch footer-button" onclick="popup('${obj[i]["name"]}', 1${context})" aria-label="${obj[i]["aria"]}">${obj[i]["text"]}</button>
                    ${obj[i+1] ? `<button id="${buttonName2}-footer" class="switch footer-button" onclick="popup('${obj[i+1]["name"]}', 1${context2})" aria-label="${obj[i+1]["aria"]}">${obj[i+1]["text"]}</button>`: ''}
                </div>`;
                i++;
                break;
        }
    }
    return `
    <div id="footer-buttons">${items}</div>`
}
export function explanation(text) {
    return `<div class="explanation">${text}</div>`
}
export function celebrationsEmoji() {
    try {
        let n = new Date().toISOString().split('T')[0].split('-');
        let dm = `${n[1]}-${n[2]}`;
        let f = Object.keys(celebrations).includes(dm) ? celebrations[dm] : "🐲";
        return f != "🐲" ? emoji(f, 22) : false;
    } catch (e) {
        return false
    }
}
