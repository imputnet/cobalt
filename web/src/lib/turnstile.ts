const getResponse = () => {
    const turnstileElement = document.getElementById("turnstile-widget");

    if (turnstileElement) {
        return window?.turnstile?.getResponse(turnstileElement);
    }

    return null;
}

export default {
    getResponse
}
