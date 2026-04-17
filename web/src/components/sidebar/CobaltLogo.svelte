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
        filter: drop-shadow(0 0 12px rgba(249, 115, 22, 0.5));
        pointer-events: none;
        transition: filter 0.3s ease, transform 0.3s ease;
    }

    #cobalt-logo:hover img {
        filter: drop-shadow(0 0 20px rgba(249, 115, 22, 0.7));
        transform: scale(1.05);
    }

    @media screen and (max-width: 535px) {
        #cobalt-logo {
            display: none;
        }
    }
</style>
