import tls from 'node:tls';
import { randomBytes } from 'node:crypto';

const ORIGINAL_CIPHERS = tls.DEFAULT_CIPHERS;

// How many ciphers from the top of the list to shuffle.
// The remaining ciphers are left in the original order.
const TOP_N_SHUFFLE = 8;

// Modified variation of https://stackoverflow.com/a/12646864
const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = randomBytes(4).readUint32LE() % array.length;
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

export const randomizeCiphers = () => {
    do {
        const cipherList = ORIGINAL_CIPHERS.split(':');
        const shuffled = shuffleArray(cipherList.slice(0, TOP_N_SHUFFLE));
        const retained = cipherList.slice(TOP_N_SHUFFLE);

        tls.DEFAULT_CIPHERS = [ ...shuffled, ...retained ].join(':');
    } while (tls.DEFAULT_CIPHERS === ORIGINAL_CIPHERS);
}
