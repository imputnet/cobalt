import { browser } from "$app/environment";

const defaultNavPage = (page: "settings" | "about") => {
    if (browser && window.innerWidth <= 750) {
        return `/${page}`;
    }

    switch (page) {
        case "settings":
            return "/settings/appearance";
        case "about":
            return "/about/general";
    }
}

export { defaultNavPage };
