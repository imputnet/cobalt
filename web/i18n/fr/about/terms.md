<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

ces termes s'appliquent uniquement lors de l'utilisation de l'instance
officielle de cobalt. dans d'autres cas, vous devrez peut-être contacter
l'hébergeur pour obtenir des informations précises.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

la fonctionnalité de sauvegarde simplifie le téléchargement de contenu depuis
internet et n'assume aucune responsabilité pour l'utilisation du contenu
sauvegardé. les serveurs de traitement fonctionnent comme des proxys avancés et
n'écrivent jamais de contenu sur le disque. tout est géré en RAM et purgé de
manière permanente une fois le tunnel terminé. nous n'avons pas de journaux de
téléchargement et ne pouvons identifier personne.

[vous pouvez en savoir plus sur le fonctionnement des tunnels dans notre
politique de confidentialité.](/about/privacy)
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
100% anonymous. however, you can report such activities to us via email and
we'll do our best to comply manually: abuse[at]imput.net

**cet addresse n'est pas utilisable pour recevoir de l'aide technique, vous ne
recevrez donc pas de réponse si votre requête n'est pas liée a un cas d'abus.**

si vous rencontrez des problèmes, contactez-nous via la méthode de votre choix
sur [la page d'assistance](/about/community).
</section>
