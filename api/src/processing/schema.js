import { z } from "zod";
import { normalizeURL } from "./url.js";

export const apiSchema = z.object({
    url: z.string()
          .min(1)
          .transform(url => normalizeURL(url)),

    audioBitrate: z.enum(
        ["320", "256", "128", "96", "64", "8"]
    ).default("128"),

    audioFormat: z.enum(
        ["best", "mp3", "ogg", "wav", "opus"]
    ).default("mp3"),

    downloadMode: z.enum(
        ["auto", "audio", "mute"]
    ).default("auto"),

    filenameStyle: z.enum(
        ["classic", "pretty", "basic", "nerdy"]
    ).default("basic"),

    youtubeVideoCodec: z.enum(
        ["h264", "av1", "vp9"]
    ).default("h264"),

    videoQuality: z.enum(
        ["max", "4320", "2160", "1440", "1080", "720", "480", "360", "240", "144"]
    ).default("1080"),

    youtubeDubLang: z.string()
                     .min(2)
                     .max(8)
                     .regex(/^[0-9a-zA-Z\-]+$/)
                     .optional(),

    disableMetadata: z.boolean().default(false),

    allowH265: z.boolean().default(false),
    convertGif: z.boolean().default(true),
    tiktokFullAudio: z.boolean().default(false),

    alwaysProxy: z.boolean().default(false),
    localProcessing: z.boolean().default(false),

    youtubeHLS: z.boolean().default(false),
    youtubeBetterAudio: z.boolean().default(false),

    // temporarily kept for backwards compatibility with cobalt 10 schema
    twitterGif: z.boolean().default(false),
    tiktokH265: z.boolean().default(false),
})
.strict();
