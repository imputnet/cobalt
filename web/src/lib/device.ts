const ua = navigator.userAgent.toLowerCase();

const iPad = ua.includes("mac os") && navigator.maxTouchPoints > 0;
const iPhone = ua.includes("iphone os");

const iOS = iPhone || iPad;
const android = ua.includes("android") || ua.includes("diordna");

const mobile = iOS || android;

const preferredLocale = navigator.language.toLowerCase().slice(0, 2);

const installed = window.matchMedia('(display-mode: standalone)').matches;

const device = {
    is: {
        iPad,
        iPhone,
        iOS,
        android,
        mobile,
    },
    preferredLocale,
}

const app = {
    is: {
        installed
    }
}

export { device, app };
