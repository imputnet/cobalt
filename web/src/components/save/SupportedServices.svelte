<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { getServerInfo, cachedInfo } from "$lib/api/server-info";

    import Skeleton from "$components/misc/Skeleton.svelte";
    import IconPlus from "@tabler/icons-svelte/IconPlus.svelte";

    let services: string[] = [];

    $: expanded = false;
    $: loaded = false;

    const loadInfo = async () => {
        await getServerInfo();

        if ($cachedInfo) {
            loaded = true;
            services = $cachedInfo.info.cobalt.services;
        }
    };
</script>

<div id="supported-services">
    <button
        id="services-button"
        class:expanded
        on:click={async () => {
            expanded = !expanded;
            if (expanded && services.length === 0) {
                await loadInfo();
            }
        }}
        aria-label={$t(`save.services.title_${expanded ? "hide" : "show"}`)}
    >
        <div class="expand-icon">
            <IconPlus />
        </div>
        <span class="title">{$t("save.services.title")}</span>
    </button>

    <div id="services-popover" class:expanded>
        <div id="services-container">
            {#if loaded}
                {#each services as service}
                    <div class="service-item">{service}</div>
                {/each}
            {:else}
                {#each { length: 17 } as _}
                    <Skeleton
                        class="elevated"
                        width={Math.random() * 44 + 50 + "px"}
                        height="24.5px"
                    />
                {/each}
            {/if}
        </div>
        <div id="services-disclaimer" class="subtext">
            {$t("save.services.disclaimer")}
        </div>
    </div>
</div>

<style>
    #supported-services {
        display: flex;
        position: relative;
        max-width: 400px;
        flex-direction: column;
        align-items: center;
        height: 35px;
    }

    #services-popover {
        display: flex;
        flex-direction: column;
        transition: transform 0.2s cubic-bezier(0.53, 0.05, 0.23, 0.99);
        border-radius: 18px;
        background: var(--button);
        box-shadow:
            var(--button-box-shadow),
            0 0 10px 10px var(--button-stroke);

        transform: scale(0);
        transform-origin: top center;
        position: relative;

        padding: 12px;
        gap: 6px;
        top: 6px;
    }

    #services-popover.expanded {
        transform: scale(1);
    }

    #services-button {
        gap: 9px;
        padding: 7px 13px 7px 10px;
        justify-content: flex-start;
        border-radius: 18px;
        display: flex;
        flex-direction: row;
        font-size: 13px;
        font-weight: 500;
        background: none;
    }

    #services-button:not(:focus-visible) {
        box-shadow: none;
    }

    .expand-icon {
        height: 22px;
        width: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 18px;
        background: var(--button-elevated);
        padding: 0;
        box-shadow: none;
        transition: transform 0.2s;
    }

    #services-button:active .expand-icon {
        background: var(--button-elevated-hover);
    }

    @media (hover: hover) {
        #services-button:hover .expand-icon {
            background: var(--button-elevated-hover);
        }
    }

    .expand-icon :global(svg) {
        height: 18px;
        width: 18px;
        stroke-width: 2px;
        color: var(--secondary);
        will-change: transform;
    }

    .expanded .expand-icon {
        transform: rotate(45deg);
    }

    #services-container {
        display: flex;
        flex-wrap: wrap;
        flex-direction: row;
        gap: 3px;
    }

    .service-item {
        display: flex;
        padding: 4px 8px;
        border-radius: calc(var(--border-radius) / 2);
        background: var(--button-elevated);
        font-size: 12.5px;
        font-weight: 500;
    }

    #services-disclaimer {
        padding: 0;
    }

    @media screen and (max-width: 535px) {
        .expand-icon {
            height: 21px;
            width: 21px;
        }

        .expand-icon :global(svg) {
            height: 16px;
            width: 16px;
        }
    }
</style>
