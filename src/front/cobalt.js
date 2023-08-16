const ua = navigator.userAgent.toLowerCase();
const isIOS = ua.match("iphone os");
const isMobile = ua.match("android") || ua.match("iphone os");
const isSafari = ua.match("safari/");
const isFirefox = ua.match("firefox/");
const isOldFirefox = ua.match("firefox/") && ua.split("firefox/")[1].split('.')[0] < 103;

const version = 33;
const regex = new RegExp(/https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/);
const notification = `<div class="notification-dot"></div>`;

const switchers = {
    "theme": ["auto", "light", "dark"],
    "vCodec": ["h264", "av1", "vp9"],
    "vQuality": ["1080", "max", "2160", "1440", "720", "480", "360"],
    "aFormat": ["mp3", "best", "ogg", "wav", "opus"],
    "dubLang": ["original", "auto"],
    "vimeoDash": ["false", "true"],
    "audioMode": ["false", "true"]
};
const checkboxes = ["disableTikTokWatermark", "fullTikTokAudio", "muteAudio", "reduceTransparency", "disableAnimations"];
const exceptions = { // used for mobile devices
    "vQuality": "720"
};
const bottomPopups = ["error", "download"]

let store = {};

function changeAPI(url) {
    apiURL = url;
    return true
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
    setTimeout(() => { e.classList.remove("text-backdrop") }, 600);
    data ? navigator.clipboard.writeText(data) : navigator.clipboard.writeText(e.innerText);
}
async function share(url) {
    try { await navigator.share({url: url}) } catch (e) {}
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
        tabcontent[i].dataset.enabled = "false";
    }
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].dataset.enabled = "false";
    }
    
    evnt.currentTarget.dataset.enabled = "true";
    eid(tabId).dataset.enabled = "true";

    if (tabId === "tab-about-changelog" && sGet("changelogStatus") !== `${version}`) notificationCheck("changelog");
    if (tabId === "tab-about-about" && !sGet("seenAbout")) notificationCheck("about");
}
function expandCollapsible(evnt) {
    let classlist = evnt.currentTarget.parentNode.classList;
    let c = "expanded";
    !classlist.contains(c) ? classlist.add(c) : classlist.remove(c);
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
        filter[i].classList.remove("visible");
    }
    eid("popup-backdrop").classList.remove("visible");
    store.isPopupOpen = false;

    // clear the picker
    eid("picker-holder").innerHTML = '';
    eid("picker-download").href = '/';
    eid("picker-download").classList.remove("visible");
}
function popup(type, action, text) {
    if (action === 1) {
        hideAllPopups(); // hide the previous popup before showing a new one
        store.isPopupOpen = true;
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
                eid("pd-share").setAttribute("onClick", `share('${text}')`);
                if (navigator.canShare) eid("pd-share").style.display = "flex";
                break;
            case "picker":
                switch (text.type) {
                    case "images":
                        eid("picker-title").innerHTML = loc.pickerImages;
                        eid("picker-subtitle").innerHTML = loc.pickerImagesExpl;

                        eid("popup-picker").classList.add("scrollable");
                        eid("picker-holder").classList.remove("various");

                        eid("picker-download").href = text.audio;
                        eid("picker-download").classList.add("visible");

                        for (let i in text.arr) {
                            eid("picker-holder").innerHTML += `<a class="picker-image-container"><img class="picker-image" src="${text.arr[i]["url"]}" onerror="this.parentNode.style.display='none'"></img></a>`
                        }
                        break;
                    default:
                        eid("picker-title").innerHTML = loc.pickerDefault;
                        eid("picker-subtitle").innerHTML = loc.pickerDefaultExpl;

                        eid("popup-picker").classList.remove("scrollable");
                        eid("picker-holder").classList.add("various");

                        for (let i in text.arr) {
                            let s = text.arr[i], item;
                            switch (s.type) {
                                case "video":
                                    item = `<div class="picker-image-container" onClick="${isIOS ? `share('${text.arr[i]["url"]}')` : `window.location.href='${text.arr[i]["url"]}'`}"><div class="picker-element-name">${Number(i)+1}</div><div class="imageBlock"></div><img class="picker-image" src="${text.arr[i]["thumb"]}" onerror="this.style.display='none'"></img></div>`
                                    break;
                            }
                            eid("picker-holder").innerHTML += item
                        }
                        eid("picker-download").classList.remove("visible");
                        break;
                }
                break;
            default:
                break;
        }
    } else {
        store.isPopupOpen = false;
        if (type === "picker") {
            eid("picker-download").href = '/';
            eid("picker-download").classList.remove("visible");
            eid("picker-holder").innerHTML = ''
        }
    }
    if (bottomPopups.includes(type)) eid(`popup-${type}-container`).classList.toggle("visible");
    eid("popup-backdrop").classList.toggle("visible");
    eid(`popup-${type}`).classList.toggle("visible");
    eid(`popup-${type}`).focus();
}
function changeSwitcher(li, b) {
    if (b) {
        if (!switchers[li].includes(b)) b = switchers[li][0];
        sSet(li, b);
        for (let i in switchers[li]) {
            (switchers[li][i] === b) ? enable(`${li}-${b}`) : disable(`${li}-${switchers[li][i]}`)
        }
        if (li === "theme") detectColorScheme();
    } else {
        let pref = switchers[li][0];
        if (isMobile && exceptions[li]) pref = exceptions[li];
        sSet(li, pref);
        for (let i in switchers[li]) {
            (switchers[li][i] === pref) ? enable(`${li}-${pref}`) : disable(`${li}-${switchers[li][i]}`)
        }
    }
}
function checkbox(action) {
    sSet(action, !!eid(action).checked);
    switch(action) {
        case "alwaysVisibleButton": button(); break;
        case "reduceTransparency": eid("cobalt-body").classList.toggle('no-transparency'); break;
        case "disableAnimations": eid("cobalt-body").classList.toggle('no-animation'); break;
    }
    action === "disableChangelog" && sGet(action) === "true" ? notificationCheck("disable") : notificationCheck();
}
function loadSettings() {
    if (sGet("alwaysVisibleButton") === "true") {
        eid("alwaysVisibleButton").checked = true;
        eid("download-button").value = '>>'
        eid("download-button").style.padding = '0 1rem';
    }
    if (sGet("downloadPopup") === "true" && !isIOS) {
        eid("downloadPopup").checked = true;
    }
    if (sGet("reduceTransparency") === "true" || isOldFirefox) {
        eid("cobalt-body").classList.toggle('no-transparency');
    }
    if (sGet("disableAnimations") === "true") {
        eid("cobalt-body").classList.toggle('no-animation');
    }
    for (let i = 0; i < checkboxes.length; i++) {
        if (sGet(checkboxes[i]) === "true") eid(checkboxes[i]).checked = true;
    }
    for (let i in switchers) {
        changeSwitcher(i, sGet(i))
    }
}
function changeButton(type, text) {
    switch (type) {
        case 0: //error
            eid("url-input-area").disabled = false
            eid("url-clear").style.display = "block";
            changeDownloadButton(2, '!!');
            popup("error", 1, text);
            setTimeout(() => { changeButton(1); }, 2500);
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
function internetError() {
    eid("url-input-area").disabled = false
    changeDownloadButton(2, '!!');
    setTimeout(() => { changeButton(1); }, 2500);
    popup("error", 1, loc.noInternet);
}
function resetSettings() {
    localStorage.clear();
    window.location.reload();
}
async function pasteClipboard() {
    try {
        let t = await navigator.clipboard.readText();
        if (regex.test(t)) {
            eid("url-input-area").value = t;
            download(eid("url-input-area").value);
        }
    } catch (e) {
        let errorMessage = loc.featureErrorGeneric;
        let doError = true;
        let error = String(e).toLowerCase();

        if (error.includes("denied")) errorMessage = loc.clipboardErrorNoPermission;
        if (error.includes("dismissed") || isIOS) doError = false;
        if (error.includes("function") && isFirefox) errorMessage = loc.clipboardErrorFirefox;

        if (doError) popup("error", 1, errorMessage);
    }
}
async function download(url) {
    changeDownloadButton(2, '...');
    eid("url-clear").style.display = "none";
    eid("url-input-area").disabled = true;
    let req = {
        url: encodeURIComponent(url.split("&")[0].split('%')[0]),
        aFormat: sGet("aFormat").slice(0, 4),
        dubLang: false
    }
    if (sGet("dubLang") === "auto") {
        req.dubLang = true
    } else if (sGet("dubLang") === "custom") {
        req.dubLang = true
    }
    if (sGet("vimeoDash") === "true") req.vimeoDash = true;
    if (sGet("audioMode") === "true") {
        req.isAudioOnly = true;
        req.isNoTTWatermark = true; // video tiktok no watermark
        if (sGet("fullTikTokAudio") === "true") req.isTTFullAudio = true; // audio tiktok full
    } else {
        req.vQuality = sGet("vQuality").slice(0, 4);
        if (sGet("muteAudio") === "true") req.isAudioMuted = true;
        if (url.includes("youtube.com/") || url.includes("/youtu.be/")) req.vCodec = sGet("vCodec").slice(0, 4);
        if ((url.includes("tiktok.com/") || url.includes("douyin.com/")) && sGet("disableTikTokWatermark") === "true") req.isNoTTWatermark = true;
    }

    let j = await fetch(`${apiURL}/api/json`, {
        method: "POST",
        body: JSON.stringify(req),
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
    }).then((r) => { return r.json() }).catch((e) => { return false });
    if (!j) {
        internetError();
        return
    }

    if (j && j.status !== "error" && j.status !== "rate-limit") {
        if (j.text && (!j.url || !j.picker)) {
            if (j.status === "success") {
                changeButton(2, j.text)
            } else changeButton(0, loc.noURLReturned);
        }
        switch (j.status) {
            case "redirect":
                changeDownloadButton(2, '>>>');
                setTimeout(() => { changeButton(1); }, 1500);
                sGet("downloadPopup") === "true" ? popup('download', 1, j.url) : window.open(j.url, '_blank');
                break;
            case "picker":
                if (j.audio && j.picker) {
                    changeDownloadButton(2, '>>>');
                    popup('picker', 1, { audio: j.audio, arr: j.picker, type: j.pickerType });
                    setTimeout(() => { changeButton(1) }, 2500);
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
                        changeDownloadButton(2, '>>>');
                        if (isMobile || isSafari) {
                            window.location.href = j.url;
                        } else window.open(j.url, '_blank');
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
    } else if (j && j.text) {
        changeButton(0, j.text);
    }
}
async function loadCelebrationsEmoji() {
    let bac = eid("about-footer").innerHTML;
    try {
        let j = await fetch(`/onDemand?blockId=1`).then((r) => { if (r.status === 200) { return r.json() } else { return false } }).catch(() => { return false });
        if (j && j.status === "success" && j.text) {
            eid("about-footer").innerHTML = eid("about-footer").innerHTML.replace('<img class="emoji" draggable="false" height="22" width="22" alt="🐲" src="emoji/dragon_face.svg" loading="lazy">', j.text);
        }
    } catch (e) {
        eid("about-footer").innerHTML = bac;
    }
}
async function loadOnDemand(elementId, blockId) {
    let j = {};
    store.historyButton = eid(elementId).innerHTML;
    eid(elementId).innerHTML = `<div class="loader">...</div>`;

    try {
        if (store.historyContent) {
            j = store.historyContent;
        } else {
            await fetch(`/onDemand?blockId=${blockId}`).then(async(r) => {
                j = await r.json();
                if (j && j.status === "success") {
                    store.historyContent = j;
                } else throw new Error();
            }).catch(() => { throw new Error() });
        }
        if (j.text) {
            eid(elementId).innerHTML = `<button class="switch bottom-margin" onclick="restoreUpdateHistory()">${loc.collapseHistory}</button>${j.text}`;
        } else throw new Error()
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
    notificationCheck();
    loadCelebrationsEmoji();
    if (isIOS) {
        sSet("downloadPopup", "true");
        eid("downloadPopup-chkbx").style.display = "none";
    }
    eid("url-input-area").value = "";

    eid("home").style.visibility = 'visible';
    eid("home").classList.toggle("visible");

    let urlQuery = new URLSearchParams(window.location.search).get("u");
    if (urlQuery !== null && regex.test(urlQuery)) {
        eid("url-input-area").value = urlQuery;
        button();
    }
}
eid("url-input-area").addEventListener("keydown", (e) => {
    button();
})
eid("url-input-area").addEventListener("keyup", (e) => {
    if (e.key === 'Enter') eid("download-button").click();
})
document.onkeydown = (e) => {
    if (!store.isPopupOpen) {
        if (e.ctrlKey || e.key === "/") eid("url-input-area").focus();
        if (e.key === "Escape" || e.key === "Clear") clearInput();

        // top buttons
        if (e.key === "D") pasteClipboard();
        if (e.key === "K") changeSwitcher('audioMode', 'false');
        if (e.key === "L") changeSwitcher('audioMode', 'true');
        
        // popups
        if (e.key === "B") popup('about', 1, 'about'); // open about
        if (e.key === "N") popup('about', 1, 'changelog'); // open changelog
        if (e.key === "M") popup('settings', 1);
        
    } else {
        if (e.key === "Escape") hideAllPopups();
    }
}
