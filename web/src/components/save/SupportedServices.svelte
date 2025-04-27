<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import cachedInfo from "$lib/state/server-info";
    import { getServerInfo } from "$lib/api/server-info";

    import Skeleton from "$components/misc/Skeleton.svelte";
    import IconPlus from "@tabler/icons-svelte/IconPlus.svelte";
    import PopoverContainer from "$components/misc/PopoverContainer.svelte";

    let services: string[] = [];

    $: expanded = false;

    let servicesContainer: HTMLDivElement;
    $: loaded = false;

    const loadInfo = async () => {
        await getServerInfo();

        if ($cachedInfo) {
            loaded = true;
            services = $cachedInfo.info.cobalt.services;
        }
    };

    const popoverAction = async () => {
        expanded = !expanded;
        if (expanded && services.length === 0) {
            await loadInfo();
        }
        if (expanded) {
            servicesContainer.focus();
        }
    };
</script>

<div id="supported-services" class:expanded>
    <button
        id="services-button"
        class="button"
        on:click={popoverAction}
        aria-label={$t(`save.services.title_${expanded ? "hide" : "show"}`)}
    >
        <div class="expand-icon">
            <IconPlus />
        </div>
        <span class="title">{$t("save.services.title")}</span>
    </button>

    <PopoverContainer id="services-popover" {expanded}>
        <div
            id="services-container"
            bind:this={servicesContainer}
            tabindex="-1"
        >
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
    </PopoverContainer>
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
        transition:
            background 0.2s,
            box-shadow 0.1s;
    }

    #services-button:not(:active) {
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
        transition:
            background 0.2s,
            transform 0.2s;
    }

    #services-button:active {
        background: var(--button-hover-transparent);
    }

    @media (hover: hover) {
        #services-button:hover {
            background: var(--button-hover-transparent);
        }

        #services-button:active {
            background: var(--button-press-transparent);
        }

        #services-button:hover .expand-icon {
            background: var(--button-elevated-hover);
        }
    }

    @media (hover: none) {
        #services-button:active {
            box-shadow: none;
        }
    }

    #services-button:active .expand-icon {
        background: var(--button-elevated-press);
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
        user-select: none;
        -webkit-user-select: none;
    }

    .expanded #services-disclaimer {
        padding: 0;
        user-select: text;
        -webkit-user-select: text;
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
