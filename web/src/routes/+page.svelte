<script>
    import Omnibox from "../components/save/Omnibox.svelte";
    import MeowbaltLoaf from "../components/meowbalt/MeowbaltLoaf.svelte";
</script>

<div id="cobalt-save-container" class="center-column-container">
    <main id="cobalt-save">
        <MeowbaltLoaf />
        <Omnibox />
    </main>
    <div id="terms-note">
        by continuing you agree to terms and ethics of use
    </div>
</div>

<style>
    #cobalt-save {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 15px;
    }

    #terms-note {
        bottom: 0;
        color: var(--gray);
        font-size: 13px;
        text-align: center;
        padding-bottom: var(--padding);
    }

    @media screen and (max-width: 535px) {
        #terms-note {
            font-size: 11px;
        }
    }
</style>
