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
        modernIOS: false,
        android: false,
        mobile: false,
    },
    browser: {
        chrome: false,
    },
    prefers: {
        language: "en",
        reducedMotion: false,
        reducedTransparency: false,
    },
    supports: {
        share: false,
        directDownload: false,
    },
    userAgent: "sveltekit server",
}

if (browser) {
    const ua = navigator.userAgent.toLowerCase();

    const iPhone = ua.includes("iphone os");
    const iPad = !iPhone && ua.includes("mac os") && navigator.maxTouchPoints > 0;

    const iosVersion = Number(ua.match(/iphone os (\d+)_/)?.[1]);
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
        modernIOS,
    };

    device.browser = {
        chrome: ua.includes("chrome/"),
    };

    device.prefers = {
        language: navigator.language.toLowerCase().slice(0, 2) || "en",
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        reducedTransparency: window.matchMedia('(prefers-reduced-transparency: reduce)').matches,
    };

    device.supports = {
        share: navigator.share !== undefined,
        directDownload: !(installed && iOS),
    };

    device.userAgent = navigator.userAgent;
}

export { device, app };
