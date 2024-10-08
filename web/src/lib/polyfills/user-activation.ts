import { browser } from "$app/environment";
import type { Writeable } from "$lib/types/generic";

if (browser && !navigator.userActivation) {
    const TRANSIENT_TIMEOUT = navigator.userAgent.includes('Firefox') ? 5000 : 2000;
    let _timeout: number | undefined;

    const userActivation: Writeable<UserActivation> = {
        isActive: false,
        hasBeenActive: false
    };

    const receiveEvent = (e: Event) => {
        // An activation triggering input event is any event whose isTrusted attribute is true [...]
        if (!e.isTrusted) return;

        // and whose type is one of:
        if (e instanceof PointerEvent) {
            if (
                // "pointerdown", provided the event's pointerType is "mouse";
                (e.type === 'pointerdown' && e.pointerType !== 'mouse')
                // "pointerup", provided the event's pointerType is not "mouse";
                || (e.type === 'pointerup' && e.pointerType === 'mouse')
            )
                return;
        } else if (e instanceof KeyboardEvent) {
            // "keydown", provided the key is neither the Esc key nor a shortcut key
            // reserved by the user agent;
            if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey)
                return;

            // the handling for this is a bit more complex,
            // but this is fine for our use case
            if (e.key !== 'Return' && e.key !== 'Enter' && e.key.length > 1)
                return;
        }

        userActivation.hasBeenActive = true;
        userActivation.isActive = true;

        clearTimeout(_timeout);
        _timeout = window.setTimeout(() => {
            userActivation.isActive = false;
            _timeout = undefined;
        }, TRANSIENT_TIMEOUT);
    }

    // https://html.spec.whatwg.org/multipage/interaction.html#the-useractivation-interface
    for (const event of [ 'keydown', 'mousedown', 'pointerdown', 'pointerup', 'touchend' ]) {
        window.addEventListener(event, receiveEvent);
    }

    (navigator.userActivation as UserActivation) = userActivation;
}
