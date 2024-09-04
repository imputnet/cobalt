import { browser } from "$app/environment";

const defaultSettingsPage = () => {
    if (browser) {
        if (window.innerWidth <= 750) {
            return "/settings";
        }
    }

    return "/settings/appearance";
}

export {
    defaultSettingsPage,
}
