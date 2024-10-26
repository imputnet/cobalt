// run with `pnpm -r token:jwt`

const makeSecureString = (length = 64) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
    const out = [];

    while (out.length < length) {
        for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
            if (byte < alphabet.length) {
                out.push(alphabet[byte]);
            }

            if (out.length === length) {
                break;
            }
        }
    }

    return out.join('');
}

console.log(`JWT_SECRET: ${JSON.stringify(makeSecureString(64))}`)
