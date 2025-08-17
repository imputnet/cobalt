import { browser } from "$app/environment";

const app = {
    is: {
        installed: false,
    }
}

const device = {
    is: {
        iPhone: false,
        iPad: false,
        iOS: false,
        android: false,
        mobile: false,
    },
    browser: {
        chrome: false,
        webkit: false,
    },
    prefers: {
        language: "en",
        reducedMotion: false,
        reducedTransparency: false,
    },
    supports: {
        share: false,
        directDownload: false,
        haptics: false,
        defaultLocalProcessing: false,
        multithreading: false,
    },
    userAgent: "sveltekit server",
}

if (browser) {
    const ua = navigator.userAgent.toLowerCase();

    const iPhone = ua.includes("iphone os");
    const iPad = !iPhone && ua.includes("mac os") && navigator.maxTouchPoints > 0;

    const iosVersion = Number(ua.match(/version\/(\d+)/)?.[1]);
    const modernIOS = iPhone && iosVersion >= 18;

    const iOS = iPhone || iPad;
    const android = ua.includes("android") || ua.includes("diordna");

    const installed = window.matchMedia('(display-mode: standalone)').matches;

    app.is = {
        installed,
    };

    device.is = {
        mobile: iOS || android,
        android,

        iPhone,
        iPad,
        iOS,
    };

    device.browser = {
        chrome: ua.includes("chrome/"),
        webkit: ua.includes("applewebkit/")
                && ua.includes("version/")
                && ua.includes("safari/")
                // this is the version of webkit that's hardcoded into chrome
                // and indicates that the browser is not actually webkit
                && !ua.includes("applewebkit/537.36")
    };

    device.prefers = {
        language: navigator.language.toLowerCase().slice(0, 2) || "en",
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        reducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
    };

    device.supports = {
        share: navigator.share !== undefined,
        directDownload: !(installed && iOS),

        // not sure if vibrations feel the same on android,
        // so they're enabled only on ios 18+ for now
        haptics: modernIOS,

        // enable local processing by default everywhere but android chrome
        defaultLocalProcessing: !(device.is.android && device.browser.chrome),
        multithreading: !iOS || iosVersion >= 18,
    };

    device.userAgent = navigator.userAgent;
}

export { device, app };
