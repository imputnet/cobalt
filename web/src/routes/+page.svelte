<script>
    import { t } from "$lib/i18n/translations";

    import Omnibox from "$components/save/Omnibox.svelte";
    import AnimatedVisualization from "$components/visualization/AnimatedVisualization.svelte";
</script>

<svelte:head>
    <title>{$t("general.cobalt")}</title>
    <meta property="og:title" content={$t("general.cobalt")} />
</svelte:head>

<div id="cobalt-save-container" class="center-column-container">
    <main
        id="cobalt-save"
        tabindex="-1"
        data-first-focus
    >
        <div id="brand">
            <img src="/abkdarrk-logo.png" alt="Abkdarrk-URL" id="brand-logo" />
            <h1 id="brand-title">Abkdarrk-URL</h1>
            <p id="brand-sub">{$t("general.embed.description")}</p>
        </div>

        <div id="visualization-wrapper">
            <AnimatedVisualization />
        </div>

        <div id="input-wrapper">
            <Omnibox />
        </div>

        <p id="terms-note">
            {$t("save.terms.note.agreement")}
            <a href="/about/terms">{$t("save.terms.note.link")}</a>
        </p>
    </main>
</div>

<style>
    #cobalt-save-container {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        padding: var(--padding);
        overflow: hidden;
    }

    #cobalt-save {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        max-width: 800px;
        gap: 28px;
    }

    /* visualization wrapper */
    #visualization-wrapper {
        width: 100%;
        display: flex;
        justify-content: flex-end;
        padding-right: 20px;
        margin-top: 10px;
    }

    @media screen and (max-width: 768px) {
        #visualization-wrapper {
            padding-right: 0;
            justify-content: center;
        }
    }

    /* brand block */
    #brand {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        text-align: center;
    }

    #brand-logo {
        width: 72px;
        height: auto;
        filter: drop-shadow(0 0 18px rgba(249, 115, 22, 0.55));
        animation: float 4s ease-in-out infinite;
        pointer-events: none;
    }

    @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50%       { transform: translateY(-7px); }
    }

    #brand-title {
        font-size: 28px;
        font-weight: 700;
        color: var(--orange);
        letter-spacing: -0.5px;
        margin: 0;
        line-height: 1.1;
        text-shadow: 0 0 24px rgba(249, 115, 22, 0.4);
    }

    #brand-sub {
        font-size: 13px;
        color: var(--gray);
        margin: 0;
        font-weight: 500;
        line-height: 1.5;
        max-width: 340px;
    }

    /* omnibox wrapper — full width, centered */
    #input-wrapper {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    /* terms */
    #terms-note {
        font-size: 11.5px;
        color: var(--gray);
        text-align: center;
        font-weight: 500;
        margin: 0;
        opacity: 0.75;
        line-height: 1.6;
    }

    #terms-note a {
        color: var(--orange);
        text-decoration: none;
        opacity: 0.9;
    }

    #terms-note a:hover {
        text-decoration: underline;
    }

    /* mobile */
    @media screen and (max-width: 535px) {
        #cobalt-save-container {
            padding: var(--padding) calc(var(--padding) * 0.75);
        }

        #cobalt-save {
            gap: 22px;
        }

        #brand-logo {
            width: 56px;
        }

        #brand-title {
            font-size: 22px;
        }
    }
</style>
