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

const app = {
    is: {
        installed
    }
}

const device = {
    is: {
        iPhone,
        iPad,
        iOS,
        android,
        mobile,
    },
    prefers: {
        language,
        reducedMotion,
        reducedTransparency,
    },
    supports: {
        share: navigator.share !== undefined,
        directDownload: !(installed && iOS),
    },
    userAgent: navigator.userAgent,
}


export { device, app };
