// run with `pnpm -r token:jwt`

const makeSecureString = (length = 64) => {
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
    const out = [];

    for (const byte of crypto.getRandomValues(new Uint8Array(length)))
        out.push(alphabet[byte % alphabet.length]);

    return out.join('');
}

console.log(`JWT_SECRET: ${JSON.stringify(makeSecureString(64))}`)
