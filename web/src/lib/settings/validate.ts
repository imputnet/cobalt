import type { Optional } from '$lib/types/generic';
import defaultSettings from './defaults'
import {
    downloadModeOptions,
    filenameStyleOptions,
    savingMethodOptions,
    themeOptions,
    videoQualityOptions,
    youtubeVideoCodecOptions,
    type PartialSettings,
} from '$lib/types/settings';

function validateTypes(input: unknown, reference = defaultSettings as unknown) {
    if (typeof input === 'undefined')
        return true;

    if (typeof input !== typeof reference)
        return false;

    if (typeof reference !== 'object')
        return true;

    if (reference === null || input === null)
        return input === reference;

    if (Array.isArray(reference)) {
        // TODO: we dont expect the reference array to hold any
        //       elements, but we should at maybe check whether
        //       the input array types are all matching.
        return true;
    }

    // we know that `input` is an `object` based on the first
    // two `if`s, but for some reason typescript doesn't.  :)
    if (typeof input !== 'object')
        return false;

    const keys = new Set([
        ...Object.keys(input),
        ...Object.keys(reference)
    ]);

    for (const key of keys) {
        const _input = input as Record<string, unknown>;
        const _reference = reference as Record<string, unknown>;

        if (!validateTypes(_input[key], _reference[key])) {
            return false;
        }
    }

    return true;
}

function validateLiteral(value: Optional<string>, allowed: readonly string[]) {
    return value === undefined || allowed.includes(value);
}

function validateLiterals(literals: [Optional<string>, readonly string[]][]) {
    for (const [ value, allowed ] of literals) {
        if (!validateLiteral(value, allowed))
            return false;
    }

    return true;
}

// performs a basic check on an "untrusted" settings object.
export function validateSettings(settings: PartialSettings) {
    if (!settings?.schemaVersion) {
        return false;
    }

    return (
        validateTypes(settings)
        && validateLiterals([
            [ settings?.appearance?.theme      , themeOptions ],
            [ settings?.save?.downloadMode     , downloadModeOptions ],
            [ settings?.save?.filenameStyle    , filenameStyleOptions ],
            [ settings?.save?.videoQuality     , videoQualityOptions ],
            [ settings?.save?.youtubeVideoCodec, youtubeVideoCodecOptions ],
            [ settings?.save?.savingMethod     , savingMethodOptions ]
        ])
    );
}
