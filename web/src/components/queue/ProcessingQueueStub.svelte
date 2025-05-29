<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import Meowbalt from "$components/misc/Meowbalt.svelte";
</script>

<div class="queue-stub">
    <Meowbalt emotion="think" />
    <span class="subtext stub-text">
        {$t("queue.stub", {
            value: $t("queue.stub"),
        })}
    </span>
</div>

<style>
    .queue-stub {
        --base-padding: calc(var(--padding) * 1.5);
        font-size: 13px;
        font-weight: 500;
        color: var(--gray);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--base-padding);
        padding-bottom: calc(var(--base-padding) + 16px);
        text-align: center;
        gap: var(--padding);
    }

    .queue-stub :global(.meowbalt) {
        height: 120px;
    }

    .stub-text {
        padding: 0;
    }
</style>
