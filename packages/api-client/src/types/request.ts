import { z } from "zod";

// FIXME: this is duplicated from api/src/processing/schema.js
//        (minus defaults) until the api is converted to TS
const apiSchema = z.object({
    url: z.string()
          .min(1),

    audioBitrate: z.enum(
        ["320", "256", "128", "96", "64", "8"]
    ).optional(),

    audioFormat: z.enum(
        ["best", "mp3", "ogg", "wav", "opus"]
    ).optional(),

    downloadMode: z.enum(
        ["auto", "audio", "mute"]
    ).optional(),

    filenameStyle: z.enum(
        ["classic", "pretty", "basic", "nerdy"]
    ).optional(),

    youtubeVideoCodec: z.enum(
        ["h264", "av1", "vp9"]
    ).optional(),

    videoQuality: z.enum(
        ["max", "4320", "2160", "1440", "1080", "720", "480", "360", "240", "144"]
    ).optional(),

    youtubeDubLang: z.string()
                     .length(2)
                     .optional(),

    alwaysProxy: z.boolean().optional(),
    disableMetadata: z.boolean().optional(),
    tiktokFullAudio: z.boolean().optional(),
    tiktokH265: z.boolean().optional(),
    twitterGif: z.boolean().optional(),
    youtubeDubBrowserLang: z.boolean().optional()
})
.strict();

export type CobaltRequest = z.infer<typeof apiSchema>;
