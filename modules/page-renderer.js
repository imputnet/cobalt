import { services, appName, authorInfo, version, quality, repo, donations } from "./config.js";
import loc from "./sub/loc.js";

let s = services
let enabledServices = Object.keys(s).filter((p) => {
    if (s[p].enabled) {
        return true
    }
}).sort().map((p) => {
    if (s[p].alias) {
        return s[p].alias
    } else {
        return p
    }
}).join(', ')
let donate = ``
for (let i in donations) {
    donate += `<div class="subtitle">${i} (${loc("en", 'desc', 'clicktocopy').trim()})</div><div id="don-${i}" class="text-to-copy" onClick="copy('don-${i}')">${donations[i]}</div>`
}
export default function(obj) {
    let isIOS = obj.useragent.toLowerCase().match("iphone os")
    try {
        return `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=${isIOS ? `1` : `5`}" />

        <title>${appName}</title>

        <meta property="og:url" content="${process.env.selfURL}" />
        <meta property="og:title" content="${appName}" />
        <meta property="og:description" content="${loc(obj.lang, 'desc', 'embed')}" />
        <meta property="og:image" content="${process.env.selfURL}icons/generic.png" />
        <meta name="theme-color" content="#000000" />
        <meta name="twitter:card" content="summary" />

        <link rel="icon" type="image/x-icon" href="icons/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png" />

        <link rel="manifest" href="cobalt.webmanifest" />
        <link rel="stylesheet" href="cobalt.css" />
        <link rel="stylesheet" href="fonts/notosansmono/notosansmono.css" />

        <noscript><div style="margin: 2rem;">${loc(obj.lang, 'desc', 'noScript')}</div></noscript>
    </head>
    <body id="cobalt-body">
        <div id="popup-about" class="popup-narrow center box" style="visibility: hidden;">
            <div id="popup-header" class="popup-header">
                <button id="close" class="button mono" onclick="popup('about', 0)" aria-label="${loc(obj.lang, 'accessibility', 'close')}">x</button>
                <div id="title" class="popup-title">${loc(obj.lang, 'title', 'about')}</div>
            </div>
            <div id="content" class="popup-content with-footer">
                <div id="desc" class="popup-desc about-padding">${loc(obj.lang, 'desc', 'about')}</div>
                <div id="desc" class="popup-desc about-padding">${loc(obj.lang, 'desc', 'support_1')} ${enabledServices}.</div>
                ${isIOS ? `<div id="desc" class="popup-subtitle popup-desc"><span class="text-backdrop">${loc(obj.lang, 'desc', 'iosTitle')}</span></div><div id="desc" class="popup-desc about-padding">${loc(obj.lang, 'desc', 'ios')}</div>`: ``}
                <div id="desc" class="popup-desc"><a class="text-backdrop" href="${repo}">${loc(obj.lang, 'desc', 'sourcecode')}</a></div>
            </div>
            <div id="popup-footer" class="popup-footer">
                <a id="popup-bottom" class="popup-footer-content" href="${authorInfo.link}">${loc(obj.lang, 'desc', 'popupBottom')}</a>
            </div>
        </div>
        <div id="popup-changelog" class="popup-narrow center box" style="visibility: hidden;">
            <div id="popup-header" class="popup-header">
                <button id="close" class="button mono" onclick="popup('changelog', 0)" aria-label="${loc(obj.lang, 'accessibility', 'close')}">x</button>
                <div id="title" class="popup-title">${loc(obj.lang, 'title', 'changelog')}</div>
                <div id="desc" class="popup-subtitle">${loc(obj.lang, 'changelog', 'subtitle')}</div>
            </div>
            <div id="content" class="popup-content">
                <div id="desc" class="popup-desc about-padding">${loc(obj.lang, 'changelog', 'text')}</div>
                <div id="desc" class="popup-desc"><a class="text-backdrop" href="${repo}">${loc(obj.lang, 'changelog', 'github')}</a></div>
            </div>
        </div>
        <div id="popup-donate" class="popup-narrow center box" style="visibility: hidden;">
            <div id="popup-header" class="popup-header">
                <button id="close" class="button mono" onclick="popup('donate', 0)" aria-label="${loc(obj.lang, 'accessibility', 'close')}">x</button>
                <div id="title" class="popup-title">${loc(obj.lang, 'title', 'donate')}</div>
                <div id="desc" class="little-subtitle">${loc(obj.lang, 'desc', 'donationsSub')}</div>
            </div>
            <div id="content" class="popup-content">
                ${donate}
                <div id="desc" class="explanation about-padding">${loc(obj.lang, 'desc', 'donations')}</div>
                <div id="desc" class="popup-desc"><a class="text-backdrop" href="${authorInfo.contact}">${loc(obj.lang, 'desc', 'donateDm')}</a></div>
            </div>
        </div>
        <div id="popup-settings" class="popup-narrow scrollable center box" style="visibility: hidden;">
            <div id="popup-header" class="popup-header">
                <button id="close" class="button mono" onclick="popup('settings', 0)" aria-label="${loc(obj.lang, 'accessibility', 'close')}">x</button>
                <div id="version" class="popup-above-title">v.${version} ~ ${obj.hash}</div>
                <div id="title" class="popup-title">${loc(obj.lang, 'title', 'settings')}</div>
            </div>
            <div id="content" class="popup-content">
                <div id="settings-appearance" class="settings-category">
                    <div class="title">${loc(obj.lang, 'settings', 'category-appearance')}</div>
                    <div class="settings-category-content">
                        <div id="theme-switcher" class="switch-container">
                            <div class="subtitle">${loc(obj.lang, 'settings', 'theme')}</div>
                            <div class="switches">
                                <div id="theme-auto" class="switch full" onclick="changeSwitcher('theme', 'auto', 1)">${loc(obj.lang, 'settings', 'theme-auto')}</div>
                                <div id="theme-dark" class="switch" onclick="changeSwitcher('theme', 'dark', 1)">${loc(obj.lang, 'settings', 'theme-dark')}</div>
                                <div id="theme-light" class="switch full" onclick="changeSwitcher('theme', 'light', 1)">${loc(obj.lang, 'settings', 'theme-light')}</div>
                            </div>
                        </div>
                        <div class="subtitle">${loc(obj.lang, 'settings', 'misc')}</div>
                        <label class="checkbox"> 
                            <input id="always-visible-button" type="checkbox" aria-label="${loc(obj.lang, 'accessibility', 'alwaysVisibleButton')}" onclick="checkbox('alwaysVisibleButton', 'always-visible-button')">${loc(obj.lang, 'settings', 'always-visible')}
                        </label>
                    </div>
                </div>
                <div id="settings-quality" class="settings-category">
                    <div class="title">${loc(obj.lang, 'settings', 'general')}</div>
                    <div class="settings-category-content">
                        <div id="quality-switcher" class="switch-container">
                            <div class="subtitle">${loc(obj.lang, 'settings', 'quality')}</div>
                            <div class="switches">
                                <div id="quality-max" class="switch full" onclick="changeSwitcher('quality', 'max', 1)">${loc(obj.lang, 'settings', 'q-max')}</div>
                                <div id="quality-hig" class="switch" onclick="changeSwitcher('quality', 'hig', 1)">${loc(obj.lang, 'settings', 'q-hig')}(${quality.hig}p)</div>
                                <div id="quality-mid" class="switch full" onclick="changeSwitcher('quality', 'mid', 1)">${loc(obj.lang, 'settings', 'q-mid')}(${quality.mid}p)</div>
                                <div id="quality-low" class="switch right" onclick="changeSwitcher('quality', 'low', 1)">${loc(obj.lang, 'settings', 'q-low')}(${quality.low}p)</div>
                            </div>
                            <div class="explanation">${loc(obj.lang, 'settings', 'q-desc')}</div>
                        </div>
                    </div>
                </div>
                <div id="settings-youtube" class="settings-category">
                    <div class="title">youtube</div>
                    <div class="settings-category-content">
                        <div id="youtube-switcher" class="switch-container">
                            <div class="subtitle">${loc(obj.lang, 'settings', 'format')}</div>
                            <div class="switches">
                                <div id="youtubeFormat-mp4" class="switch full" onclick="changeSwitcher('youtubeFormat', 'mp4', 1)">mp4</div>
                                <div id="youtubeFormat-webm" class="switch" onclick="changeSwitcher('youtubeFormat', 'webm', 1)">webm</div>
                                <div id="youtubeFormat-audio" class="switch full" onclick="changeSwitcher('youtubeFormat', 'audio', 1)">audio only</div>
                            </div>
                            <div class="explanation">${loc(obj.lang, 'settings', 'format-info')}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div id="popup-error" class="popup center box" style="visibility: hidden;">
            <button id="close" class="button mono" onclick="popup('error', 0)" aria-label="${loc(obj.lang, 'accessibility', 'close')}">x</button>
            <div id="title" class="popup-title">${loc(obj.lang, 'title', 'error')}</div>
            <div id="desc-error" class="popup-desc"></div>
        </div>
        <div id="popup-backdrop" style="visibility: hidden;"></div>
        <div id="cobalt-main-box" class="center box" style="visibility: hidden;">
            <div id="logo-area">${appName}</div>
            <div id="download-area" class="mobile-center">
                <input id="url-input-area" class="mono" type="text" autocorrect="off" maxlength="110" autocapitalize="off" placeholder="${loc(obj.lang, 'desc', 'input')}" aria-label="${loc(obj.lang, 'accessibility', 'input')}" oninput="button()">
                <input id="download-button" class="mono dontRead" onclick="download(document.getElementById('url-input-area').value)" type="submit" value="" disabled=true aria-label="${loc(obj.lang, 'accessibility', 'download')}">
            </div>
        </div>
        <footer id="footer" style="visibility: hidden;">
            <div id="footer-buttons">
            <button id="about-open" class="button footer-button" onclick="popup('about', 1)" aria-label="${loc(obj.lang, 'accessibility', 'about')}">?</button>
                <button id="changelog-open" class="button footer-button" onclick="popup('changelog', 1)" aria-label="${loc(obj.lang, 'accessibility', 'changelog')}">!</button>
                <button id="donate-open" class="button footer-button" onclick="popup('donate', 1)" aria-label="${loc(obj.lang, 'accessibility', 'donate')}">$</button>
                <button id="settings-open" class="button footer-button" onclick="popup('settings', 1)" aria-label="${loc(obj.lang, 'accessibility', 'settings')}">+</button>
            </div>
        </footer>
    </body>
    <script type="text/javascript">const loc = {noInternet:"${loc(obj.lang, 'apiError', 'noInternet')}"}</script>
    <script type="text/javascript" src="cobalt.js"></script>
</html>`;
    } catch (err) {
        return `${loc('en', 'apiError', 'fatal', obj.hash)}`;
    }
}