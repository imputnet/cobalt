const ua = navigator.userAgent.toLowerCase();

const isIOS = ua.includes("iphone os") || (ua.includes("mac os") && navigator.maxTouchPoints > 0);
const isAndroid = ua.includes("android") || ua.includes("diordna");
const isMobile = isIOS || isAndroid;

const preferredLocale = navigator.language.toLowerCase().slice(0, 2);

const device = {
    isIOS,
    isAndroid,
    isMobile,

    preferredLocale,
}

export default device;
