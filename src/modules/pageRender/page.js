import { backdropLink, checkbox, collapsibleList, explanation, footerButtons, multiPagePopup, popup, popupWithBottomButtons, sep, settingsCategory, switcher, socialLink } from "./elements.js";
import { services as s, appName, authorInfo, version, repo, donations, supportedAudio } from "../config.js";
import { getCommitInfo } from "../sub/currentCommit.js";
import loc from "../../localization/manager.js";
import emoji from "../emoji.js";
import changelogManager from "../changelog/changelogManager.js";

let com = getCommitInfo();

let enabledServices = Object.keys(s).filter((p) => {
    if (s[p].enabled) return true;
}).sort().map((p) => {
    return `<br>&bull; ${s[p].alias ? s[p].alias : p}`
}).join('').substring(4)

let donate = ``
let donateLinks = ``
let audioFormats = supportedAudio.map((p) => {
    return { "action": p }
})
audioFormats.unshift({ "action": "best" })
for (let i in donations["links"]) {
    donateLinks += `<a id="don-${i}" class="switch autowidth" href="${donations["links"][i]}" target="_blank">REPLACEME ${i}</a>`
}
let extr = ''
for (let i in donations["crypto"]) {
    donate += `<div class="subtitle${extr}">${i} (REPLACEME)</div><div id="don-${i}" class="text-to-copy" onClick="copy('don-${i}')">${donations["crypto"][i]}</div>`
    extr = ' top-margin'
}

