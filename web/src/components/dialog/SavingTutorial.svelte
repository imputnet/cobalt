<script lang="ts">
    import { siriShortcuts } from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import IconPlus from "@tabler/icons-svelte/IconPlus.svelte";
    import IconFlower from "@tabler/icons-svelte/IconFlower.svelte";
    import IconFolder from "@tabler/icons-svelte/IconFolder.svelte";

    let tutorialExpanded = false;
</script>

<div id="saving-tutorial" class:expanded={tutorialExpanded}>
    <button
        id="tutorial-button"
        class="button elevated"
        on:click={() => {
            tutorialExpanded = !tutorialExpanded;
        }}
    >
        <div class="expand-icon">
            <IconPlus />
        </div>
        {$t("save.tutorial.title")}
    </button>

    {#if tutorialExpanded}
        <div class="body-text tutorial-body">
            <div>
                {$t("save.tutorial.intro")}
            </div>

            <div class="numbered-list">
                <li>
                    {$t("save.tutorial.step.1")}
                    <div class="shortcut-list">
                        <a
                            class="button elevated shortcut"
                            href={siriShortcuts.photos}
                            aria-label={$t(
                                "a11y.save.tutorial.shortcut.photos"
                            )}
                        >
                            <IconFlower />
                            {$t("save.tutorial.shortcut.photos")}
                        </a>
                        <a
                            class="button elevated shortcut"
                            href={siriShortcuts.files}
                            aria-label={$t(
                                "a11y.save.tutorial.shortcut.files"
                            )}
                        >
                            <IconFolder />
                            {$t("save.tutorial.shortcut.files")}
                        </a>
                    </div>
                </li>
                <li>
                    {$t("save.tutorial.step.2")}
                </li>
                <li>
                    {$t("save.tutorial.step.3")}
                </li>
            </div>

            <div>
                {$t("save.tutorial.outro")}
            </div>
        </div>
    {/if}
</div>

<style>
    #saving-tutorial {
        display: flex;
        flex-direction: column;
        background: var(--button-elevated);
        border-radius: var(--border-radius);
    }

    #tutorial-button {
        font-size: 13px;
        width: 100%;
        justify-content: flex-start;
        padding: 8px;
    }

    .expand-icon {
        height: 18px;
        width: 18px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .expand-icon :global(svg) {
        height: 16px;
        width: 16px;
        stroke-width: 2px;
        color: var(--secondary);
        will-change: transform;
    }

    .expanded .expand-icon {
        transform: rotate(45deg);
    }

    .tutorial-body *:not(.shortcut) {
        font-size: 13px;
        font-weight: 500;
        line-height: 1.5;
        white-space: pre-wrap;
        user-select: text;
        -webkit-user-select: text;
    }

    .tutorial-body {
        color: var(--secondary);
        padding: var(--padding);
        padding-top: 6px;
    }

    .tutorial-body,
    .numbered-list {
        display: flex;
        flex-direction: column;
        gap: var(--padding);
    }

    .numbered-list {
        list-style-type: decimal;
    }

    .numbered-list li {
        margin-block: 0;
    }

    .shortcut-list {
        display: flex;
        padding-top: 6px;
        gap: 6px;
    }

    .shortcut {
        flex-direction: column;
        background: var(--button-elevated-hover);
        width: 100%;
        gap: 3px;
        text-decoration: none;
        font-size: 13px;
        padding: 8px;
    }

    .shortcut :global(svg) {
        height: 21px;
        width: 21px;
        stroke-width: 1.5px;
        stroke: var(--secondary);
    }
</style>
