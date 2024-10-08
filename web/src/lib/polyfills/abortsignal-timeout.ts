import { browser } from "$app/environment";

if (browser && 'AbortSignal' in window && !window.AbortSignal.timeout) {
    window.AbortSignal.timeout = (milliseconds: number) => {
        const controller = new AbortController();
        setTimeout(() => controller.abort("timed out"), milliseconds);

        return controller.signal;
    }
}
