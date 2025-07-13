const ANSI = {
    RESET: "\x1b[0m",
    BRIGHT: "\x1b[1m",
    RED: "\x1b[31m",
    GREEN: "\x1b[32m",
    CYAN: "\x1b[36m",
    YELLOW: "\x1b[93m"
}

function wrap(color, text) {
    if (!ANSI[color.toUpperCase()]) {
        throw "invalid color";
    }

    return ANSI[color.toUpperCase()] + text + ANSI.RESET;
}

export function Bright(text) {
    return wrap('bright', text);
}

export function Red(text) {
    return wrap('red', text);
}

export function Green(text) {
    return wrap('green', text);
}

export function Cyan(text) {
    return wrap('cyan', text);
}

export function Yellow(text) {
    return wrap('yellow', text);
}
