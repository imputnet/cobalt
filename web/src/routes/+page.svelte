<script>
    import { t } from "$lib/i18n/translations";

    import Omnibox from "$components/save/Omnibox.svelte";
    import SupportedServices from "$components/save/SupportedServices.svelte";
</script>

<svelte:head>
    <title>{$t("general.cobalt")}</title>
    <meta property="og:title" content={$t("general.cobalt")} />
</svelte:head>

<div id="cobalt-save-container" class="center-column-container">
    <SupportedServices />
    <main
        id="cobalt-save"
        tabindex="-1"
        data-first-focus
    >
        <div id="hero-section">
            <img src="/abkdarrk-logo.png" alt="Abkdarrk-URL" id="hero-logo" />
            <h1 id="hero-title">Abkdarrk-URL</h1>
            <p id="hero-subtitle">Download any video or audio from the web</p>
        </div>
        <Omnibox />
        <div id="features-grid">
            <div class="feature-card">
                <div class="feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
                    </svg>
                </div>
                <h3>No Ads</h3>
                <p>Clean experience without interruptions</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" x2="12" y1="15" y2="3"/>
                    </svg>
                </div>
                <h3>Fast Download</h3>
                <p>High-speed servers worldwide</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="m15 9-6 6"/>
                        <path d="m9 9 6 6"/>
                    </svg>
                </div>
                <h3>No Tracking</h3>
                <p>Your privacy is protected</p>
            </div>
        </div>
    </main>
    <div id="terms-note">
        {$t("save.terms.note.agreement")}
        <a href="/about/terms">{$t("save.terms.note.link")}</a>
    </div>
</div>

<style>
    #cobalt-save-container {
        padding: var(--padding);
        overflow: hidden;
        background: radial-gradient(ellipse at top, rgba(34, 211, 238, 0.08) 0%, transparent 50%);
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

    #hero-section {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        text-align: center;
    }

    #hero-logo {
        width: 100px;
        height: auto;
        filter: drop-shadow(0 0 20px rgba(34, 211, 238, 0.5));
        animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-8px); }
    }

    #hero-title {
        font-size: 32px;
        font-weight: 700;
        color: #22d3ee;
        text-shadow: 0 0 20px rgba(34, 211, 238, 0.5);
        letter-spacing: -1px;
        margin: 0;
    }

    #hero-subtitle {
        font-size: 14px;
        color: var(--gray);
        margin: 0;
        font-weight: 500;
    }

    #features-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        max-width: 640px;
        width: 100%;
        margin-top: 8px;
    }

    .feature-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 16px 12px;
        background: var(--button);
        border-radius: var(--border-radius);
        border: 1px solid var(--button-stroke);
        transition: all 0.2s ease;
        text-align: center;
    }

    .feature-card:hover {
        background: var(--button-hover);
        border-color: rgba(34, 211, 238, 0.2);
        transform: translateY(-2px);
        box-shadow: 0 4px 20px rgba(34, 211, 238, 0.1);
    }

    .feature-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(34, 211, 238, 0.1);
        border-radius: 10px;
        color: #22d3ee;
    }

    .feature-card h3 {
        font-size: 13px;
        font-weight: 600;
        color: var(--secondary);
        margin: 0;
    }

    .feature-card p {
        font-size: 11px;
        color: var(--gray);
        margin: 0;
        line-height: 1.4;
    }

    #terms-note {
        bottom: 0;
        color: var(--gray);
        font-size: 12px;
        text-align: center;
        padding-bottom: 6px;
        font-weight: 500;
    }

    #terms-note a {
        color: #22d3ee;
        text-decoration: none;
    }

    #terms-note a:hover {
        text-decoration: underline;
    }

    @media screen and (max-width: 535px) {
        #cobalt-save-container {
            padding-top: calc(var(--padding) / 2);
        }

        #hero-logo {
            width: 80px;
        }

        #hero-title {
            font-size: 24px;
        }

        #features-grid {
            grid-template-columns: 1fr;
        }

        .feature-card {
            flex-direction: row;
            text-align: left;
            gap: 12px;
        }

        .feature-card .feature-icon {
            flex-shrink: 0;
        }

        .feature-card > div:last-child {
            display: flex;
            flex-direction: column;
            gap: 2px;
        }

        #terms-note {
            font-size: 11px;
            padding-bottom: 0;
        }
    }
</style>
