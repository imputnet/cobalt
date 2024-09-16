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

    const iOS = iPhone || iPad;
    const android = ua.includes("android") || ua.includes("diordna");

    const installed = window.matchMedia('(display-mode: standalone)').matches;

    app.is = {
        installed,
    };

    device.is = {
        iPhone,
        iPad,
        iOS,
        android,
        mobile: iOS || android,
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
