import { convertLanguageCode } from "../../misc/language-codes.js";

// Services use both ISO 639-1 and ISO 639-2, sometimes with a script or region.
export const normalizeCaptionLanguage = language => {
    if (!language) return;
    const [base, ...parts] = language.replaceAll("_", "-").split("-");
    const normalized = [
        base.length === 3 ? convertLanguageCode(base) || base : base,
        ...parts,
    ].join("-");
    try {
        return new Intl.Locale(normalized).toString();
    } catch {
        return normalized.toLowerCase();
    }
};

const languageRank = (language, requested) => {
    if (!requested) return 0;
    if (!language) return Infinity;
    if (language === requested) return 0;

    try {
        const track = new Intl.Locale(language);
        const target = new Intl.Locale(requested);
        if (track.language !== target.language) return Infinity;
        // Bare languages accept any script. Explicit scripts or regions must
        // not fall back to a different writing system, e.g. zh-Hant -> zh-Hans.
        if ((target.script || target.region)
            && track.maximize().script !== target.maximize().script) return Infinity;
        return 1;
    } catch {
        return Infinity;
    }
};

export const captionSelectionError = tracks => {
    const available = tracks.filter(track => track.url);
    if (!available.length) return { error: "captions.unavailable" };
    return {
        error: "captions.language_unavailable",
        context: {
            languages: [...new Set(available.map(track =>
                normalizeCaptionLanguage(track.language)
            ).filter(Boolean))],
        },
    };
};

export const createCaptionResponse = ({
    url,
    format,
    sourceFormat = "vtt",
    language,
    service,
    id,
    title,
    author,
    source,
    headers,
}) => {
    const resolvedTitle = title || `${service}_${id}`;
    return {
        type: "captions",
        isCaptionOnly: true,
        urls: url,
        headers,
        captionFormat: format,
        captionSourceFormat: sourceFormat,
        captionLanguage: language || "unknown",
        filenameAttributes: {
            service,
            id,
            title: resolvedTitle,
            author,
        },
        captionMetadata: {
            title: resolvedTitle,
            author,
            language,
            source,
        },
    };
};

const captionResource = (resource, playlistURL) => {
    const output = {
        url: new URL(resource.uri, playlistURL).toString(),
    };
    if (resource.byterange) {
        const { offset, length } = resource.byterange;
        output.headers = { range: `bytes=${offset}-${offset + length - 1}` };
    }
    return output;
};

export const captionSegmentResources = (segments, playlistURL) => {
    const resources = [];
    let previousMap;

    for (const segment of segments) {
        if (segment.map) {
            const map = captionResource(segment.map, playlistURL);
            const mapKey = `${map.url}:${map.headers?.range || ""}`;
            if (mapKey !== previousMap) {
                resources.push(map);
                previousMap = mapKey;
            }
        } else {
            previousMap = undefined;
        }
        resources.push(captionResource(segment, playlistURL));
    }
    return resources;
};

// Tracks share { url, language, automatic, sourceFormat }; adapters may add fields.
// Preserve source order when language rank and manual/automatic status are equal.
export const selectCaptionTrack = (tracks, language, allowAutomatic = true) => {
    const requested = normalizeCaptionLanguage(language);
    let selected, bestRank = Infinity;
    for (const track of tracks) {
        if (!track.url || (!allowAutomatic && track.automatic)) continue;
        const rank = languageRank(normalizeCaptionLanguage(track.language), requested) * 2
            + Number(!!track.automatic);
        if (rank < bestRank) {
            selected = track;
            bestRank = rank;
        }
    }
    return selected;
};
