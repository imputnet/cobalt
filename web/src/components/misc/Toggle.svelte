<script lang="ts">
    export let enabled: boolean;
</script>

<div class="toggle" class:enabled>
    <div class="toggle-switcher"></div>
</div>

<style>
    .toggle {
        --base-size: 22px;
        --ratio-factor: 0.9;
        --enabled-pos: calc(100% * var(--ratio-factor));

        display: flex;
        justify-content: start;
        align-items: center;
        min-width: calc(var(--base-size) * (1 + var(--ratio-factor)));
        padding: 2px;
        aspect-ratio: 2/1;
        border-radius: 5px;
        border-radius: 100px;
        background: var(--toggle-bg);
        transition: background 0.2s;
    }

    .toggle:dir(rtl) {
        --enabled-pos: calc(-100% * var(--ratio-factor));
    }

    .toggle-switcher {
        height: var(--base-size);
        width: var(--base-size);
        background: var(--white);
        border-radius: 100px;
        transform: translateX(0%);
        transition: transform 0.2s, width 0.2s;
    }

    .toggle.enabled {
        background: var(--toggle-bg-enabled);
    }

    .toggle.enabled .toggle-switcher {
        transform: translateX(var(--enabled-pos));
    }

    :global(.toggle-container:active .toggle:not(.enabled) .toggle-switcher) {
        width: calc(var(--base-size) * 1.3);
    }
</style>
