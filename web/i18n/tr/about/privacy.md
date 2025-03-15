<script lang="ts">
    import env from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

cobalt's privacy policy is simple: we don't collect or store anything about you.
what you do is solely your business, not ours or anyone else's.

bu şartlar, yalnızca cobalt'ın resmî uygulamasını kullandığınız zaman
geçerlidir. aksi takdirde, kesin bilgi için site yetkilisi ile iletişime
geçmeniz gerekebilir.
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

tools that use on-device processing work offline, locally, and never send any
data anywhere. they are explicitly marked as such whenever applicable.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

when using saving functionality, in some cases cobalt will encrypt & temporarily
store information needed for tunneling. it's stored in processing server's RAM
for 90 seconds and irreversibly purged afterwards. no one has access to it, even
instance owners, as long as they don't modify the official cobalt image.

processed/tunneled files are never cached anywhere. everything is tunneled live.
cobalt's saving functionality is essentially a fancy proxy service.
</section>

<section id="encryption">
<SectionHeading
    title={$t("about.heading.encryption")}
    sectionId="encryption"
/>

temporarily stored tunnel data is encrypted using the AES-256 standard.
decryption keys are only included in the access link and never
logged/cached/stored anywhere. only the end user has access to the link &
encryption keys. keys are generated uniquely for each requested tunnel.
</section>

{#if env.PLAUSIBLE_ENABLED}
<section id="plausible">
<SectionHeading
    title={$t("about.heading.plausible")}
    sectionId="plausible"
/>

for sake of privacy, we use [plausible's anonymous traffic
analytics](https://plausible.io/) to get an approximate number of active cobalt
users. no identifiable information about you or your requests is ever stored.
all data is anonymized and aggregated. the plausible instance we use is hosted &
managed by us.

plausible doesn't use cookies and is fully compliant with GDPR, CCPA, and PECR.

[learn more about plausible's dedication to
privacy.](https://plausible.io/privacy-focused-web-analytics)

if you wish to opt out of anonymous analytics, you can do it in [privacy
settings](/settings/privacy#analytics).
</section>
{/if}

<section id="cloudflare">
<SectionHeading
    title={$t("about.heading.cloudflare")}
    sectionId="cloudflare"
/>

we use cloudflare services for ddos & bot protection. we also use cloudflare
pages for deploying & hosting the static web app. all of these are required to
provide the best experience for everyone. it's the most private & reliable
provider that we know of.

cloudflare is fully compliant with GDPR and HIPAA.

[learn more about cloudflare's dedication to
privacy.](https://www.cloudflare.com/trust-hub/privacy-and-data-protection/)
</section>
