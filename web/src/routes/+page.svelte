<script>
    import Omnibox from "../components/save/Omnibox.svelte";
</script>

<div id="cobalt-save-container">
    <main id="cobalt-save">
        <img
            id="meowbalt-smile"
            src="/meowbalt/smile.png"
            height="152"
            alt="black and white cat smiling and loafing"
        />
        <Omnibox />
    </main>
    <div id="terms-note">
        by continuing you agree to terms and ethics of use
    </div>
</div>

<style>
    #cobalt-save-container {
        display: flex;
        width: 100%;
        flex-direction: column;
        padding: var(--padding);
    }

    #cobalt-save {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 24px;
    }

    #meowbalt-smile {
        display: block;
        margin: 0;
    }

    #terms-note {
        bottom: 0;
        color: var(--gray);
        font-size: 13px;
        text-align: center;
        padding-bottom: var(--padding);
    }
</style>
