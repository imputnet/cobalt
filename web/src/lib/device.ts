const ua = navigator.userAgent.toLowerCase();

const iPhone = ua.includes("iphone os");
const iPad = !iPhone && ua.includes("mac os") && navigator.maxTouchPoints > 0;

const iOS = iPhone || iPad;
const android = ua.includes("android") || ua.includes("diordna");

const mobile = iOS || android;

const preferredLocale = navigator.language.toLowerCase().slice(0, 2);

const installed = window.matchMedia('(display-mode: standalone)').matches;

const device = {
    is: {
        iPhone,
        iPad,
        iOS,
        android,
        mobile,
    },
    preferredLocale,
    userAgent: navigator.userAgent,
}

const app = {
    is: {
        installed
    }
}

export { device, app };
