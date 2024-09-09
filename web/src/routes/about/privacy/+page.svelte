<script lang="ts">
    import env from "$lib/env";
    import { t } from "$lib/i18n/translations";
    import OuterLink from "$components/misc/OuterLink.svelte";
</script>

<div id="privacy-body" class="long-text-noto about">
    <section id="general">
        <h3>general terms</h3>
        <p>
            cobalt's privacy policy is simple: we don't collect or store anything about you. what you do is solely your business, not ours or anyone else's.
        </p>
        <p>
            these terms are applicable only when using the official cobalt instance. in other cases, you may need to contact the hoster for accurate info.
        </p>
    </section>

    <section id="local">
        <h3>on-device processing</h3>
        <p>
            tools that use on-device processing work offline, locally, and never send any data anywhere. they are explicitly marked as such whenever applicable.
        </p>
    </section>

    <section id="saving">
        <h3>saving</h3>
        <p>
            when using saving functionality, in some cases cobalt will encrypt & temporarily store information needed for tunnelling. it's stored in processing server's RAM for 90 seconds and irreversibly purged afterwards. no one has access to it, even instance owners, as long as they don't modify the official cobalt image.
        </p>
        <p>
            processed/tunnelled files are never cached anywhere. everything is tunnelled live. cobalt's saving functionality is essentially a fancy proxy service.
        </p>
    </section>

    <section id="encryption">
        <h3>encryption</h3>
        <p>
            temporarily stored tunnel data is encrypted using the AES-256 standard. decryption keys are only included in the access link and never logged/cached/stored anywhere. only the end user has access to the link & encryption keys. keys are generated uniquely for each requested tunnel.
        </p>
    </section>

    {#if env.PLAUSIBLE_ENABLED}
        <section id="plausible">
            <h3>anonymous traffic analytics</h3>
            <p>
                for sake of privacy, we use
                <OuterLink href="https://plausible.io/"> plausible's anonymous traffic analytics</OuterLink>
                to get an approximate number of active cobalt users. no identifiable information about you or your requests is ever stored. all data is anonymized and aggregated. the plausible instance we use is hosted & managed by us.
            </p>

            <p>
            plausible doesn't use cookies and is fully compliant with GDPR, CCPA, and PECR.
            </p>

            <p>
                <OuterLink href="https://plausible.io/privacy-focused-web-analytics">
                    {$t("settings.privacy.analytics.learnmore")}
                </OuterLink>
            </p>

            <p>
                if you wish to opt out of anonymous analytics, you can do it in <a href="/settings/privacy#analytics">privacy settings</a>.
            </p>
        </section>
    {/if}

    <section id="cloudflare">
        <h3>web privacy & security</h3>
        <p>
            we use cloudflare services for ddos & bot protection. we also use cloudflare pages for deploying & hosting the static web app. all of these are required to provide the best experience for everyone. it's the most private & reliable provider that we know of.
        </p>
        <p>
            cloudflare is fully compliant with GDPR and HIPAA.
         </p>
        <p>
            <OuterLink href="https://www.cloudflare.com/trust-hub/privacy-and-data-protection/">
                learn more about cloudflare's dedication to privacy.
            </OuterLink>
        </p>
    </section>
</div>
