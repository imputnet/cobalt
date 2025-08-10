<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

these terms are applicable only when using the official cobalt instance. in
other cases, you may need to contact the instance hoster for accurate info.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

saving functionality simplifies downloading content from the internet and we
take zero liability for what the saved content is used for.

processing servers operate like advanced proxies and don't ever write any
requested content to disk. everything is handled in RAM and permanently purged
once the tunnel is completed. we have no downloading logs and cannot identify
anyone.

you can learn more about how tunnels work in [privacy policy](/about/privacy).
</section>

<section id="responsibility">
<SectionHeading
    title={$t("about.heading.responsibility")}
    sectionId="responsibility"
/>

vous (l'utilisateur final) êtes responsable de ce que vous faites avec nos
outils, de la manière dont vous utilisez et distribuez le contenu résultant.
veuillez être attentif lorsque vous utilisez le contenu des autres et créditez
toujours les créateurs originaux. assurez-vous de ne pas violer les termes ou
les licences.

lorsqu'il est utilisé à des fins éducatives, citez toujours les sources et
créditez les créateurs originaux.

l'utilisation équitable et les crédits profitent à tout le monde.
</section>

<section id="abuse">
<SectionHeading
    title={$t("about.heading.abuse")}
    sectionId="abuse"
/>

we have no way of detecting abusive behavior automatically because cobalt is
fully anonymous. however, you can report such activities to us via email and
we'll do our best to comply manually: abuse[at]imput.net

**cet addresse n'est pas utilisable pour recevoir de l'aide technique, vous ne
recevrez donc pas de réponse si votre requête n'est pas liée a un cas d'abus.**

if you're experiencing issues, you can reach out for support via any preferred
method on [the community page](/about/community).
</section>
