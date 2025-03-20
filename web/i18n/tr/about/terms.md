<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

bu şartlar, yalnızca cobalt'ın resmî uygulamasını kullandığınız zaman
geçerlidir. aksi takdirde, kesin bilgi için site yetkilisi ile iletişime
geçmeniz gerekebilir.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

saving functionality simplifies downloading content from the internet and takes
zero liability for what the saved content is used for. processing servers work
like advanced proxies and don't ever write any content to disk. everything is
handled in RAM and permanently purged once the tunnel is done. we have no
downloading logs and can't identify anyone.

[you can read more about how tunnels work in our privacy
policy.](/about/privacy)
</section>

<section id="responsibility">
<SectionHeading
    title={$t("about.heading.responsibility")}
    sectionId="responsibility"
/>

you (end user) are responsible for what you do with our tools, how you use and
distribute resulting content. please be mindful when using content of others and
always credit original creators. make sure you don't violate any terms or
licenses.

when used in educational purposes, always cite sources and credit original
creators.

fair use and credits benefit everyone.
</section>

<section id="abuse">
<SectionHeading
    title={$t("about.heading.abuse")}
    sectionId="abuse"
/>

we have no way of detecting abusive behavior automatically because cobalt is
100% anonymous. however, you can report such activities to us via email and
we'll do our best to comply manually: abuse[at]imput.net

**this email is not intended for user support, you will not get a response if
your concern is not related to abuse.**

if you're experiencing issues, contact us via any preferred method on [the
support page](/about/community).
</section>
