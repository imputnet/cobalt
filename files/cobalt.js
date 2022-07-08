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
document.addEventListener("keydown", function(event) {
    if (event.key == "Tab") {
        eid("download-button").value = '>>'
        eid("download-button").style.padding = '0 1rem'
    }
})
function button() {
    let regex = /https:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()!@:%_\+.~#?&\/\/=]*)/.test(eid("url-input-area").value);
    regex ? changeDownloadButton(1, '>>') : changeDownloadButton(0, '>>');
}
function copy(id) {
    let e = document.getElementById(id);
    e.classList.add("text-backdrop");
    navigator.clipboard.writeText(e.innerText);
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
function popup(type, action, text) {
    eid("popup-backdrop").style.visibility = vis(action);
    switch (type) {
        case "about":
            eid("popup-about").style.visibility = vis(action);
            if (!localStorage.getItem("seenAbout")) {
                localStorage.setItem("seenAbout", "true");
            }
            break;
        case "error":
            eid("desc-error").innerHTML = text;
            eid("popup-error").style.visibility = vis(action);
            break;
        case "settings":
            eid("popup-settings").style.visibility = vis(action);
            break;
        case "changelog":
            eid("popup-changelog").style.visibility = vis(action);
            break;
        case "donate":
            eid("popup-donate").style.visibility = vis(action);
            break;
    }
}
function changeSwitcher(li, b, u) {
    if (u) {
        localStorage.setItem(li, b);
    }
    let l = {
        "theme": ["auto", "light", "dark"],
        "youtubeFormat": ["mp4", "webm", "audio"],
        "quality": ["max", "hig", "mid", "low"]
    }
    if (b) {
        for (i in l[li]) {
            if (l[li][i] == b) {
                enable(`${li}-${b}`)
            } else {
                disable(`${li}-${l[li][i]}`)
            }
        }
        if (li == "theme") {
            detectColorScheme();
        }
    } else {
        localStorage.setItem(li, l[li][0]);
        for (i in l[li]) {
            if (l[li][i] == l[li][0]) {
                enable(`${li}-${l[li][0]}`)
            } else {
                disable(`${li}-${l[li][i]}`)
            }
        }
    }
}
function internetError() {
    eid("url-input-area").disabled = false
    changeDownloadButton(2, '!!')
    popup("error", 1, loc.noInternet);
}
function checkbox(action) {
    switch(action) {
        case 'alwaysVisibleButton':
            if (eid("always-visible-button").checked) {
                localStorage.setItem("alwaysVisibleButton", "true");
                button();
            } else {
                localStorage.setItem("alwaysVisibleButton", "false");
                button();
            }
            break;
    }
}
function loadSettings() {
    if (localStorage.getItem("alwaysVisibleButton") == "true") {
        eid("always-visible-button").checked = true;
        eid("download-button").value = '>>'
        eid("download-button").style.padding = '0 1rem';
    }
    changeSwitcher("theme", localStorage.getItem("theme"))
    changeSwitcher("youtubeFormat", localStorage.getItem("youtubeFormat"))
    changeSwitcher("quality", localStorage.getItem("quality"))
}
async function download(url) {
    changeDownloadButton(2, '...');
    eid("url-input-area").disabled = true;
    let format = '';
    if (url.includes(".youtube.com/") || url.includes("/youtu.be/")) {
        format = `&format=${localStorage.getItem("youtubeFormat")}`
    }
    fetch(`/api/json?quality=${localStorage.getItem("quality")}${format}&url=${encodeURIComponent(url)}`).then(async (response) => {
        let j = await response.json();
        if (j.status != "error" && j.status != "rate-limit") {
            switch (j.status) {
                case "redirect":
                    changeDownloadButton(2, '>>>')
                    setTimeout(() => {
                        changeDownloadButton(1, '>>')
                        eid("url-input-area").disabled = false
                    }, 3000)
                    if (navigator.userAgent.toLowerCase().match("iphone os")) {
                        window.location.href = j.url;
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
                    }).catch((error) => {
                        internetError()
                    });
                    break;
            }
        } else {
            eid("url-input-area").disabled = false
            changeDownloadButton(2, '!!')
            popup("error", 1, j.text);
        }
    }).catch((error) => {
        internetError()
    });
}
window.onload = function () {
    loadSettings();
    detectColorScheme();
    changeDownloadButton(0, '>>');
    eid("cobalt-main-box").style.visibility = 'visible';
    eid("footer").style.visibility = 'visible';
    eid("url-input-area").value = "";
    if (!localStorage.getItem("seenAbout")) {
        popup('about', 1)
    }
}
eid("url-input-area").addEventListener("keyup", (event) => {
    if (event.key === 'Enter') {
        eid("download-button").click();
    }
})