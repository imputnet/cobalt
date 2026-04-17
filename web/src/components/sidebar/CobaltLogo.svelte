<div id="cobalt-logo">
    <img src="/abkdarrk-logo.png" alt="Abkdarrk-URL" />
</div>

<style>
    #cobalt-logo {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: calc(var(--sidebar-tab-padding) * 1.5);
        padding-bottom: calc(var(--sidebar-tab-padding) * 1.5 - var(--sidebar-inner-padding));
    }

    #cobalt-logo img {
        width: 60px;
        height: auto;
        filter: drop-shadow(0 0 8px rgba(34, 211, 238, 0.4));
        pointer-events: none;
    }

    @media screen and (max-width: 535px) {
        #cobalt-logo {
            display: none;
        }
    }
</style>
