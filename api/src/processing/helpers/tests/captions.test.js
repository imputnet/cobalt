import test from "node:test";
import assert from "node:assert/strict";

import { captionSegmentResources, selectCaptionTrack } from "../captions.js";
import { convertCaptions, mergeCaptionSegments, parseSrt, parseVtt } from "../caption-formats.js";
import { apiSchema } from "../../schema.js";

const sample = `\uFEFFWEBVTT\r
\r
NOTE generated fixture\r
ignored\r
\r
first cue\r
00:00.000 --> 00:02.500 align:start position:0%\r
<c.colorE5E5E5>Hello &amp; welcome</c>\r
\r
00:02.500 --> 00:04.000\r
Hello &amp; welcome back\r
\r
00:04.000 --> 00:06.250\r
<v Speaker>Final line</v>\r
`;

const sampleSrt = `1\r
00:00:00,000 --> 00:00:02,500\r
Hello &amp; welcome\r
\r
2\r
00:00:02,500 --> 00:00:04,000\r
Final line\r
`;

test("parseVtt extracts and cleans cues", () => {
    assert.deepEqual(parseVtt(sample), [
        { start: "00:00.000", end: "00:02.500", text: "Hello & welcome" },
        { start: "00:02.500", end: "00:04.000", text: "Hello & welcome back" },
        { start: "00:04.000", end: "00:06.250", text: "Final line" },
    ]);
});

test("SRT input converts to transcripts and VTT", () => {
    assert.equal(parseSrt(sampleSrt).length, 2);
    assert.equal(
        convertCaptions(sampleSrt, "txt", {}, "srt"),
        "Hello & welcome\n\nFinal line\n"
    );
    assert.match(
        convertCaptions(sampleSrt, "vtt", {}, "srt"),
        /^WEBVTT\n\n00:00:00\.000 --> 00:00:02\.500/
    );
});

test("plain text collapses growing automatic-caption cues", () => {
    assert.equal(
        convertCaptions(sample.replace("00:02.500 -->", "00:01.500 -->"), "txt"),
        "Hello & welcome back\n\nFinal line\n"
    );
});

test("SRT output numbers cues and converts timestamps", () => {
    assert.match(convertCaptions(sample, "srt"), /^1\n00:00:00,000 --> 00:00:02,500/);
    assert.match(convertCaptions(sample, "srt"), /3\n00:00:04,000 --> 00:00:06,250\nFinal line\n$/);
});

test("Markdown output includes escaped metadata and transcript", () => {
    const markdown = convertCaptions(sample, "md", {
        title: "A *small* test",
        author: "cobalt",
        language: "en",
        source: "https://www.youtube.com/watch?v=abc",
    });

    assert.match(markdown, /^# A \\\*small\\\* test/);
    assert.match(markdown, /language: en/);
    assert.match(markdown, /source: <https:\/\/www\.youtube\.com\/watch\?v=abc>/);
});

test("VTT output is passed through with normalized newlines", () => {
    const output = convertCaptions(sample, "vtt");
    assert.ok(output.startsWith("WEBVTT\n"));
    assert.ok(!output.includes("\r"));
});

test("caption selection prefers manual tracks and matches base languages", () => {
    const tracks = [
        { url: "auto", language: "en-US", automatic: true },
        { url: "manual", language: "en-GB" },
        { url: "french", language: "fr" },
    ];

    assert.equal(selectCaptionTrack(tracks, "en", true), tracks[1]);
    assert.equal(selectCaptionTrack(tracks, "en-AU", true), tracks[1]);
    assert.equal(selectCaptionTrack(tracks, "en-US", false), tracks[1]);
    assert.equal(selectCaptionTrack(tracks, undefined, true), tracks[1]);
    assert.equal(selectCaptionTrack(tracks, "de", true), undefined);
});

test("empty and unknown caption formats fail", () => {
    assert.throws(() => convertCaptions("WEBVTT\n", "txt"));
    assert.throws(() => convertCaptions(sample, "json"));
});

test("caption API requests default to plain text and reject unknown formats", () => {
    const parsed = apiSchema.safeParse({
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        downloadMode: "captions",
    });

    assert.equal(parsed.success, true);
    assert.equal(parsed.data.captionFormat, "txt");
    assert.equal(parsed.data.downloadMode, "captions");

    assert.equal(apiSchema.safeParse({
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        downloadMode: "captions",
        captionFormat: "json",
    }).success, false);
});

test("adjoining rolling windows collapse but separate repeated speech survives", () => {
    const input = "WEBVTT\n\n"
        + "00:00.000 --> 00:00.010\nA new game\n\n"
        + "00:00.010 --> 00:02.000\nA new game\n\n"
        + "00:02.000 --> 00:04.000\nA new game\nwith a large world\n\n"
        + "00:04.000 --> 00:06.000\nwith a large world\n\n"
        + "00:10.000 --> 00:11.000\nNo.\n\n"
        + "00:11.000 --> 00:12.000\nNo.\n";
    assert.equal(convertCaptions(input, "txt"), "A new game with a large world\n\nNo.\n\nNo.\n");
    assert.equal(convertCaptions(input, "md"), "# Transcript\n\nA new game with a large world\n\nNo\\.\n\nNo\\.\n");
    assert.equal(parseVtt(convertCaptions(input, "vtt")).length, 6);
    assert.equal(parseSrt(convertCaptions(input, "srt")).length, 6);
});

test("HLS merging preserves cue settings and markup and removes repeated boundary cues", () => {
    const cue = "00:00:09.000 --> 00:00:12.000 align:start\n<v Speaker>Hello &amp; welcome</v>";
    const merged = mergeCaptionSegments([
        `WEBVTT\n\nSTYLE\n::cue { color: white; }\n\nfirst-id\n${cue}\n`,
        `WEBVTT\n\nnew-id\n${cue}\n\n00:00:12.000 --> 00:00:14.000\nSecond segment\n`,
        "WEBVTT\n",
    ]);
    assert.equal(parseVtt(merged).length, 2);
    assert.ok(merged.includes(cue));
    assert.ok(merged.includes("STYLE\n::cue { color: white; }"));
    assert.equal(convertCaptions(merged, "txt"), "Hello & welcome\n\nSecond segment\n");
});

test("HLS merging accepts media fragments after an initialization section", () => {
    const merged = mergeCaptionSegments([
        "WEBVTT\nX-TIMESTAMP-MAP=LOCAL:00:00:00.000,MPEGTS:900000\n",
        "00:00:00.000 --> 00:00:02.000\nFirst fragment\n",
        "00:00:02.000 --> 00:00:04.000\nSecond fragment\n",
    ]);
    assert.equal(convertCaptions(merged, "txt"), "First fragment\n\nSecond fragment\n");
});

test("HLS resources include changed initialization sections and byte ranges", () => {
    const map = { uri: "captions.vtt", byterange: { offset: 0, length: 100 } };
    const resources = captionSegmentResources([
        { uri: "captions.vtt", byterange: { offset: 100, length: 50 }, map },
        { uri: "captions.vtt", byterange: { offset: 150, length: 60 }, map },
        {
            uri: "captions.vtt",
            byterange: { offset: 310, length: 70 },
            map: { uri: "captions.vtt", byterange: { offset: 210, length: 100 } },
        },
    ], "https://example.com/path/playlist.m3u8");

    assert.deepEqual(resources.map(resource => resource.headers.range), [
        "bytes=0-99",
        "bytes=100-149",
        "bytes=150-209",
        "bytes=210-309",
        "bytes=310-379",
    ]);
    assert.ok(resources.every(resource => resource.url === "https://example.com/path/captions.vtt"));
});
