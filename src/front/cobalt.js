let isIOS = navigator.userAgent.toLowerCase().match("iphone os");
let version = 12;
let regex = new RegExp(/https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/);
let notification = `<div class="notification-dot"></div>`

let switchers = {
    "theme": ["auto", "light", "dark"],
    "ytFormat": ["webm", "mp4"],
    "quality": ["max", "hig", "mid", "low"],
    "audioFormat": ["best", "mp3", "ogg", "wav", "opus"]
}
let checkboxes = ["disableTikTokWatermark", "fullTikTokAudio", "disableClipboardButton"];
let exceptions = { // used solely for ios devices, because they're generally less capable
    "ytFormat": "mp4",
    "audioFormat": "mp3"
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
    return state == "true" ? "false" : "true";
}
function changeDownloadButton(action, text) {
    switch (action) {
        case 0:
            eid("download-button").disabled = true
            if (sGet("alwaysVisibleButton") == "true") {
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
    if (event.key == "Tab") {
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
    if (tabId == "tab-about-changelog" && sGet("changelogStatus") != `${version}`) notificationCheck("changelog");
    if (tabId == "tab-about-about" && !sGet("seenAbout")) notificationCheck("about");
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
    if (changed && sGet("changelogStatus") == `${version}` || type == "disable") {
        setTimeout(() => {
            eid("about-footer").innerHTML = eid("about-footer").innerHTML.replace(notification, '');
            eid("tab-button-about-changelog").innerHTML = eid("tab-button-about-changelog").innerHTML.replace(notification, '')
        }, 900)
    }
    if (sGet("disableChangelog") != "true") {
        if (!sGet("seenAbout") && !eid("about-footer").innerHTML.includes(notification)) eid("about-footer").innerHTML = `${notification}${eid("about-footer").innerHTML}`;
        if (sGet("changelogStatus") != `${version}`) {
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
    eid("imagepicker-holder").innerHTML = '';
    eid("imagepicker-download").href = '/';
    eid("popup-backdrop").style.visibility = "hidden";
}
function popup(type, action, text) {
    if (action == 1) {
        hideAllPopups(); // hide the previous popup before showing a new one
        switch (type) {
            case "about":
                let tabId = sGet("seenAbout") ? "changelog" : "about";
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
            case "imagePicker":
                eid("imagepicker-download").href = text.url;
                for (let i in text.images) {
                    eid("imagepicker-holder").innerHTML += `<div class="imagepicker-image-container"><img class="imagepicker-image" src="${text.images[i]}" onerror="this.parentNode.style.display='none'"></img></div>`
                }
                break;
            default:
                break;
        }
    } else {
        if (type == "imagePicker") {
            eid("imagepicker-download").href = '/';
            eid("imagepicker-holder").innerHTML = ''
        }
    }
    eid("popup-backdrop").style.visibility = vis(action);
    eid(`popup-${type}`).style.visibility = vis(action);
}
function changeSwitcher(li, b) {
    if (b) {
        sSet(li, b);
        for (let i in switchers[li]) {
            (switchers[li][i] == b) ? enable(`${li}-${b}`) : disable(`${li}-${switchers[li][i]}`)
        }
        if (li == "theme") detectColorScheme();
    } else {
        let pref = switchers[li][0];
        if (isIOS && exceptions[li]) pref = exceptions[li];
        sSet(li, pref);
        for (let i in switchers[li]) {
            (switchers[li][i] == pref) ? enable(`${li}-${pref}`) : disable(`${li}-${switchers[li][i]}`)
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
        if (action == "alwaysVisibleButton") button();
        if (action == "disableClipboardButton") eid("pasteFromClipboard").style.display = "none";
    } else {
        sSet(action, "false");
        if (action == "alwaysVisibleButton") button();
        if (action == "disableClipboardButton") eid("pasteFromClipboard").style.display = "flex";
    }
    sGet(action) == "true" ? notificationCheck("disable") : notificationCheck();
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
        if (opposite(state) == "true") sSet(`${toggl}ToggledOnce`, "true");
    } else {
        sSet(toggl, "false")
    }
    updateToggle(toggl, sGet(toggl))
}
function loadSettings() {
    try {
        if (typeof(navigator.clipboard.readText) == "undefined") throw new Error();
    } catch (err) {
        eid("disableClipboardButton-chkbx").style.display = "none";
        sSet("disableClipboardButton", "true")
    }
    if (sGet("disableClipboardButton") == "true") eid("pasteFromClipboard").style.display = "none";
    if (sGet("alwaysVisibleButton") == "true") {
        eid("alwaysVisibleButton").checked = true;
        eid("download-button").value = '>>'
        eid("download-button").style.padding = '0 1rem';
    }
    if (sGet("downloadPopup") == "true" && !isIOS) {
        eid("downloadPopup").checked = true;
    }
    if (!sGet("audioMode")) {
        toggle("audioMode")
    }
    for (let i = 0; i < checkboxes.length; i++) {
        if (sGet(checkboxes[i]) == "true") eid(checkboxes[i]).checked = true;
    }
    updateToggle("audioMode", sGet("audioMode"));
    for (let i in switchers) {
        changeSwitcher(i, sGet(i))
    }
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
    let audioMode = sGet("audioMode");
    let format = ``;
    if (audioMode == "false") {
        if (url.includes("youtube.com/") || url.includes("/youtu.be/")) {
            format = `&format=${sGet("ytFormat")}`
        } else if ((url.includes("tiktok.com/") || url.includes("douyin.com/")) && sGet("disableTikTokWatermark") == "true") {
            format = `&nw=true`
        }
    } else {
        format = `&nw=true`
        if (sGet("fullTikTokAudio") == "true") format += `&ttfull=true`
    }
    let mode = (sGet("audioMode") == "true") ? `audio=true` : `quality=${sGet("quality")}`
    await fetch(`/api/json?audioFormat=${sGet("audioFormat")}&${mode}${format}&url=${encodeURIComponent(url)}`).then(async (r) => {
        let j = await r.json();
        if (j.status != "error" && j.status != "rate-limit") {
            if (j.url) {
                switch (j.status) {
                    case "redirect":
                        changeDownloadButton(2, '>>>')
                        setTimeout(() => {
                            changeDownloadButton(1, '>>');
                            eid("url-clear").style.display = "block";
                            eid("url-input-area").disabled = false
                        }, 3000)
                        if (sGet("downloadPopup") == "true") {
                            popup('download', 1, j.url)
                        } else {
                            window.open(j.url, '_blank');
                        }
                        break;
                    case "images":
                    case "stream":
                        changeDownloadButton(2, '?..')
                        fetch(`${j.url}&p=1&origin=front`).then(async (res) => {
                            let jp = await res.json();
                            if (jp.status == "continue") {
                                changeDownloadButton(2, '>>>')
                                if (j.status === "images") {
                                    popup('imagePicker', 1, {
                                        url: j.url,
                                        images: j.images
                                    })
                                } else {
                                    window.location.href = j.url
                                }
                                setTimeout(() => {
                                    changeDownloadButton(1, '>>');
                                    eid("url-clear").style.display = "block";
                                    eid("url-input-area").disabled = false
                                }, 5000)
                            } else {
                                eid("url-input-area").disabled = false
                                changeDownloadButton(2, '!!');
                                eid("url-clear").style.display = "block";
                                popup("error", 1, jp.text);
                            }
                        }).catch((error) => internetError());
                        break;
                    default:
                        eid("url-input-area").disabled = false
                        changeDownloadButton(2, '!!');
                        eid("url-clear").style.display = "block";
                        popup("error", 1, loc.unknownStatus);
                        break;
                }
            } else {
                eid("url-input-area").disabled = false
                eid("url-clear").style.display = "block";
                changeDownloadButton(2, '!!')
                popup("error", 1, loc.noURLReturned);
            }
        } else {
            eid("url-input-area").disabled = false
            eid("url-clear").style.display = "block";
            changeDownloadButton(2, '!!')
            popup("error", 1, j.text);
        }
    }).catch((error) => internetError());
}
async function loadOnDemand(elementId, blockId) {
    let store = eid(elementId).innerHTML;
    eid(elementId).innerHTML = "..."
    await fetch(`/api/onDemand?blockId=${blockId}`).then(async (r) => {
        let j = await r.json();
        if (j.status == "success" && j.status != "rate-limit") {
            if (j.text) {
                eid(elementId).innerHTML = j.text;
            } else {
                throw new Error()
            }
        } else {
            throw new Error()
        }
    }).catch((error) => {
        eid(elementId).innerHTML = store;
        internetError()
    });
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
    if (urlQuery !== null) {
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
    if (event.key == "Tab" || event.ctrlKey) eid("url-input-area").focus();
    if (event.key === 'Escape') hideAllPopups();
};