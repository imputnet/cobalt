<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import IconComet from "@tabler/icons-svelte/IconComet.svelte";
</script>

<div id="update-notification" role="alert" aria-atomic="true">
    <button class="update-button" on:click={() => window.location.reload()}>
        <div class="update-icon">
            <IconComet />
        </div>
        <div class="update-text">
            <div>{$t("notification.update.title")}</div>
            <div class="subtext">{$t("notification.update.subtext")}</div>
        </div>
    </button>
</div>

<style>
    #update-notification {
        position: absolute;
        display: flex;
        justify-content: end;
        align-items: center;
        width: 100%;
        pointer-events: none;
        z-index: 2;
    }

    .update-button {
        padding: 8px 12px 8px 8px;
        pointer-events: all;
        gap: 8px;
        margin: var(--padding);
        margin-top: calc(env(safe-area-inset-top) + var(--padding));
        box-shadow:
            var(--button-box-shadow),
            0 0 10px 0px var(--button-elevated-hover);
        border-radius: 14px;
        animation: slide-in-top 0.4s;
    }

    .update-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        background-color: var(--button-elevated-hover);
        padding: 3px;
        border-radius: 6px;
    }

    .update-icon :global(svg) {
        stroke-width: 1.5px;
        width: 25px;
        height: 25px;
        will-change: transform;
    }

    .update-text {
        display: flex;
        flex-direction: column;
        text-align: left;
        font-size: 13px;
    }

    .subtext {
        padding: 0;
        user-select: none;
        -webkit-user-select: none;
    }

    .update-text,
    .subtext {
        line-height: 1.2;
    }

    @keyframes slide-in-top {
        from {
            transform: translateY(-150px);
        }
        100% {
            transform: none;
        }
    }

    @media screen and (max-width: 535px) {
        #update-notification {
            bottom: var(--sidebar-height-mobile);
            justify-content: center;
            animation: slide-in-bottom 0.4s;
        }

        @keyframes slide-in-bottom {
            from {
                transform: translateY(300px);
            }
            100% {
                transform: none;
            }
        }
    }
</style>
