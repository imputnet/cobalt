<script lang="ts">
    import settings from "$lib/state/settings";
    import { t } from "$lib/i18n/translations";

    import IconMovie from "@tabler/icons-svelte/IconMovie.svelte";
    import IconMusic from "@tabler/icons-svelte/IconMusic.svelte";

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
    <div id="filename-preview-video" class="filename-preview-item">
        <div class="item-icon">
            <IconMovie />
        </div>
        <div class="item-text">
            <div class="preview">{`${videoFilePreview}.${youtubeVideoExt}`}</div>
            <div class="subtext description">video file preview</div>
        </div>
    </div>
    <div id="filename-preview-audio" class="filename-preview-item">
        <div class="item-icon">
            <IconMusic />
        </div>
        <div class="item-text">
            <div class="preview">{`${audioFilePreview}.${audioFormat}`}</div>
            <div class="subtext description">audio file preview</div>
        </div>
    </div>
</div>

<style>
    #filename-preview {
        font-weight: 500;

        display: flex;
        flex-direction: column;

        background: var(--button);
        box-shadow: var(--button-box-shadow);
        border-radius: var(--border-radius);
    }

    .filename-preview-item {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        gap: 8px;
        padding: 8px var(--padding);
    }

    .filename-preview-item:first-child {
        border-bottom: 1.5px var(--button-stroke) solid;
    }

    .item-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        border-radius: 6px;
        background-color: var(--gray);
    }

    .item-icon :global(svg) {
        stroke: var(--white);
        stroke-width: 1.5px;
        height: 22px;
        width: 22px;
        will-change: transform;
    }

    .item-text {
        display: flex;
        flex-direction: column;
        font-size: 14px;
        overflow-wrap: anywhere;
    }

    .item-text .preview {
        line-height: 1.3;
    }

    .item-text .description {
        padding: 0;
    }

    @media screen and (max-width: 750px) {
        .item-text {
            font-size: 13px;
        }
    }
</style>
