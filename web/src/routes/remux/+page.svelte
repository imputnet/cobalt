<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { createRemuxPipeline } from "$lib/task-manager/queue";

    import DropReceiver from "$components/misc/DropReceiver.svelte";
    import FileReceiver from "$components/misc/FileReceiver.svelte";
    import BulletExplain from "$components/misc/BulletExplain.svelte";

    import IconRepeat from "@tabler/icons-svelte/IconRepeat.svelte";
    import IconDevices from "@tabler/icons-svelte/IconDevices.svelte";
    import IconInfoCircle from "@tabler/icons-svelte/IconInfoCircle.svelte";

    let draggedOver = false;
    let files: FileList | undefined;

    const remux = async () => {
        if (!files) return;

        for (let i = 0; i < files?.length; i++) {
            const type = files[i].type;
            // TODO: stricter type limits?
            if (type.startsWith("video/") || type.startsWith("audio/")) {
                createRemuxPipeline(files[i]);
            }
        }

        files = undefined;
    };
</script>

<svelte:head>
    <title>{$t("tabs.remux")} ~ {$t("general.cobalt")}</title>
    <meta
        property="og:title"
        content="{$t('tabs.remux')} ~ {$t('general.cobalt')}"
    />
</svelte:head>

<DropReceiver bind:files bind:draggedOver onDrop={remux} id="remux-container">
    <div id="remux-open" tabindex="-1" data-first-focus>
        <div id="remux-receiver">
            <FileReceiver
                bind:draggedOver
                bind:files
                onImport={remux}
                acceptTypes={["video/*", "audio/*"]}
                acceptExtensions={[
                    "mp4",
                    "webm",
                    "mp3",
                    "ogg",
                    "opus",
                    "wav",
                    "m4a",
                ]}
            />
        </div>

        <div id="remux-bullets">
            <BulletExplain
                title={$t("remux.bullet.purpose.title")}
                description={$t("remux.bullet.purpose.description")}
                icon={IconRepeat}
            />

            <BulletExplain
                title={$t("remux.bullet.explainer.title")}
                description={$t("remux.bullet.explainer.description")}
                icon={IconInfoCircle}
            />

            <BulletExplain
                title={$t("remux.bullet.privacy.title")}
                description={$t("remux.bullet.privacy.description")}
                icon={IconDevices}
            />
        </div>
    </div>
</DropReceiver>

<style>
    :global(#remux-container) {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }

    #remux-open {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        text-align: center;
        gap: 48px;
    }

    #remux-receiver {
        max-width: 450px;
        display: flex;
        flex-direction: column;
        gap: var(--padding);
    }

    #remux-bullets {
        display: flex;
        flex-direction: column;
        gap: 18px;
        max-width: 450px;
    }

    @media screen and (max-width: 920px) {
        #remux-open {
            flex-direction: column;
            gap: var(--padding);
        }

        #remux-bullets {
            padding: var(--padding);
        }
    }

    @media screen and (max-width: 535px) {
        #remux-bullets {
            gap: var(--padding);
        }
    }

    @media screen and (max-height: 750px) and (max-width: 535px) {
        :global(#remux-container:not(.processing)) {
            justify-content: start;
            align-items: start;
            padding-top: var(--padding);
        }
    }
</style>
