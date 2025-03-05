import { device } from "$lib/device";

// not sure if vibrations feel the same on android,
// so they're enabled only on ios 18+ for now
const useHaptics = device.is.modernIOS;

export const hapticSwitch = () => {
    if (!useHaptics) return;

    try {
        const label = document.createElement("label");
        label.ariaHidden = "true";
        label.style.display = "none";

        const input = document.createElement("input");
        input.type = "checkbox";
        input.setAttribute("switch", "");
        label.appendChild(input);

        document.head.appendChild(label);
        label.click();
        document.head.removeChild(label);
    } catch {
        // ignore
    }
}

export const hapticConfirm = () => {
    if (!useHaptics) return;

    hapticSwitch();
    setTimeout(() => hapticSwitch(), 120);
}
