import { celebrations } from "../config.js";
import emoji from "../emoji.js";

export const backButtonSVG = `<svg width="22" height="22" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M14.1905 28.5L2 16L14.1905 3.5L16.2857 5.62054L7.65986 14.4654H30V17.5346H7.65986L16.2857 26.3516L14.1905 28.5Z" fill="#E1E1E1"/>
</svg>`

export const dropdownSVG = `<svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M28 12.0533L16 24L4 12.0533L6.03571 10L14.7188 18.4104L16.25 19.9348L17.7813 18.4104L25.9375 10L28 12.0533Z" fill="#E1E1E1"/>
</svg>`

export function switcher(obj) {
    let items = ``;
    if (obj.name === "download") {
        items = obj.items;
    } else {
        for (let i = 0; i < obj.items.length; i++) {
            let classes = obj.items[i]["classes"] ? obj.items[i]["classes"] : [];
            if (i === 0) classes.push("first");
            if (i === (obj.items.length - 1)) classes.push("last");
            items += `<button id="${obj.name}-${obj.items[i]["action"]}" class="switch${classes.length > 0 ? ' ' + classes.join(' ') : ''}" onclick="changeSwitcher('${obj.name}', '${obj.items[i]["action"]}')">${obj.items[i]["text"] ? obj.items[i]["text"] : obj.items[i]["action"]}</button>`
        }
    }

    if (obj.noParent) return `<div id="${obj.name}" class="switches">${items}</div>`;
    return `<div id="${obj.name}-switcher" class="switch-container">
            ${obj.subtitle ? `<div class="subtitle">${obj.subtitle}</div>` : ``}
            <div class="switches">${items}</div>
            ${obj.explanation ? `<div class="explanation">${obj.explanation}</div>` : ``}
        </div>`
}
export function checkbox(obj) {
    let paddings = ["bottom-margin", "top-margin", "no-margin", "top-margin-only"];
    let checkboxes = ``;
    for (let i = 0; i < obj.length; i++) {
        let paddingClass = obj[i].padding && paddings.includes(obj[i].padding) ? ` ${obj[i].padding}` : '';

        checkboxes += `<label id="${obj[i].action}-chkbx" class="checkbox${paddingClass}">
            <input id="${obj[i].action}" type="checkbox" aria-label="${obj[i].aria ? obj[i].aria : obj[i].name}" onclick="checkbox('${obj[i].action}')">
            <span>${obj[i].name}</span>
        </label>`
    }
    return checkboxes
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
    let classes = obj.classes ? obj.classes : [];
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
    ${obj.standalone ? `<div id="popup-${obj.name}" class="popup center${!obj.buttonOnly ? " box": ''}${classes.length > 0 ? ' ' + classes.join(' ') : ''}">` : ''}
        <div id="popup-header" class="popup-header${!obj.buttonOnly ? " glass-bkg": ''}">
            <div id="popup-header-contents">
                ${obj.buttonOnly ? obj.header.emoji : ``}
                ${obj.header.aboveTitle ? `<a id="popup-above-title" target="_blank" href="${obj.header.aboveTitle.url}">${obj.header.aboveTitle.text}</a>` : ''}
                ${obj.header.title ? `<div id="popup-title">${obj.header.title}</div>` : ''}
                ${obj.header.subtitle ? `<div id="popup-subtitle">${obj.header.subtitle}</div>` : ''}
            </div>
        </div>
        <div id="popup-content" class="popup-content-inner">
            ${body}${obj.buttonOnly ? `<button id="close-error" class="switch" onclick="popup('${obj.name}', 0)">${obj.buttonText}</button>` : ''}
        </div>
    ${obj.standalone ? `</div>` : ''}`
}

export function multiPagePopup(obj) {
    let tabs = `
    <button id="back-button" class="switch tab-${obj.name}" onclick="popup('${obj.name}', 0)" ${obj.closeAria ? `aria-label="${obj.closeAria}"` : ''}>
        ${backButtonSVG}
    </button>`;

    let tabContent = ``;
    for (let i = 0; i < obj.tabs.length; i++) {
        tabs += `<button id="tab-button-${obj.name}-${obj.tabs[i]["name"]}" class="switch tab tab-${obj.name}" onclick="changeTab(event, 'tab-${obj.name}-${obj.tabs[i]["name"]}', '${obj.name}')">${obj.tabs[i]["title"]}</button>`
        tabContent += `<div id="tab-${obj.name}-${obj.tabs[i]["name"]}" class="popup-tab-content tab-content-${obj.name}">${obj.tabs[i]["content"]}</div>`
    }

    return `
    <div id="popup-${obj.name}" class="popup center box scrollable">
        <div id="popup-content">
        ${obj.header ? `<div id="popup-header" class="popup-header glass-bkg">
            <div id="popup-header-contents">
                ${obj.header.aboveTitle ? `<a id="popup-above-title" target="_blank" href="${obj.header.aboveTitle.url}">${obj.header.aboveTitle.text}</a>` : ''}
                ${obj.header.title ? `<div id="popup-title">${obj.header.title}</div>` : ''}
                ${obj.header.subtitle ? `<div id="popup-subtitle">${obj.header.subtitle}</div>` : ''}
            </div>
        </div>` : ''}${tabContent}</div>
        <div id="popup-tabs" class="switches popup-tabs glass-bkg"><div class="switches popup-tabs-child">${tabs}</div></div>
    </div>`
}
export function collapsibleList(arr) {
    let items = ``;

    for (let i = 0; i < arr.length; i++) {
        let classes = arr[i]["classes"] ? arr[i]["classes"] : [];
        if (i === 0) classes.push("first");
        if (i === (arr.length - 1)) classes.push("last");
        items += `<div id="${arr[i]["name"]}-collapse" class="collapse-list${classes.length > 0 ? ' ' + classes.join(' ') : ''}">
            <div class="collapse-header" onclick="expandCollapsible(event)">
                <div class="collapse-title">${arr[i]["title"]}</div>
                <div class="collapse-indicator">${dropdownSVG}</div>
            </div>
            <div id="${arr[i]["name"]}-body" class="collapse-body">${arr[i]["body"]}</div>
        </div>`
    }
    return items;
}
export function popupWithBottomButtons(obj) {
    let tabs = `
    <button id="back-button" class="switch tab-${obj.name}" onclick="popup('${obj.name}', 0)" ${obj.closeAria ? `aria-label="${obj.closeAria}"` : ''}>
        ${backButtonSVG}
    </button>`

    for (let i = 0; i < obj.buttons.length; i++) {
        tabs += obj.buttons[i]
    }
    return `
    <div id="popup-${obj.name}" class="popup center box scrollable">
        <div id="popup-content">
       ${obj.header ? `<div id="popup-header" class="popup-header glass-bkg">
            <div id="popup-header-contents">
                ${obj.header.aboveTitle ? `<a id="popup-above-title" target="_blank" href="${obj.header.aboveTitle.url}">${obj.header.aboveTitle.text}</a>` : ''}
                ${obj.header.title ? `<div id="popup-title">${obj.header.title}</div>` : ''}
                ${obj.header.subtitle ? `<div id="popup-subtitle">${obj.header.subtitle}</div>` : ''}
                ${obj.header.explanation ? `<div class="explanation">${obj.header.explanation}</div>` : ''}
            </div>
        </div>` : ''}${obj.content}</div>
        <div id="popup-tabs" class="switches popup-tabs glass-bkg"><div id="picker-buttons" class="switches popup-tabs-child">${tabs}</div></div>
    </div>`
}
export function socialLink(emji, name, handle, url) {
    return `<div class="cobalt-support-link">${emji} ${name}: <a class="text-backdrop link" href="${url}" target="_blank">${handle}</a></div>`
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
export function urgentNotice(obj) {
    if (obj.visible) {
        return `<div id="urgent-notice" class="urgent-notice explanation">` +
            `<span class="urgent-text" onclick="${obj.action}">${emoji(obj.emoji, 18)} ${obj.text}</span>` +
        `</div>`
    }
    return ``
}
export function keyboardShortcuts(arr) {
    let base = `<div id="keyboard-shortcuts" class="explanation">`;

    for (let i = 0; i < arr.length; i++) {
        base += `<div class="shortcut-category">`;
        for (let c = 0; c < arr[i].items.length; c++) {
            let combo = arr[i].items[c].combo.split('+').map(
                key => `<span class="text-backdrop key">${key}</span>`
            ).join("+")
            base += `<div class="shortcut">${combo}: ${arr[i].items[c].name}</div>`
        }
        base += `</div>`
    }
    base += `</div>`;

    return base;
}
