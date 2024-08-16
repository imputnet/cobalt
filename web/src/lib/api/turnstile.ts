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
        return window?.turnstile?.reset(turnstileElement);
    }

    return null;
}

export default {
    getResponse,
    update,
}
