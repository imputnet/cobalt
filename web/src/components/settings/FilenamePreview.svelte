<script lang="ts">
    import settings from "$lib/state/settings";
    import { t } from "$lib/i18n/translations";

    let videoFilePreview: string;
    let audioFilePreview: string;

    const videoTitle = $t("settings.metadata.filename.preview.video");
    const audioTitle = $t("settings.metadata.filename.preview.audio");

    const infoBase = ["youtube", "dQw4w9WgXcQ"];

    const fullResolution = {
        "2160": "3840x2160",
        "1440": "2560x1440",
        "1080": "1920x1080",
        "720": "1280x720",
        "480": "854x480",
        "360": "640x360",
        "240": "426x240",
        "144": "256x144",
    };

    let { downloadMode, youtubeVideoCodec, audioFormat, videoQuality } =
        $settings.save;

    let youtubeVideoExt = youtubeVideoCodec === "vp9" ? "webm" : "mp4";

    audioFormat = audioFormat !== "best" ? audioFormat : "opus";
    videoQuality = videoQuality !== "max" ? videoQuality : "2160";

    if (youtubeVideoCodec === "h264" && Number(videoQuality) > 1080) {
        videoQuality = "1080";
    }

    let classicTags = infoBase.concat([
        fullResolution[videoQuality],
        youtubeVideoCodec,
    ]);

    let basicTags = [`${videoQuality}p`, youtubeVideoCodec];

    if (downloadMode === "mute") {
        classicTags.push("mute");
        basicTags.push("mute");
    }

    $: switch ($settings.save.filenameStyle) {
        case "classic":
            videoFilePreview = classicTags.join("_");
            audioFilePreview = "youtube_dQw4w9WgXcQ_audio";
            break;
        case "basic":
            videoFilePreview = `${videoTitle} (${basicTags.join(", ")})`;
            audioFilePreview = audioTitle;
            break;
        case "pretty":
            videoFilePreview = `${videoTitle} (${[...basicTags, infoBase[0]].join(", ")})`;
            audioFilePreview = `${audioTitle} (${infoBase[0]})`;
            break;
        case "nerdy":
            videoFilePreview = `${videoTitle} (${basicTags.concat(infoBase).join(", ")})`;
            audioFilePreview = `${audioTitle} (${infoBase.join(", ")})`;
            break;
    }
</script>

<div id="filename-preview">
    <div id="filename-preview-video">
        {videoFilePreview}.{youtubeVideoExt}
    </div>
    <div id="filename-preview-audio">
        {audioFilePreview}.{audioFormat}
    </div>
</div>

<style>
    #filename-preview {
        font-size: 14px;
        font-weight: 500;
        padding: 0 var(--padding);
    }
</style>
