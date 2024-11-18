import { turnstileSolved } from "$lib/state/turnstile";

const getResponse = () => {
    const turnstileElement = document.getElementById("turnstile-widget");

    if (turnstileElement) {
        return window?.turnstile?.getResponse(turnstileElement);
    }

    return null;
}

const update = () => {
    const turnstileElement = document.getElementById("turnstile-widget");

    if (turnstileElement) {
        turnstileSolved.set(false);
        return window?.turnstile?.reset(turnstileElement);
    }

    return null;
}

const refreshIfExpired = () => {
    const turnstileElement = document.getElementById("turnstile-widget");

    if (turnstileElement) {
        const isExpired = window?.turnstile?.isExpired(turnstileElement);
        if (isExpired) {
            console.log("expired, refreshing the turnstile widget rn");
            return update();
        }
        console.log("turnstile not expired, nothing to do");
    }
}

export default {
    getResponse,
    update,
    refreshIfExpired,
}
