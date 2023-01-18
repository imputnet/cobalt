let ua = navigator.userAgent.toLowerCase();
let isIOS = ua.match("iphone os");
let isMobile = ua.match("android") || ua.match("iphone os");
let version = 21;
let regex = new RegExp(/https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/);
let notification = `<div class="notification-dot"></div>`

let store = {}

let switchers = {
    "theme": ["auto", "light", "dark"],
    "vFormat": ["mp4", "webm"],
    "vQuality": ["hig", "max", "mid", "low"],
    "aFormat": ["mp3", "best", "ogg", "wav", "opus"]
}
let checkboxes = ["disableTikTokWatermark", "fullTikTokAudio", "muteAudio"];
let exceptions = { // used for mobile devices
    "vQuality": "mid"
}

function eid(id) {
    return document.getElementById(id)
}
function sGet(id) {
    return localStorage.getItem(id)
}
function sSet(id, value) {
    localStorage.setItem(id, value)
}
function enable(id) {
    eid(id).dataset.enabled = "true";
}
function disable(id) {
    eid(id).dataset.enabled = "false";
}
function vis(state) {
    return (state === 1) ? "visible" : "hidden";
}
function opposite(state) {
    return state === "true" ? "false" : "true";
}
function changeDownloadButton(action, text) {
    switch (action) {
        case 0:
            eid("download-button").disabled = true
            if (sGet("alwaysVisibleButton") === "true") {
                eid("download-button").value = text
                eid("download-button").style.padding = '0 1rem'
            } else {
                eid("download-button").value = ''
                eid("download-button").style.padding = '0'
            }
            break;
        case 1:
            eid("download-button").disabled = false
            eid("download-button").value = text
            eid("download-button").style.padding = '0 1rem'
            break;
        case 2:
            eid("download-button").disabled = true
            eid("download-button").value = text
            eid("download-button").style.padding = '0 1rem'
            break;
    }
}
document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
        eid("download-button").value = '>>'
        eid("download-button").style.padding = '0 1rem'
    }
})
function button() {
    let regexTest = regex.test(eid("url-input-area").value);
    if ((eid("url-input-area").value).length > 0) {
        eid("url-clear").style.display = "block";
    } else {
        eid("url-clear").style.display = "none";
    }
    regexTest ? changeDownloadButton(1, '>>') : changeDownloadButton(0, '>>');
}
function clearInput() {
    eid("url-input-area").value = '';
    button();
}
function copy(id, data) {
    let e = document.getElementById(id);
    e.classList.add("text-backdrop");
    data ? navigator.clipboard.writeText(data) : navigator.clipboard.writeText(e.innerText);
    setTimeout(() => { e.classList.remove("text-backdrop") }, 600);
}
function detectColorScheme() {
    let theme = "auto";
    let localTheme = sGet("theme");
    if (localTheme) {
        theme = localTheme;
    } else if (!window.matchMedia) {
        theme = "dark"
    }
    document.documentElement.setAttribute("data-theme", theme);
}
function changeTab(evnt, tabId, tabClass) {
    let tabcontent = document.getElementsByClassName(`tab-content-${tabClass}`);
    let tablinks = document.getElementsByClassName(`tab-${tabClass}`);
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].dataset.enabled = "false";
    }
    eid(tabId).style.display = "block";
    evnt.currentTarget.dataset.enabled = "true";
    if (tabId === "tab-about-changelog" && sGet("changelogStatus") !== `${version}`) notificationCheck("changelog");
    if (tabId === "tab-about-about" && !sGet("seenAbout")) notificationCheck("about");
}
function notificationCheck(type) {
    let changed = true;
    switch (type) {
        case "about":
            sSet("seenAbout", "true");
            break;
        case "changelog":
            sSet("changelogStatus", version)
            break;
        default:
            changed = false;
            break;
    }
    if (changed && sGet("changelogStatus") === `${version}` || type === "disable") {
        setTimeout(() => {
            eid("about-footer").innerHTML = eid("about-footer").innerHTML.replace(notification, '');
            eid("tab-button-about-changelog").innerHTML = eid("tab-button-about-changelog").innerHTML.replace(notification, '')
        }, 900)
    }
    if (sGet("disableChangelog") !== "true") {
        if (!sGet("seenAbout") && !eid("about-footer").innerHTML.includes(notification)) eid("about-footer").innerHTML = `${notification}${eid("about-footer").innerHTML}`;
        if (sGet("changelogStatus") !== `${version}`) {
            if (!eid("about-footer").innerHTML.includes(notification)) eid("about-footer").innerHTML = `${notification}${eid("about-footer").innerHTML}`;
            if (!eid("tab-button-about-changelog").innerHTML.includes(notification)) eid("tab-button-about-changelog").innerHTML = `${notification}${eid("tab-button-about-changelog").innerHTML}`;
        }
    }
}
function hideAllPopups() {
    let filter = document.getElementsByClassName('popup');
    for (let i = 0; i < filter.length; i++) {
        filter[i].style.visibility = "hidden";
    }
    eid("picker-holder").innerHTML = '';
    eid("picker-download").href = '/';
    eid("picker-download").style.visibility = "hidden";
    eid("popup-backdrop").style.visibility = "hidden";
}
function popup(type, action, text) {
    if (action === 1) {
        hideAllPopups(); // hide the previous popup before showing a new one
        switch (type) {
            case "about":
                let tabId = sGet("seenAbout") ? "changelog" : "about";
                if (text) tabId = text;
                eid(`tab-button-${type}-${tabId}`).click();
                break;
            case "settings":
                eid(`tab-button-${type}-video`).click();
                break;
            case "error":
                eid("desc-error").innerHTML = text;
                break;
            case "download":
                eid("pd-download").href = text;
                eid("pd-copy").setAttribute("onClick", `copy('pd-copy', '${text}')`);
                break;
            case "picker":
                switch (text.type) {
                    case "images":
                        eid("picker-title").innerHTML = loc.pickerImages;
                        eid("picker-subtitle").innerHTML = loc.pickerImagesExpl;
                        if (!eid("popup-picker").classList.contains("scrollable")) eid("popup-picker").classList.add("scrollable");
                        if (eid("picker-holder").classList.contains("various")) eid("picker-holder").classList.remove("various");
                        eid("picker-download").href = text.audio;
                        eid("picker-download").style.visibility = "visible"
                        for (let i in text.arr) {
                            eid("picker-holder").innerHTML += `<a class="picker-image-container"><img class="picker-image" src="${text.arr[i]["url"]}" onerror="this.parentNode.style.display='none'"></img></a>`
                        }
                        break;
                    default:
                        eid("picker-title").innerHTML = loc.pickerDefault;
                        eid("picker-subtitle").innerHTML = loc.pickerDefaultExpl;
                        if (eid("popup-picker").classList.contains("scrollable")) eid("popup-picker").classList.remove("scrollable");
                        if (!eid("picker-holder").classList.contains("various")) eid("picker-holder").classList.add("various");
                        for (let i in text.arr) {
                            let s = text.arr[i], item;
                            switch (s.type) {
                                case "video":
                                    item = `<a class="picker-various-container" href="${text.arr[i]["url"]}" target="_blank"><div class="picker-element-name">VIDEO ${Number(i)+1}</div><div class="imageBlock"></div><img class="picker-image" src="${text.arr[i]["thumb"]}" onerror="this.style.display='none'"></img></a>`
                                    break;
                            }
                            eid("picker-holder").innerHTML += item
                        }
                        eid("picker-download").style.visibility = "hidden";
                        break;
                }
                break;
            default:
                break;
        }
    } else {
        if (type === "picker") {
            eid("picker-download").href = '/';
            eid("picker-download").style.visibility = "hidden"
            eid("picker-holder").innerHTML = ''
        }
    }
    eid("popup-backdrop").style.visibility = vis(action);
    eid(`popup-${type}`).style.visibility = vis(action);
}
function updateMP4Text() {
    eid("vFormat-mp4").innerHTML = sGet("vQuality") === "mid" ? "mp4 (h264/av1)" : "mp4 (av1)";
}
function changeSwitcher(li, b) {
    if (b) {
        sSet(li, b);
        for (let i in switchers[li]) {
            (switchers[li][i] === b) ? enable(`${li}-${b}`) : disable(`${li}-${switchers[li][i]}`)
        }
        if (li === "theme") detectColorScheme();
        if (li === "vQuality") updateMP4Text();
    } else {
        let pref = switchers[li][0];
        if (isMobile && exceptions[li]) pref = exceptions[li];
        sSet(li, pref);
        for (let i in switchers[li]) {
            (switchers[li][i] === pref) ? enable(`${li}-${pref}`) : disable(`${li}-${switchers[li][i]}`)
        }
    }
}
function internetError() {
    eid("url-input-area").disabled = false
    changeDownloadButton(2, '!!');
    popup("error", 1, loc.noInternet);
}
function checkbox(action) {
    if (eid(action).checked) {
        sSet(action, "true");
        if (action === "alwaysVisibleButton") button();
    } else {
        sSet(action, "false");
        if (action === "alwaysVisibleButton") button();
    }
    sGet(action) === "true" ? notificationCheck("disable") : notificationCheck();
}
function updateToggle(toggl, state) {
    switch(state) {
        case "true":
            eid(toggl).innerHTML = loc.toggleAudio;
            break;
        case "false":
            eid(toggl).innerHTML = loc.toggleDefault;
            break;
    }
}
function toggle(toggl) {
    let state = sGet(toggl);
    if (state) {
        sSet(toggl, opposite(state))
        if (opposite(state) === "true") sSet(`${toggl}ToggledOnce`, "true");
    } else {
        sSet(toggl, "false")
    }
    updateToggle(toggl, sGet(toggl))
}
function loadSettings() {
    try {
        if (typeof(navigator.clipboard.readText) == "undefined") throw new Error();
    } catch (err) {
        eid("pasteFromClipboard").style.display = "none"
    }
    if (sGet("alwaysVisibleButton") === "true") {
        eid("alwaysVisibleButton").checked = true;
        eid("download-button").value = '>>'
        eid("download-button").style.padding = '0 1rem';
    }
    if (sGet("downloadPopup") === "true" && !isIOS) {
        eid("downloadPopup").checked = true;
    }
    if (!sGet("audioMode")) {
        toggle("audioMode")
    }
    for (let i = 0; i < checkboxes.length; i++) {
        if (sGet(checkboxes[i]) === "true") eid(checkboxes[i]).checked = true;
    }
    updateToggle("audioMode", sGet("audioMode"));
    for (let i in switchers) {
        changeSwitcher(i, sGet(i))
    }
    updateMP4Text();
}
function changeButton(type, text) {
    switch (type) {
        case 0: //error
            eid("url-input-area").disabled = false
            eid("url-clear").style.display = "block";
            changeDownloadButton(2, '!!')
            popup("error", 1, text);
            break;
        case 1: //enable back
            changeDownloadButton(1, '>>');
            eid("url-clear").style.display = "block";
            eid("url-input-area").disabled = false
            break;
        case 2: //enable back + information popup
            popup("error", 1, text);
            changeDownloadButton(1, '>>');
            eid("url-clear").style.display = "block";
            eid("url-input-area").disabled = false
            break;
    }
}
function resetSettings() {
    localStorage.clear();
    window.location.reload();
}
async function pasteClipboard() {
    let t = await navigator.clipboard.readText();
    if (regex.test(t)) {
        eid("url-input-area").value = t;
        download(eid("url-input-area").value);
    }
}
async function download(url) {
    changeDownloadButton(2, '...');
    eid("url-clear").style.display = "none";
    eid("url-input-area").disabled = true;
    let req = {
        url: encodeURIComponent(url.split("&")[0].split('%')[0]),
        aFormat: sGet("aFormat").slice(0, 4),
    }
    if (sGet("audioMode") === "true") {
        req["isAudioOnly"] = true;
        req["isNoTTWatermark"] = true; // video tiktok no watermark
        if (sGet("fullTikTokAudio") === "true") req["isTTFullAudio"] = true; // audio tiktok full
    } else {
        req["vQuality"] = sGet("vQuality").slice(0, 4);
        if (sGet("muteAudio") === "true") req["isAudioMuted"] = true;
        if (url.includes("youtube.com/") || url.includes("/youtu.be/")) req["vFormat"] = sGet("vFormat").slice(0, 4);
        if ((url.includes("tiktok.com/") || url.includes("douyin.com/")) && sGet("disableTikTokWatermark") === "true") req["isNoTTWatermark"] = true;
    }
    await fetch('/api/json', { method: "POST", body: JSON.stringify(req), headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }).then(async (r) => {
        let j = await r.json();
        if (j.status !== "error" && j.status !== "rate-limit") {
            if (j.url || j.picker) {
                switch (j.status) {
                    case "redirect":
                        changeDownloadButton(2, '>>>');
                        setTimeout(() => { changeButton(1); }, 1500);
                        sGet("downloadPopup") === "true" ? popup('download', 1, j.url) : window.open(j.url, '_blank');
                        break;
                    case "picker":
                        if (j.audio && j.picker) {
                            changeDownloadButton(2, '?..')
                            fetch(`${j.audio}&p=1`).then(async (res) => {
                                let jp = await res.json();
                                if (jp.status === "continue") {
                                    changeDownloadButton(2, '>>>');
                                    popup('picker', 1, { audio: j.audio, arr: j.picker, type: j.pickerType });
                                    setTimeout(() => { changeButton(1) }, 2500);
                                } else {
                                    changeButton(0, jp.text);
                                }
                            }).catch((error) => internetError());
                        } else if (j.picker) {
                            changeDownloadButton(2, '>>>');
                            popup('picker', 1, { arr: j.picker, type: j.pickerType });
                            setTimeout(() => { changeButton(1) }, 2500);
                        } else {
                            changeButton(0, loc.noURLReturned);
                        }
                        break;
                    case "stream":
                        changeDownloadButton(2, '?..')
                        fetch(`${j.url}&p=1`).then(async (res) => {
                            let jp = await res.json();
                            if (jp.status === "continue") {
                                changeDownloadButton(2, '>>>'); window.location.href = j.url;
                                setTimeout(() => { changeButton(1) }, 2500);
                            } else {
                                changeButton(0, jp.text);
                            }
                        }).catch((error) => internetError());
                        break;
                    case "success":
                        changeButton(2, j.text);
                        break;
                    default:
                        changeButton(0, loc.unknownStatus);
                        break;
                }
            } else {
                if (j.status === "success") {
                    changeButton(2, j.text)
                } else changeButton(0, loc.noURLReturned);
            }
        } else {
            changeButton(0, j.text);
        }
    }).catch((error) => internetError());
}
async function loadOnDemand(elementId, blockId) {
    store.historyButton = eid(elementId).innerHTML;
    let j = {}
    eid(elementId).innerHTML = "..."
    try {
        if (store.historyContent) {
            j = store.historyContent;
        } else {
            await fetch(`/api/onDemand?blockId=${blockId}`).then(async (r) => {
                j = await r.json();
                if (j.status === "success") store.historyContent = j;
            })
        }
        if (j.status === "success" && j.status !== "rate-limit") {
            if (j.text) {
                eid(elementId).innerHTML = `<button class="switch bottom-margin" onclick="restoreUpdateHistory()">${loc.collapseHistory}</button>${j.text}`;
            } else {
                throw new Error()
            }
        } else {
            throw new Error()
        }
    } catch (e) {
        eid(elementId).innerHTML = store.historyButton;
        internetError()
    }
}
function restoreUpdateHistory() {
    eid("changelog-history").innerHTML = store.historyButton;
}
window.onload = () => {
    loadSettings();
    detectColorScheme();
    changeDownloadButton(0, '>>');
    eid("cobalt-main-box").style.visibility = 'visible';
    eid("footer").style.visibility = 'visible';
    eid("url-input-area").value = "";
    notificationCheck();
    if (isIOS) sSet("downloadPopup", "true");
    let urlQuery = new URLSearchParams(window.location.search).get("u");
    if (urlQuery !== null && regex.test(urlQuery)) {
        eid("url-input-area").value = urlQuery;
        button();
    }
}
eid("url-input-area").addEventListener("keydown", (event) => {
    if (event.key === 'Escape') eid("url-input-area").value = '';
    button();
})
eid("url-input-area").addEventListener("keyup", (event) => {
    if (event.key === 'Enter') eid("download-button").click();
})
document.onkeydown = (event) => {
    if (event.key === "Tab" || event.ctrlKey) eid("url-input-area").focus();
    if (event.key === 'Escape') hideAllPopups();
};