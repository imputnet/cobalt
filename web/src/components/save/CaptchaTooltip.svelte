<script lang="ts">
    import { t } from "$lib/i18n/translations";

    type Props = {
        visible: boolean;
    };

    let { visible }: Props = $props();
</script>

<div class="tooltip-holder" class:visible aria-hidden="true">
    <div class="tooltip-body">
        <div class="tooltip-content subtext">
            {$t("save.tooltip.captcha")}
        </div>
        <div class="tooltip-pointer border"></div>
        <div class="tooltip-pointer"></div>
    </div>
</div>

<style>
    .tooltip-holder {
        position: absolute;
        bottom: calc(100% + 10px);

        opacity: 0;
        transform: scale(0.5) translateX(10px) translateY(15px);
        transform-origin: bottom left;

        transition:
            transform 0.2s cubic-bezier(0.53, 0.05, 0.23, 1.15),
            opacity 0.2s cubic-bezier(0.53, 0.05, 0.23, 0.99);

        will-change: transform, opacity;
    }

    .tooltip-holder.visible {
        opacity: 1;
        transform: none;
    }

    .tooltip-body {
        max-width: 180px;
        position: relative;

        pointer-events: none;

        padding: 8px 14px;
        border-radius: 11px;

        background: var(--button);
        box-shadow: var(--button-box-shadow);

        filter: drop-shadow(0 0 8px var(--popover-glow));
    }

    .tooltip-content {
        padding: 0;
    }

    .tooltip-pointer {
        position: absolute;
        top: calc(100% - 7px);
        left: 14px;
        transform: rotate(45deg);
        background: var(--button);
        z-index: 2;
        height: 10px;
        width: 10px;
    }

    .tooltip-pointer.border {
        box-shadow: var(--button-box-shadow);
        z-index: 1;
        margin-top: 2px;
    }
</style>
