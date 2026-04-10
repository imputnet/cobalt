<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

these terms are applicable only when using an unmodified ferrum instance.
in other cases, you may need to contact the instance hoster for accurate info.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

saving functionality simplifies downloading content from the internet
and we take zero liability for what the saved content is used for.

processing servers operate like advanced proxies and don't ever write any requested content to disk.
everything is handled in RAM and permanently purged once the tunnel is completed.
we have no downloading logs and cannot identify anyone.

you can learn more about how tunnels work in [privacy policy](/about/privacy).
</section>

<section id="responsibility">
<SectionHeading
    title={$t("about.heading.responsibility")}
    sectionId="responsibility"
/>

you (end user) are responsible for what you do with our tools, how you use and distribute resulting content.
please be mindful when using content of others and always credit original creators.
make sure you don't violate any terms or licenses.

when used in educational purposes, always cite sources and credit original creators.

fair use and credits benefit everyone.
</section>
