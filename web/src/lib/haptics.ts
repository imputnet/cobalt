import { get } from "svelte/store";
import { device } from "$lib/device";
import settings from "$lib/state/settings";

const canUseHaptics = () => {
    return device.supports.haptics && !get(settings).accessibility.disableHaptics;
}

export const hapticSwitch = () => {
    if (!canUseHaptics()) return;

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
    if (!canUseHaptics()) return;

    hapticSwitch();
    setTimeout(() => hapticSwitch(), 120);
}

export const hapticError = () => {
    if (!canUseHaptics()) return;

    hapticSwitch();
    setTimeout(() => hapticSwitch(), 120);
    setTimeout(() => hapticSwitch(), 240);
}
