import { browser } from '$app/environment'

const device = {
    is: {},
    prefers: {},
    supports: {},
    userAgent: 'sveltekit server'
};

const app = {
    is: {}
}

if (browser) {
    const ua = navigator.userAgent.toLowerCase();

    const iPhone = ua.includes("iphone os");
    const iPad = !iPhone && ua.includes("mac os") && navigator.maxTouchPoints > 0;

    const iOS = iPhone || iPad;
    const android = ua.includes("android") || ua.includes("diordna");

    const mobile = iOS || android;

    const language = navigator.language.toLowerCase().slice(0, 2);

    const installed = window.matchMedia('(display-mode: standalone)').matches;

    const reducedMotion = window.matchMedia(`(prefers-reduced-motion: reduce)`).matches;
    const reducedTransparency = window.matchMedia(`(prefers-reduced-transparency: reduce)`).matches;

    app.is = { installed };
    device.is = {
        iPhone,
        iPad,
        iOS,
        android,
        mobile,
    };

    device.prefers = {
        language,
        reducedMotion,
        reducedTransparency,
    };

    device.supports = {
        share: navigator.share !== undefined,
        directDownload: !(installed && iOS),
    };

    device.userAgent = navigator.userAgent;
}

export { device, app };
