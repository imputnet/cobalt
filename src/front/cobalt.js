let isIOS = navigator.userAgent.toLowerCase().match("iphone os");
let version = 3

let switchers = {
    "theme": ["auto", "light", "dark"],
    "ytFormat": ["webm", "mp4"],
    "quality": ["max", "hig", "mid", "low"],
    "audioFormat": ["best", "mp3", "ogg", "wav", "opus"]
}
let exceptions = { // fuck you apple
    "ytFormat": "mp4",
    "audioFormat": "mp3"
}

function eid(id) {
    return document.getElementById(id)
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
            if (localStorage.getItem("alwaysVisibleButton") == "true") {
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
document.addEventListener("keydown", function (event) {
    if (event.key == "Tab") {
        eid("download-button").value = '>>'
        eid("download-button").style.padding = '0 1rem'
    }
})
function button() {
    let regex = /https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/.test(eid("url-input-area").value);
    regex ? changeDownloadButton(1, '>>') : changeDownloadButton(0, '>>');
}
function copy(id, data) {
    let e = document.getElementById(id);
    e.classList.add("text-backdrop");
    data ? navigator.clipboard.writeText(data) : navigator.clipboard.writeText(e.innerText);
    setTimeout(() => { e.classList.remove("text-backdrop") }, 600);
}
function detectColorScheme() {
    let theme = "auto";
    let localTheme = localStorage.getItem("theme");
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
}
function hideAllPopups() {
    let filter = document.getElementsByClassName('popup');
    for (let i = 0; i < filter.length; i++) {
        filter[i].style.visibility = "hidden";
    }
    eid("popup-backdrop").style.visibility = "hidden";
}
function popup(type, action, text) {
    eid("popup-backdrop").style.visibility = vis(action);
    switch (type) {
        case "about":
            let tabId = text ? text : "changelog";
            if (tabId == "changelog") {
                localStorage.setItem("changelogStatus", version)
            }
            eid(`tab-button-${type}-${tabId}`).click();
            eid("popup-about").style.visibility = vis(action);
            if (!localStorage.getItem("seenAbout")) localStorage.setItem("seenAbout", "true");
            break;
        case "settings":
            eid(`tab-button-${type}-video`).click();
            eid("popup-settings").style.visibility = vis(action);
            break;
        case "error":
            eid("desc-error").innerHTML = text;
            eid("popup-error").style.visibility = vis(action);
            break;
        case "download":
            if (action == 1) {
                eid("pd-download").href = text;
                eid("pd-copy").setAttribute("onClick", `copy('pd-copy', '${text}')`);
            }
            eid("popup-download").style.visibility = vis(action);
            break;
        default:
            eid(`popup-${type}`).style.visibility = vis(action);
            break;
    }
}
function changeSwitcher(li, b) {
    if (b) {
        localStorage.setItem(li, b);
        for (i in switchers[li]) {
            (switchers[li][i] == b) ? enable(`${li}-${b}`) : disable(`${li}-${switchers[li][i]}`)
        }
        if (li == "theme") detectColorScheme();
    } else {
        let pref = switchers[li][0];
        localStorage.setItem(li, pref);
        if (isIOS && exceptions[li]) pref = exceptions[li];
        for (i in switchers[li]) {
            (switchers[li][i] == pref) ? enable(`${li}-${pref}`) : disable(`${li}-${switchers[li][i]}`)
        }
    }
}
function internetError() {
    eid("url-input-area").disabled = false
    changeDownloadButton(2, '!!')
    popup("error", 1, loc.noInternet);
}
function checkbox(action) {
    if (eid(action).checked) {
        localStorage.setItem(action, "true");
        if (action == "alwaysVisibleButton") button();
    } else {
        localStorage.setItem(action, "false");
        if (action == "alwaysVisibleButton") button();
    }
}
function loadSettings() {
    if (localStorage.getItem("alwaysVisibleButton") == "true") {
        eid("alwaysVisibleButton").checked = true;
        eid("download-button").value = '>>'
        eid("download-button").style.padding = '0 1rem';
    }
    if (localStorage.getItem("downloadPopup") == "true" && !isIOS) {
        eid("downloadPopup").checked = true;
    }
    if (!localStorage.getItem("audioMode")) {
        toggle("audioMode")
    }
    updateToggle("audioMode", localStorage.getItem("audioMode"))
    for (let i in switchers) {
        changeSwitcher(i, localStorage.getItem(i))
    }
}
function checkbox(action) {
    if (eid(action).checked) {
        localStorage.setItem(action, "true");
        if (action == "alwaysVisibleButton") button();
    } else {
        localStorage.setItem(action, "false");
        if (action == "alwaysVisibleButton") button();
    }
}
function toggle(toggle) {
    let state = localStorage.getItem(toggle);
    if (state) {
        localStorage.setItem(toggle, opposite(state))
    } else {
        localStorage.setItem(toggle, "false")
    }
    updateToggle(toggle, localStorage.getItem(toggle))
}
function updateToggle(toggle, state) {
    switch(state) {
        case "true":
            eid(toggle).innerHTML = loc.toggleAudio;
            break;
        case "false":
            eid(toggle).innerHTML = loc.toggleDefault;
            break;
    }
}
async function download(url) {
    changeDownloadButton(2, '...');
    eid("url-input-area").disabled = true;
    let audioMode = localStorage.getItem("audioMode");
    let format = (url.includes("youtube.com/") && audioMode == "false" || url.includes("/youtu.be/") && audioMode == "false") ? `&format=${localStorage.getItem("ytFormat")}` : '';
    let mode = (localStorage.getItem("audioMode") == "true") ? `audio=true` : `quality=${localStorage.getItem("quality")}`;
    fetch(`/api/json?audioFormat=${localStorage.getItem("audioFormat")}&${mode}${format}&url=${encodeURIComponent(url)}`).then(async (response) => {
        let j = await response.json();
        if (j.status != "error" && j.status != "rate-limit") {
            if (j.url) {
                switch (j.status) {
                    case "redirect":
                        changeDownloadButton(2, '>>>')
                        setTimeout(() => {
                            changeDownloadButton(1, '>>')
                            eid("url-input-area").disabled = false
                        }, 3000)
                        if (localStorage.getItem("downloadPopup") == "true") {
                            popup('download', 1, j.url)
                        } else {
                            window.open(j.url, '_blank');
                        }
                        break;
                    case "stream":
                        changeDownloadButton(2, '?..')
                        fetch(`${j.url}&p=1&origin=front`).then(async (response) => {
                            let jp = await response.json();
                            if (jp.status == "continue") {
                                changeDownloadButton(2, '>>>')
                                window.location.href = j.url
                                setTimeout(() => {
                                    changeDownloadButton(1, '>>')
                                    eid("url-input-area").disabled = false
                                }, 5000)
                            } else {
                                eid("url-input-area").disabled = false
                                changeDownloadButton(2, '!!')
                                popup("error", 1, jp.text);
                            }
                        }).catch((error) => internetError());
                        break;
                }
            } else {
                eid("url-input-area").disabled = false
                changeDownloadButton(2, '!!')
                popup("error", 1, loc.noURLReturned);
            }
        } else {
            eid("url-input-area").disabled = false
            changeDownloadButton(2, '!!')
            popup("error", 1, j.text);
        }
    }).catch((error) => internetError());
}
window.onload = function () {
    loadSettings();
    detectColorScheme();
    changeDownloadButton(0, '>>');
    eid("cobalt-main-box").style.visibility = 'visible';
    eid("footer").style.visibility = 'visible';
    eid("url-input-area").value = "";
    if (!localStorage.getItem("seenAbout")) {
        popup('about', 1, "about");
    } else if (localStorage.getItem("changelogStatus") != `${version}` && localStorage.getItem("disableChangelog") != "true") {
        popup('about', 1, "changelog");
    }
    if (isIOS) localStorage.setItem("downloadPopup", "true");
}
eid("url-input-area").addEventListener("keyup", (event) => {
    if (event.key === 'Enter') eid("download-button").click();
})
document.onkeydown = function(event) {
    if (event.key === 'Escape') hideAllPopups();
};