export default function(obj) {
    const t = (str, replace) => { return loc(obj.lang, str, replace) };
    let ua = obj.useragent.toLowerCase();
    let isIOS = ua.match("iphone os");
    let isMobile = ua.match("android") || ua.match("iphone os");

    let platform = isMobile ? "m" : "p";
    if (isMobile && isIOS) platform = "i";

    audioFormats[0]["text"] = t('SettingsAudioFormatBest');

    try {
        return `<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=${isIOS ? `1` : `5`}" />

        <title>${appName}</title>

        <meta property="og:url" content="${process.env.webURL || process.env.selfURL}" />
        <meta property="og:title" content="${appName}" />
        <meta property="og:description" content="${t('EmbedBriefDescription')}" />
        <meta property="og:image" content="${process.env.webURL || process.env.selfURL}icons/generic.png" />
        <meta name="title" content="${appName}" />
        <meta name="description" content="${t('AboutSummary')}" />
        <meta name="theme-color" content="#000000" />
        <meta name="twitter:card" content="summary" />

        <link rel="icon" type="image/x-icon" href="icons/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="icons/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="icons/favicon-16x16.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png" />

        <link rel="manifest" href="manifest.webmanifest" />
        <link rel="stylesheet" href="fonts/notosansmono.css" rel="preload" />
        <link rel="stylesheet" href="cobalt.css" />

        <noscript><div style="margin: 2rem;">${t('NoScriptMessage')}</div></noscript>
    </head>
    <body id="cobalt-body" ${platform === "p" ? 'class="desktop"' : ''} data-nosnippet ontouchstart>
        ${multiPagePopup({
            name: "about",
            closeAria: t('AccessibilityClosePopup'),
            tabs: [{
                name: "about",
                title: `${emoji("🐲")} ${t('AboutTab')}`,
                content: popup({
                    name: "about",
                    header: {
                        aboveTitle: {
                            text: t('MadeWithLove'),
                            url: authorInfo.link
                        },
                        closeAria: t('AccessibilityClosePopup'),
                        title: `${emoji("🔮", 30)} ${t('TitlePopupAbout')}`
                    },
                    body: [{
                        text: t('AboutSummary')
                    }, {
                        text: collapsibleList([{
                            "name": "services",
                            "title": t("CollapseServices"),
                            "body": `${enabledServices}<br/><br/>${t("ServicesNote")}`
                        }, {
                            "name": "support",
                            "title": t("CollapseSupport"),
                            "body": `${t("FollowSupport")}<br/>
                            ${socialLink(emoji("🐦"), "twitter", authorInfo.support.twitter.handle, authorInfo.support.twitter.url)}
                            ${socialLink(emoji("👾"), "discord", authorInfo.support.discord.handle, authorInfo.support.discord.url)}
                            ${socialLink(emoji("🐘"), "mastodon", authorInfo.support.mastodon.handle, authorInfo.support.mastodon.url)}<br/>
                            ${t("SourceCode")}<br/>
                            ${socialLink(emoji("🐙"), "github", repo.replace("https://github.com/", ''), repo)}<br/>
                            ${t("SupportNote")}`
                        }, {
                            "name": "privacy",
                            "title": t("CollapsePrivacy"),
                            "body": t("PrivacyPolicy")
                        }])
                    }]
                })
            }, {
                name: "changelog",
                title: `${emoji("🎉")} ${t('ChangelogTab')}`,
                content: popup({
                    name: "changelog",
                    header: {
                        closeAria: t('AccessibilityClosePopup'),
                        title: `${emoji("🪄", 30)} ${t('TitlePopupChangelog')}`
                    },
                    body: [{
                        text: `<div class="category-title">${t('ChangelogLastMajor')}</div>`,
                        raw: true
                    }, {
                        text: changelogManager("banner") ?
                        `<div class="changelog-banner"><img class="changelog-img" src="${changelogManager("banner")}" onerror="this.style.display='none'" loading="lazy"></img></div>`: '',
                        raw: true
                    }, {
                        text: changelogManager("title"),
                        classes: ["changelog-subtitle"],
                        nopadding: true
                    }, {
                        text: changelogManager("content")
                    }, {
                        text: `${sep()}<span class="text-backdrop">${obj.hash}:</span> ${com[0]}`,
                        classes: ["changelog-subtitle"],
                        nopadding: true
                    }, {
                        text: com[1]
                    }, {
                        text: backdropLink(`${repo}/commits`, t('LinkGitHubChanges')),
                        classes: ["bottom-link"]
                    }, {
                        text: `<div class="category-title">${t('ChangelogOlder')}</div>`,
                        raw: true
                    }, {
                        text: `<div id="changelog-history"><button class="switch bottom-margin" onclick="loadOnDemand('changelog-history', '0')">${t("ChangelogPressToExpand")}</button></div>`,
                        raw: true
                    }]
                })
            }, {
                name: "donate",
                title: `${emoji("💖")} ${t('DonationsTab')}`,
                content: popup({
                    name: "donate",
                    header: {
                        closeAria: t('AccessibilityClosePopup'),
                        title: emoji("💸", 30) + t('TitlePopupDonate')
                    },
                    body: [{
                        text: `<div class="category-title">${t('DonateSub')}</div>`,
                        raw: true
                    }, {
                        text: `<div class="changelog-banner"><img class="changelog-img" src="updateBanners/catsleep.webp" onerror="this.style.display='none'" loading="lazy"></img></div>`,
                        raw: true
                    }, {
                        text: t('DonateExplanation')
                    }, {
                        text: donateLinks.replace(/REPLACEME/g, t('DonateVia')),
                        raw: true
                    }, {
                        text: t('DonateLinksDescription'),
                        classes: ["explanation"]
                    }, {
                        text: sep(),
                        raw: true
                    }, {
                        text: donate.replace(/REPLACEME/g, t('ClickToCopy')),
                        classes: ["desc-padding"]
                    }, {
                        text: sep(),
                        raw: true
                    }, {
                        text: t('DonateHireMe', authorInfo.link),
                        classes: ["desc-padding"]
                    }]
                })
            }],
        })}
        ${multiPagePopup({
            name: "settings",
            closeAria: t('AccessibilityClosePopup'),
            header: {
                aboveTitle: {
                    text: `v.${version}-${obj.hash}${platform} (${obj.branch})`,
                    url: `${repo}/commit/${obj.hash}`
                },
                title: `${emoji("⚙️", 30)} ${t('TitlePopupSettings')}`
            },
            tabs: [{
                name: "video",
                title: `${emoji("🎬")} ${t('SettingsVideoTab')}`,
                content: settingsCategory({
                    name: "downloads",
                    title: t('SettingsQualitySubtitle'),
                    body: switcher({
                        name: "vQuality",
                        explanation: t('SettingsQualityDescription'),
                        items: [{
                            "action": "max",
                            "text": "4320p+"
                        }, {
                            "action": "2160",
                            "text": "2160p"
                        }, {
                            "action": "1440",
                            "text": "1440p"
                        }, {
                            "action": "1080",
                            "text": "1080p"
                        }, {
                            "action": "720",
                            "text": "720p"
                        }, {
                            "action": "480",
                            "text": "480p"
                        }, {
                            "action": "360",
                            "text": "360p"
                        }]
                    })
                })
                + settingsCategory({
                    name: "tiktok",
                    title: "tiktok & douyin",
                    body: checkbox("disableTikTokWatermark", t('SettingsRemoveWatermark'), 3)
                })
                + settingsCategory({
                    name: t('SettingsCodecSubtitle'),
                    body: switcher({
                        name: "vCodec",
                        explanation: t('SettingsCodecDescription'),
                        items: [{
                            "action": "h264",
                            "text": "h264 (mp4)"
                        }, {
                            "action": "av1",
                            "text": "av1 (mp4)"
                        }, {
                            "action": "vp9",
                            "text": "vp9 (webm)"
                        }]
                    })
                })
                + settingsCategory({
                    name: t('SettingsVimeoPrefer'),
                    body: switcher({
                        name: "vimeoDash",
                        explanation: t('SettingsVimeoPreferDescription'),
                        items: [{
                            "action": "false",
                            "text": "progressive"
                        }, {
                            "action": "true",
                            "text": "dash"
                        }]
                    })
                })
            }, {
                name: "audio",
                title: `${emoji("🎶")} ${t('SettingsAudioTab')}`,
                content: settingsCategory({
                    name: "general",
                    title: t('SettingsFormatSubtitle'),
                    body:
                        switcher({
                            name: "aFormat",
                            explanation: t('SettingsAudioFormatDescription'),
                            items: audioFormats
                        }) + sep(0) + checkbox("muteAudio", t('SettingsVideoMute'), 3) + explanation(t('SettingsVideoMuteExplanation'))
                        }) + settingsCategory({
                            name: "dub",
                            title: t("SettingsAudioDub"),
                            body: switcher({
                                name: "dubLang",
                                explanation: t('SettingsAudioDubDescription'),
                                items: [{
                                    "action": "original",
                                    "text": t('SettingsDubDefault')
                                }, {
                                    "action": "auto",
                                    "text": t('SettingsDubAuto')
                                }]
                            })
                        }) + settingsCategory({
                            name: "tiktok",
                            title: "tiktok & douyin",
                            body: checkbox("fullTikTokAudio", t('SettingsAudioFullTikTok'), 3) + explanation(t('SettingsAudioFullTikTokDescription'))
                        })
            }, {
                name: "other",
                title: `${emoji("🪅")} ${t('SettingsOtherTab')}`,
                content: settingsCategory({
                    name: "appearance",
                    title: t('SettingsAppearanceSubtitle'),
                    body: switcher({
                        name: "theme",
                        subtitle: t('SettingsThemeSubtitle'),
                        items: [{
                            "action": "auto",
                            "text": t('SettingsThemeAuto')
                        }, {
                            "action": "dark",
                            "text": t('SettingsThemeDark')
                        }, {
                            "action": "light",
                            "text": t('SettingsThemeLight')
                        }]
                    }) + checkbox("alwaysVisibleButton", t('SettingsKeepDownloadButton'), 4, t('AccessibilityKeepDownloadButton'))
                }) + settingsCategory({
                    name: "miscellaneous",
                    title: t('Miscellaneous'),
                    body: checkbox("disableChangelog", t('SettingsDisableNotifications')) + `${!isIOS ? checkbox("downloadPopup", t('SettingsEnableDownloadPopup'), 1, t('AccessibilityEnableDownloadPopup')) : ''}`
                })
            }],
        })}
        ${popup({
            name: "download",
            standalone: true,
            header: {
                closeAria: t('AccessibilityClosePopup'),
                subtitle: t('TitlePopupDownload')
            },
            body: switcher({
                name: "download",
                subtitle: t('DownloadPopupWayToSave'),
                explanation: `${!isIOS ? t('DownloadPopupDescription') : t('DownloadPopupDescriptionIOS')}`,
                items: `<a id="pd-download" class="switch full" target="_blank" href="/">${t('Download')}</a>
                <div id="pd-share" class="switch full">${t('ShareURL')}</div>
                <div id="pd-copy" class="switch full">${t('CopyURL')}</div>`
            })
        })}
        ${popupWithBottomButtons({
            name: "picker",
            closeAria: t('AccessibilityClosePopup'),
            header: {
                title: `<div id="picker-title"></div>`,
                explanation: `<div id="picker-subtitle"></div>`,
            },
            buttons: [`<a id="picker-download" class="switch" target="_blank" href="/">${t('ImagePickerDownloadAudio')}</a>`],
            content: '<div id="picker-holder"></div>'
        })}
        ${popup({
            name: "error",
            standalone: true,
            buttonOnly: true,
            classes: ["small"],
            buttonText: t('ErrorPopupCloseButton'),
            header: {
                closeAria: t('AccessibilityClosePopup'),
                title: t('TitlePopupError'),
                emoji: emoji("☹️", 64, 1),
            },
            body: `<div id="desc-error" class="desc-padding subtext"></div>`
        })}
        <div id="popup-backdrop" style="visibility: hidden;" onclick="hideAllPopups()"></div>
        <div id="cobalt-main-box" class="center" style="visibility: hidden;">
            <div id="logo">${appName}</div>
            <div id="download-area">
                <div id="top">
                    <input id="url-input-area" class="mono" type="text" autocorrect="off" maxlength="128" autocapitalize="off" placeholder="${t('LinkInput')}" aria-label="${t('AccessibilityInputArea')}" oninput="button()"></input>
                    <button id="url-clear" onclick="clearInput()" style="display:none;">x</button>
                    <input id="download-button" class="mono dontRead" onclick="download(document.getElementById('url-input-area').value)" type="submit" value="" disabled=true aria-label="${t('AccessibilityDownloadButton')}">
                </div>
                <div id="bottom">
                    <button id="paste" class="switch" onclick="pasteClipboard()" aria-label="${t('PasteFromClipboard')}">${emoji("📋", 22)} ${t('PasteFromClipboard')}</button>
                    ${switcher({
                        name: "audioMode",
                        noParent: true,
                        items: [{
                            "action": "false",
                            "text": `${emoji("✨")} ${t("ModeToggleAuto")}`
                        }, {
                            "action": "true",
                            "text": `${emoji("🎶")} ${t("ModeToggleAudio")}`
                        }]
                    })}
                </div>
            </div>
        </div>
        <footer id="footer" style="visibility: hidden;">
        ${/* big action buttons are ALWAYS either first or last, because usual buttons are bundled in pairs and are sandwiched between bigger buttons for mobile view */
        footerButtons([{
            name: "about",
            type: "popup",
            text: `${emoji("🐲" , 22)} ${t('AboutTab')}`,
            aria: t('AccessibilityOpenAbout')
        }, {
            name: "about",
            type: "popup",
            context: "donate",
            text: `${emoji("💖", 22)} ${t('Donate')}`,
            aria: t('AccessibilityOpenDonate')
        }, {
            name: "settings",
            type: "popup",
            text: `${emoji("⚙️", 22)} ${t('TitlePopupSettings')}`,
            aria: t('AccessibilityOpenSettings')
        }])}
        </footer>
    </body>
    <script type="text/javascript">
    const loc = {
        noInternet: ` + "`" + t('ErrorNoInternet') + "`" + `,
        noURLReturned: ` + "`" + t('ErrorNoUrlReturned') + "`" + `,
        unknownStatus: ` + "`" + t('ErrorUnknownStatus') + "`" + `,
        collapseHistory: ` + "`" + t('ChangelogPressToHide') + "`" + `,
        pickerDefault: ` + "`" + t('MediaPickerTitle') + "`" + `,
        pickerImages: ` + "`" + t('ImagePickerTitle') + "`" + `,
        pickerImagesExpl: ` + "`" + t(`ImagePickerExplanation${isMobile ? "Phone" : "PC"}`) + "`" + `,
        pickerDefaultExpl: ` + "`" + t(`MediaPickerExplanation${isMobile ? `Phone${isIOS ? "IOS" : ""}` : "PC"}`) + "`" + `,
    };
    let apiURL = '${process.env.apiURL ? process.env.apiURL.slice(0, -1) : ''}';
    </script>
    <script type="text/javascript" src="cobalt.js"></script>
</html>`;
    } catch (err) {
        return `${t('ErrorPageRenderFail', obj.hash)}`;
    }
}
