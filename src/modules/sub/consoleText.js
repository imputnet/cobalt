function t(color, tt) {
    return color + tt + "\x1b[0m"
}

export function Bright(tt) {
    return t("\x1b[1m", tt)
}
export function Red(tt) {
    return t("\x1b[31m", tt)
}
export function Green(tt) {
    return t("\x1b[32m", tt)
}
export function Cyan(tt) {
    return t("\x1b[36m", tt)
}
