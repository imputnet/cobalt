const ua = navigator.userAgent.toLowerCase();
const isIOS = ua.includes("iphone os") || (ua.includes("mac os") && navigator.maxTouchPoints > 0);
const isAndroid = ua.includes("android");
const isMobile = ua.includes("android") || isIOS;
const isSafari = ua.includes("safari/");
const isFirefox = ua.includes("firefox/");
const isOldFirefox = ua.includes("firefox/") && ua.split("firefox/")[1].split('.')[0] < 103;

const switchers = {
    "theme": ["auto", "light", "dark"],
    "vCodec": ["h264", "av1", "vp9"],
    "vQuality": ["720", "max", "2160", "1440", "1080", "480", "360", "240", "144"],
    "aFormat": ["mp3", "best", "ogg", "wav", "opus"],
    "audioMode": ["false", "true"],
    "filenamePattern": ["classic", "pretty", "basic", "nerdy"]
}
const checkboxes = [
    "alwaysVisibleButton",
    "downloadPopup",
    "fullTikTokAudio",
    "muteAudio",
    "reduceTransparency",
    "disableAnimations",
    "disableMetadata",
    "twitterGif",
    "plausible_ignore",
    "ytDub",
    "tiktokH265"
]
const bottomPopups = ["error", "download"]

let store = {};

const validLink = (link) => {
    try {
        return /^https:/i.test(new URL(link).protocol);
    } catch {
        return false
    }
}

const fixApiUrl = (url) => {
    return url.endsWith('/') ? url.slice(0, -1) : url
}

let apiURL = fixApiUrl(defaultApiUrl);

const changeApi = (url) => {
    apiURL = fixApiUrl(url);
    return true
}

const eid = (id) => {
    return document.getElementById(id)
}

const sGet = (id) =>{
    return localStorage.getItem(id)
}
const sSet = (id, value) => {
    localStorage.setItem(id, value)
}
const lazyGet = (key) => {
    const value = sGet(key);
    if (key in switchers) {
        if (switchers[key][0] !== value)
            return value;
    } else if (checkboxes.includes(key)) {
        if (value === 'true')
            return true;
    }
}

const changeDownloadButton = (action, text) => {
    switch (action) {
        case "hidden": // hidden, but only visible when alwaysVisibleButton is true
            eid("download-button").disabled = true
            if (sGet("alwaysVisibleButton") === "true") {
                eid("download-button").value = '>>'
                eid("download-button").style.padding = '0 1rem'
            } else {
                eid("download-button").value = ''
                eid("download-button").style.padding = '0'
            }
            break;
        case "disabled":
            eid("download-button").disabled = true
            eid("download-button").value = text
            eid("download-button").style.padding = '0 1rem'
            break;
        default:
            eid("download-button").disabled = false
            eid("download-button").value = '>>'
            eid("download-button").style.padding = '0 1rem'
            break;
    }
}

const button = () => {
    let regexTest = validLink(eid("url-input-area").value);

    eid("url-clear").style.display = "none";

    if ((eid("url-input-area").value).length > 0) {
        eid("url-clear").style.display = "block";
    }

    if (regexTest) {
        changeDownloadButton()
    } else {
        changeDownloadButton("hidden")
    }
}

const clearInput = () => {
    eid("url-input-area").value = '';
    button();
}

const copy = (id, data) => {
    let target = document.getElementById(id);
    target.classList.add("text-backdrop");

    setTimeout(() => {
        target.classList.remove("text-backdrop")
    }, 600);

    if (data) {
        navigator.clipboard.writeText(data)
    } else {
        navigator.clipboard.writeText(target.textContent)
    }
}

const share = url => navigator?.share({ url }).catch(() => {});

const preferredColorScheme = () => {
    let theme = "auto";
    let localTheme = sGet("theme");
    let isLightPreferred = false;

    if (localTheme) {
        theme = localTheme;
    }
    if (window.matchMedia) {
        isLightPreferred = window.matchMedia('(prefers-color-scheme: light)').matches;
    }
    if (theme === "auto") {
        theme = isLightPreferred ? "light" : "dark"
    }

    return theme
}

