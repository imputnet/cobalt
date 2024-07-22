import { device } from "$lib/device";

export const downloadFile = (url: string) => {
    if (device.is.iOS) {
        return navigator?.share({ url }).catch(() => {});
    } else {
        return window.open(url, "_blank");
    }
};
