const namedEntities = {
    amp: "&",
    apos: "'",
    gt: ">",
    lt: "<",
    nbsp: " ",
    quot: '"',
};

const decodeEntities = text => text.replace(
    /&(#(?:x[0-9a-f]+|\d+)|[a-z]+);/gi,
    (entity, value) => {
        if (value[0] !== "#") {
            return namedEntities[value.toLowerCase()] ?? entity;
        }

        const hex = value[1]?.toLowerCase() === "x";
        const codePoint = Number.parseInt(value.slice(hex ? 2 : 1), hex ? 16 : 10);
        try {
            return String.fromCodePoint(codePoint);
        } catch {
            return entity;
        }
    }
);

const cleanCueText = text => decodeEntities(
    text
        .replace(/<\d{2}:\d{2}(?::\d{2})?\.\d{3}>/g, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
).split("\n")
    .map(line => line.trim())
    .filter(Boolean)
    .join("\n");

export const parseVtt = input => {
    const normalized = input.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
    const blocks = normalized.split(/\n{2,}/);
    const cues = [];

    for (const block of blocks) {
        const lines = block.split("\n").map(line => line.trimEnd());
        if (!lines.length || /^(WEBVTT|NOTE|STYLE|REGION)(?:\s|$)/.test(lines[0])) {
            continue;
        }

        const timingIndex = lines.findIndex(line => line.includes(" --> "));
        if (timingIndex < 0) continue;

        const timing = lines[timingIndex].match(
            /^(\d{2}:)?\d{2}:\d{2}\.\d{3}\s+-->\s+(\d{2}:)?\d{2}:\d{2}\.\d{3}/
        )?.[0];
        if (!timing) continue;

        const [ start, end ] = timing.split(/\s+-->\s+/);
        const text = cleanCueText(lines.slice(timingIndex + 1).join("\n"));
        if (text) cues.push({ start, end, text });
    }

    return cues;
};

export const parseSrt = input => {
    const normalized = input.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
    const cues = [];

    for (const block of normalized.split(/\n{2,}/)) {
        const lines = block.split("\n").map(line => line.trimEnd());
        const timingIndex = lines.findIndex(line => line.includes(" --> "));
        if (timingIndex < 0) continue;

        const timing = lines[timingIndex].match(
            /^(\d{2}:)?\d{2}:\d{2},\d{3}\s+-->\s+(\d{2}:)?\d{2}:\d{2},\d{3}/
        )?.[0];
        if (!timing) continue;

        const [ start, end ] = timing.split(/\s+-->\s+/).map(value =>
            value.replace(",", ".")
        );
        const text = cleanCueText(lines.slice(timingIndex + 1).join("\n"));
        if (text) cues.push({ start, end, text });
    }

    return cues;
};

const timestampSeconds = timestamp => timestamp.split(":").reduce(
    (seconds, part) => seconds * 60 + Number(part), 0
);

const vttTimestamp = seconds => {
    const milliseconds = Math.round(seconds * 1000);
    if (!Number.isFinite(milliseconds) || milliseconds < 0) {
        throw new Error("invalid caption timestamp");
    }
    const hours = Math.floor(milliseconds / 3600000);
    const minutes = Math.floor(milliseconds / 60000) % 60;
    const remaining = milliseconds % 60000;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:`
        + `${(remaining / 1000).toFixed(3).padStart(6, "0")}`;
};

// HLS repeats boundary cues and may use a different local clock per segment.
// Keep the first segment's timeline while applying subsequent timestamp maps.
// https://www.rfc-editor.org/rfc/rfc8216#section-3.5
export const mergeCaptionSegments = segments => {
    const blocks = new Set();
    const metadata = new Set();
    const clockWrap = 2 ** 33;
    let firstOffset, previousMpeg;
    let adjustment;
    let wraps = 0;

    for (const segment of segments) {
        const normalized = segment.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
        const hasHeader = /^WEBVTT(?:\s|$)/.test(normalized);
        if (hasHeader) {
            const header = normalized.split(/\n{2,}/)[0];
            const map = header.match(/^X-TIMESTAMP-MAP=(.+)$/m)?.[1];
            const local = map?.match(/LOCAL:([\d:.]+)/)?.[1];
            const mpeg = map?.match(/MPEGTS:(\d+)/)?.[1];
            if (map && (!local || !mpeg)) throw new Error("invalid caption timestamp map");
            const timestamp = Number(mpeg);
            if (map && previousMpeg !== undefined
                && timestamp - previousMpeg < -clockWrap / 2) wraps++;
            if (map) previousMpeg = timestamp;
            const offset = map
                ? (timestamp + wraps * clockWrap) / 90000 - timestampSeconds(local)
                : 0;
            firstOffset ??= offset;
            adjustment = offset - firstOffset;
        } else if (adjustment === undefined) {
            throw new Error("invalid VTT segment");
        }

        const segmentBlocks = normalized.split(/\n{2,}/).slice(hasHeader ? 1 : 0);
        for (const block of segmentBlocks) {
            if (/^(STYLE|REGION)(?:\s|$)/.test(block)) {
                metadata.add(block.trimEnd());
                continue;
            }
            if (/^NOTE(?:\s|$)/.test(block)) continue;
            const lines = block.trimEnd().split("\n");
            const timingIndex = lines.findIndex(line => line.includes(" --> "));
            if (timingIndex < 0) continue;
            const timing = lines[timingIndex].match(/^(\S+)\s+-->\s+(\S+)(.*)$/);
            if (!timing) throw new Error("invalid caption cue");
            const start = vttTimestamp(timestampSeconds(timing[1]) + adjustment);
            const end = vttTimestamp(timestampSeconds(timing[2]) + adjustment);
            // Identifiers can change across segments; timing and payload identify a cue.
            blocks.add([
                `${start} --> ${end}${timing[3]}`,
                ...lines.slice(timingIndex + 1),
            ].join("\n"));
        }
    }
    return `WEBVTT\n\n${[...metadata, ...blocks].join("\n\n")}\n`;
};

const collapseRollingCues = cues => {
    const result = [];
    let run = [], rows = [], rolling = false;
    const flush = () => {
        if (rolling) {
            result.push({ ...run[0], end: run.at(-1).end, text: rows.join("\n") });
        } else {
            for (const cue of run) result.push(cue);
        }
        run = [];
        rows = [];
        rolling = false;
    };

    for (const cue of cues) {
        const nextRows = cue.text.split("\n");
        const previous = run.at(-1);
        let shared = 0;
        if (previous && timestampSeconds(cue.start) >= timestampSeconds(previous.start)
            && timestampSeconds(cue.start) <= timestampSeconds(previous.end)) {
            const previousRows = previous.text.split("\n");
            for (let count = Math.min(previousRows.length, nextRows.length); count > 0; count--) {
                if (previousRows.slice(-count).every((row, index) => row === nextRows[index])) {
                    shared = count;
                    break;
                }
            }
            // A changing multiline window distinguishes rolling text from repeated speech.
            if (shared && previous.text !== cue.text
                && (previousRows.length > 1 || nextRows.length > 1)) rolling = true;
        }
        if (!shared) flush();
        for (const row of nextRows.slice(shared)) rows.push(row);
        run.push(cue);
    }
    flush();
    return result;
};

const transcriptLines = cues => {
    const lines = [];
    let previous;
    for (const cue of collapseRollingCues(cues)) {
        const text = cue.text.replace(/\s*\n\s*/g, " ").replace(/\s+/g, " ").trim();
        if (!text) continue;

        const overlaps = previous
            && timestampSeconds(cue.start) >= timestampSeconds(previous.start)
            && timestampSeconds(cue.start) < timestampSeconds(previous.end);
        if (overlaps && (text === lines.at(-1) || text.startsWith(`${lines.at(-1)} `))) {
            lines[lines.length - 1] = text;
        } else {
            lines.push(text);
        }
        previous = cue;
    }
    return lines;
};

const srtTimestamp = timestamp => {
    const withHours = timestamp.split(":").length === 2 ? `00:${timestamp}` : timestamp;
    return withHours.replace(".", ",");
};

const escapeMarkdown = value => value.replace(/[\\`*_{}\[\]<>#+.!|~-]/g, "\\$&");

export const convertCaptions = (input, format, metadata = {}, sourceFormat = "vtt") => {
    if (!["vtt", "srt"].includes(sourceFormat)) throw new Error("unsupported caption source format");
    const cues = sourceFormat === "srt" ? parseSrt(input) : parseVtt(input);
    if (!cues.length) throw new Error("caption file has no cues");

    if (sourceFormat === "vtt" && format === "vtt") {
        return input.replace(/^\uFEFF/, "").replace(/\r\n?/g, "\n");
    }

    if (format === "vtt") {
        return "WEBVTT\n\n" + cues.map(cue => [
            `${cue.start} --> ${cue.end}`,
            cue.text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;"),
        ].join("\n")).join("\n\n") + "\n";
    }

    if (format === "srt") {
        return cues.map((cue, index) => [
            index + 1,
            `${srtTimestamp(cue.start)} --> ${srtTimestamp(cue.end)}`,
            cue.text,
        ].join("\n")).join("\n\n") + "\n";
    }

    const transcript = transcriptLines(cues);
    if (format === "txt") return transcript.join("\n\n") + "\n";

    if (format === "md") {
        const heading = `# ${escapeMarkdown(metadata.title || "Transcript")}`;
        const details = [
            metadata.author && `author: ${escapeMarkdown(metadata.author)}`,
            metadata.language && `language: ${escapeMarkdown(metadata.language)}`,
            metadata.source && `source: <${metadata.source}>`,
        ].filter(Boolean);

        return [ heading, ...details, ...transcript.map(escapeMarkdown) ].join("\n\n") + "\n";
    }

    throw new Error("unsupported caption format");
};