const changeStatusBarColor = () => {
    const theme = preferredColorScheme();
    const colors = {
        "dark": "#000000",
        "light": "#ffffff",
        "dark-popup": "#151515",
        "light-popup": "#ebebeb"
    }

    let state = store.isPopupOpen ? "dark-popup" : "dark";

    if (theme === "light") {
        state = store.isPopupOpen ? "light-popup" : "light";
    }

    document.querySelector('meta[name="theme-color"]').setAttribute('content', colors[state]);
}
const detectColorScheme = () => {
    document.documentElement.setAttribute("data-theme", preferredColorScheme());
    changeStatusBarColor();
}

if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
        changeStatusBarColor()
        detectColorScheme()
    })
}

const updateFilenamePreview = () => {
    let videoFilePreview = ``;
    let audioFilePreview = ``;
    let resMatch = {
        "max": "3840x2160",
        "2160": "3840x2160",
        "1440": "2560x1440",
        "1080": "1920x1080",
        "720": "1280x720",
        "480": "854x480",
        "360": "640x360",
    }

    switch(sGet("filenamePattern")) {
        case "classic":
            videoFilePreview = `youtube_dQw4w9WgXcQ_${resMatch[sGet('vQuality')]}_${sGet('vCodec')}`
                + `${sGet("muteAudio") === "true" ? "_mute" : ""}`
                + `.${sGet('vCodec') === "vp9" ? 'webm' : 'mp4'}`;
            audioFilePreview = `youtube_dQw4w9WgXcQ_audio`
                + `.${sGet('aFormat') !== "best" ? sGet('aFormat') : 'opus'}`;
            break;
        case "basic":
            videoFilePreview = `${loc.FilenamePreviewVideoTitle} `
                + `(${sGet('vQuality') === "max" ? "2160p" : `${sGet('vQuality')}p`}, `
                + `${sGet('vCodec')}${sGet("muteAudio") === "true" ? ", mute" : ""})`
                + `.${sGet('vCodec') === "vp9" ? 'webm' : 'mp4'}`;
            audioFilePreview = `${loc.FilenamePreviewAudioTitle} - ${loc.FilenamePreviewAudioAuthor}`
                + `.${sGet('aFormat') !== "best" ? sGet('aFormat') : 'opus'}`;
            break;
        case "pretty":
            videoFilePreview = `${loc.FilenamePreviewVideoTitle} `
                + `(${sGet('vQuality') === "max" ? "2160p" : `${sGet('vQuality')}p`}, ${sGet('vCodec')}, `
                + `${sGet("muteAudio") === "true" ? "mute, " : ""}youtube)`
                + `.${sGet('vCodec') === "vp9" ? 'webm' : 'mp4'}`;
            audioFilePreview = `${loc.FilenamePreviewAudioTitle} - ${loc.FilenamePreviewAudioAuthor} (soundcloud)`
                + `.${sGet('aFormat') !== "best" ? sGet('aFormat') : 'opus'}`;
            break;
        case "nerdy":
            videoFilePreview = `${loc.FilenamePreviewVideoTitle} `
                + `(${sGet('vQuality') === "max" ? "2160p" : `${sGet('vQuality')}p`}, ${sGet('vCodec')}, `
                + `${sGet("muteAudio") === "true" ? "mute, " : ""}youtube, dQw4w9WgXcQ)`
                + `.${sGet('vCodec') === "vp9" ? 'webm' : 'mp4'}`;
            audioFilePreview = `${loc.FilenamePreviewAudioTitle} - ${loc.FilenamePreviewAudioAuthor} `
                + `(soundcloud, 1242868615)`
                + `.${sGet('aFormat') !== "best" ? sGet('aFormat') : 'opus'}`;
            break;
    }
    eid("video-filename-text").innerHTML = videoFilePreview
    eid("audio-filename-text").innerHTML = audioFilePreview
}

const changeTab = (evnt, tabId, tabClass) => {
    if (tabId === "tab-settings-other") updateFilenamePreview();

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
    eid(tabId).parentElement.scrollTop = 0;
}

const expandCollapsible = (evnt) => {
    let classlist = evnt.currentTarget.parentNode.classList;
    let c = "expanded";
    !classlist.contains(c) ? classlist.add(c) : classlist.remove(c);
}

