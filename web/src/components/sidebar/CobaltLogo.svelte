<script>
    import IconCobalt from "$components/icons/Cobalt.svelte";
</script>

<div id="cobalt-logo">
    <IconCobalt />
    <span id="brand-name">SnapSave</span>
</div>

<style>
    #cobalt-logo {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: calc(var(--sidebar-tab-padding) * 2);
        padding-bottom: calc(var(--sidebar-tab-padding) * 2 - var(--sidebar-inner-padding));
        gap: 6px;
    }

    #brand-name {
        font-size: 10px;
        font-weight: 700;
        letter-spacing: 0.5px;
        color: var(--sidebar-highlight);
        opacity: 0.9;
        text-transform: uppercase;
    }

    @media screen and (max-width: 535px) {
        #cobalt-logo {
            display: none;
        }
    }
</style>
