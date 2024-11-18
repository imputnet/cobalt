import { turnstileSolved } from "$lib/state/turnstile";

const getResponse = () => {
    const turnstileElement = document.getElementById("turnstile-widget");

    if (turnstileElement) {
        return window?.turnstile?.getResponse(turnstileElement);
    }

    return null;
}

const reset = () => {
    const turnstileElement = document.getElementById("turnstile-widget");

    if (turnstileElement) {
        turnstileSolved.set(false);
        return window?.turnstile?.reset(turnstileElement);
    }

    return null;
}

export default {
    getResponse,
    reset,
}