const hideAllPopups = () => {
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

const popup = (type, action, text) => {
    if (action === 1) {
        hideAllPopups(); // hide the previous popup before showing a new one
        store.isPopupOpen = true;

        // if not a small popup, update status bar color to match the popup header
        if (!bottomPopups.includes(type)) changeStatusBarColor();
        switch (type) {
            case "about":
                let tabId = "about";
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
                eid("picker-title").innerHTML = loc.MediaPickerTitle;
                eid("picker-subtitle").innerHTML = isMobile ? loc.MediaPickerExplanationPhone : loc.MediaPickerExplanationPC;

                switch (text.type) {
                    case "images":
                        eid("picker-holder").classList.remove("various");

                        eid("picker-download").href = text.audio;
                        eid("picker-download").classList.add("visible");

                        for (let i in text.arr) {
                            eid("picker-holder").innerHTML +=
                            `<a class="picker-image-container" ${
                                isIOS ? `onClick="share('${text.arr[i]["url"]}')"` : `href="${text.arr[i]["url"]}" target="_blank"`
                            }>` +
                                `<img class="picker-image" src="${text.arr[i]["url"]}" onerror="this.parentNode.style.display='none'">` +
                            `</a>`
                        }
                        break;
                    default:
                        eid("picker-holder").classList.add("various");

                        for (let i in text.arr) {
                            eid("picker-holder").innerHTML +=
                            `<a class="picker-image-container" ${
                                isIOS ? `onClick="share('${text.arr[i]["url"]}')"` : `href="${text.arr[i]["url"]}" target="_blank"`
                            }>` + 
                                `<div class="picker-element-name">${text.arr[i].type}</div>` +
                                (text.arr[i].type === 'photo' ? '' : '<div class="imageBlock"></div>') +
                                `<img class="picker-image" src="${text.arr[i]["thumb"]}" onerror="this.style.display='none'">` +
                            `</a>`
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

        // reset status bar to base color 
        changeStatusBarColor();

        if (type === "picker") {
            eid("picker-download").href = '/';
            eid("picker-download").classList.remove("visible");
            eid("picker-holder").innerHTML = ''
        }
    }
    if (bottomPopups.includes(type)) {
        eid(`popup-${type}-container`).classList.toggle("visible");
    }
    eid("popup-backdrop").classList.toggle("visible");
    eid(`popup-${type}`).classList.toggle("visible");
    eid(`popup-${type}`).focus();
}

const changeSwitcher = (switcher, state) => {
    if (state) {
        if (!switchers[switcher].includes(state)) {
            state = switchers[switcher][0];
        }
        sSet(switcher, state);

        for (let i in switchers[switcher]) {
            if (switchers[switcher][i] === state) {
                eid(`${switcher}-${state}`).dataset.enabled = "true";
            } else {
                eid(`${switcher}-${switchers[switcher][i]}`).dataset.enabled = "false";
            }
        }
        if (switcher === "theme") detectColorScheme();
        if (switcher === "filenamePattern") updateFilenamePreview();
    } else {
        let defaultValue = switchers[switcher][0];
        sSet(switcher, defaultValue);
        for (let i in switchers[switcher]) {
            if (switchers[switcher][i] === defaultValue) {
                eid(`${switcher}-${defaultValue}`).dataset.enabled = "true";
            } else {
                eid(`${switcher}-${switchers[switcher][i]}`).dataset.enabled = "false";
            }
        }
    }
}

const checkbox = (action) => {
    sSet(action, !!eid(action).checked);
    switch(action) {
        case "alwaysVisibleButton": button(); break;
        case "reduceTransparency": eid("cobalt-body").classList.toggle('no-transparency'); break;
        case "disableAnimations": eid("cobalt-body").classList.toggle('no-animation'); break;
    }
}

const changeButton = (type, text) => {
    switch (type) {
        case "error": //error
            eid("url-input-area").disabled = false
            eid("url-clear").style.display = "block";
            changeDownloadButton("disabled", '!!');
            popup("error", 1, text);
            setTimeout(() => { changeButton("default") }, 2500);
            break;
        case "default": //enable back
            changeDownloadButton();
            eid("url-clear").style.display = "block";
            eid("url-input-area").disabled = false
            break;
        case "error-default": //enable back + information popup
            popup("error", 1, text);
            changeDownloadButton();
            eid("url-clear").style.display = "block";
            eid("url-input-area").disabled = false
            break;
    }
}

const internetError = () => {
    eid("url-input-area").disabled = false
    changeDownloadButton("disabled", '!!');
    setTimeout(() => { changeButton("default") }, 2500);
    popup("error", 1, loc.ErrorNoInternet);
}

const resetSettings = () => {
    localStorage.clear();
    window.location.reload();
}

const download = async(url) => {
    changeDownloadButton("disabled", '...');

    eid("url-clear").style.display = "none";
    eid("url-input-area").disabled = true;

    let req = {
        url,
        vCodec: lazyGet("vCodec"),
        vQuality: lazyGet("vQuality"),
        aFormat: lazyGet("aFormat"),
        filenamePattern: lazyGet("filenamePattern"),
        isAudioOnly: lazyGet("audioMode"),
        isTTFullAudio: lazyGet("fullTikTokAudio"),
        isAudioMuted: lazyGet("muteAudio"),
        disableMetadata: lazyGet("disableMetadata"),
        dubLang: lazyGet("ytDub"),
        twitterGif: lazyGet("twitterGif"),
        tiktokH265: lazyGet("tiktokH265"),
    }

    let j = await fetch(`${apiURL}/api/json`, {
        method: "POST",
        body: JSON.stringify(req),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(r => r.json()).catch(() => {});

    if (!j) {
        internetError();
        return;
    }

    if ((j.status === "error" || j.status === "rate-limit") && j && j.text) {
        changeButton("error", j.text);
        return;
    }

    if (j.text && (!j.url || !j.picker)) {
        if (j.status === "success") {
            changeButton("error-default", j.text)
        } else {
            changeButton("error", loc.ErrorNoUrlReturned);
        }
    }
    switch (j.status) {
        case "redirect":
            changeDownloadButton("disabled", '>>>');
            setTimeout(() => { changeButton("default") }, 1500);

            if (sGet("downloadPopup") === "true") {
                popup('download', 1, j.url)
            } else {
                window.open(j.url, '_blank')
            }
            break;
        case "stream":
            changeDownloadButton("disabled", '?..');

            let probeStream = await fetch(`${j.url}&p=1`).then(r => r.json()).catch(() => {});
            if (!probeStream) return internetError();

            if (probeStream.status !== "continue") {
                changeButton("error", probeStream.text);
                return;
            }

            changeDownloadButton("disabled", '>>>');
            if (sGet("downloadPopup") === "true") {
                popup('download', 1, j.url)
            } else {
                if (isMobile || isSafari) {
                    window.location.href = j.url;
                } else {
                    window.open(j.url, '_blank');
                }
            }
            setTimeout(() => { changeButton("default") }, 2500);
            break;
        case "picker":
            if (j.audio && j.picker) {
                changeDownloadButton("disabled", '>>>');
                popup('picker', 1, {
                    audio: j.audio,
                    arr: j.picker,
                    type: j.pickerType
                });
                setTimeout(() => { changeButton("default") }, 2500);
            } else if (j.picker) {
                changeDownloadButton("disabled", '>>>');
                popup('picker', 1, {
                    arr: j.picker,
                    type: j.pickerType
                });
                setTimeout(() => { changeButton("default") }, 2500);
            } else {
                changeButton("error", loc.ErrorNoUrlReturned);
            }
            break;
        case "success":
            changeButton("error-default", j.text);
            break;
        default:
            changeButton("error", loc.ErrorUnknownStatus);
            break;
    }
}

const pasteClipboard = async() => {
    try {
        let clipboard = await navigator.clipboard.readText();
        let onlyURL = clipboard.match(/https:\/\/[^\s]+/g)
        if (onlyURL) {
            eid("url-input-area").value = onlyURL;
            download(eid("url-input-area").value);
        }
    } catch (e) {
        let errorMessage = loc.FeatureErrorGeneric;
        let doError = true;
        let error = String(e).toLowerCase();

        if (error.includes("denied")) errorMessage = loc.ClipboardErrorNoPermission;
        if (error.includes("dismissed") || isIOS) doError = false;
        if (error.includes("function") && isFirefox) errorMessage = loc.ClipboardErrorFirefox;

        if (doError) popup("error", 1, errorMessage);
    }
}

const loadCelebrationsEmoji = async() => {
    let aboutButtonBackup = eid("about-footer").innerHTML;
    try {
        let j = await fetch(`/onDemand?blockId=1`).then(r => r.json()).catch(() => {});
        if (j && j.status === "success" && j.text) {
            eid("about-footer").innerHTML = eid("about-footer").innerHTML.replace(
                `${aboutButtonBackup.split('> ')[0]}>`,
                j.text
            )
        }
    } catch {
        eid("about-footer").innerHTML = aboutButtonBackup;
    }
}

const loadOnDemand = async(elementId, blockId) => {
    store.historyButton = eid(elementId).innerHTML;
    eid(elementId).innerHTML = `<div class="loader">...</div>`;

    try {
        if (!store.historyContent) {
            let j = await fetch(`/onDemand?blockId=${blockId}`).then(r => r.json()).catch(() => {});
            if (!j) throw new Error();

            if (j.status === "success") {
                store.historyContent = j.text
            }
        }
        eid(elementId).innerHTML =
            `<button class="switch bottom-margin" onclick="restoreUpdateHistory()">
                ${loc.ChangelogPressToHide}
            </button>
            ${store.historyContent}`;
    } catch {
        eid(elementId).innerHTML = store.historyButton;
        internetError()
    }
}

const restoreUpdateHistory = () => {
    eid("changelog-history").innerHTML = store.historyButton;
}

const loadSettings = () => {
    if (sGet("alwaysVisibleButton") === "true") {
        eid("alwaysVisibleButton").checked = true;
        eid("download-button").value = '>>'
        eid("download-button").style.padding = '0 1rem';
    }
    if (sGet("downloadPopup") === "true" && !isIOS) {
        eid("downloadPopup").checked = true;
    }
    if (sGet("reduceTransparency") === "true" || isOldFirefox) {
        eid("cobalt-body").classList.add('no-transparency');
    }
    if (sGet("disableAnimations") === "true") {
        eid("cobalt-body").classList.add('no-animation');
    }
    if (!isMobile) {
        eid("cobalt-body").classList.add('desktop');
    }
    if (isAndroid) {
        eid("cobalt-body").classList.add('android');
    }
    if (isIOS) {
        eid("download-switcher")
            .querySelector(".explanation")
            .innerHTML = loc.DownloadPopupDescriptionIOS;
    }
    for (let i = 0; i < checkboxes.length; i++) {
        try {
            if (sGet(checkboxes[i]) === "true") eid(checkboxes[i]).checked = true;
        }
        catch {
            console.error(`checkbox ${checkboxes[i]} failed to initialize`)
        }
    }
    for (let i in switchers) {
        changeSwitcher(i, sGet(i))
    }
    updateFilenamePreview()
}

window.onload = () => {
    loadCelebrationsEmoji();

    loadSettings();
    detectColorScheme();

    changeDownloadButton("hidden");
    eid("url-input-area").value = "";

    if (isIOS) {
        sSet("downloadPopup", "true");
        eid("downloadPopup-chkbx").style.display = "none";
    }

    eid("home").style.visibility = 'visible';
    eid("home").classList.toggle("visible");

    const pageQuery = new URLSearchParams(window.location.search);
    if (pageQuery.has("u") && validLink(pageQuery.get("u"))) {
        eid("url-input-area").value = pageQuery.get("u");
        button()
    }
    window.history.replaceState(null, '', window.location.pathname);

    // fix for animations not working in Safari
    if (isIOS) {
        document.addEventListener('touchstart', () => {}, true);
    }
}

eid("url-input-area").addEventListener("keydown", () => {
    button();
})
eid("url-input-area").addEventListener("keyup", (e) => {
    if (e.key === 'Enter') eid("download-button").click();
})

document.addEventListener("keydown", (event) => {
    if (event.key === "Tab") {
        eid("download-button").value = '>>'
        eid("download-button").style.padding = '0 1rem'
    }
})
document.onkeydown = (e) => {
    if (!store.isPopupOpen) {
        if (e.metaKey || e.ctrlKey || e.key === "/") eid("url-input-area").focus();
        if (e.key === "Escape" || e.key === "Clear") clearInput();

        if (e.target === eid("url-input-area")) return;

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
