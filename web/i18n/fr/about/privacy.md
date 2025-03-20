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

la politique de confidentialité de cobalt est simple : nous ne collectons ni ne
stockons rien à votre sujet. ce que vous faites est uniquement votre affaire,
pas la nôtre ni celle de quelqu'un d'autre.

ces termes s'appliquent uniquement lors de l'utilisation de l'instance
officielle de cobalt. dans d'autres cas, vous devrez peut-être contacter
l'hébergeur pour obtenir des informations précises.
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

les outils qui utilisent un traitement sur l'appareil fonctionnent hors ligne,
localement, et n'envoient jamais de données nulle part. ils sont explicitement
marqués comme tels lorsque cela est applicable.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

lors de l'utilisation de la fonctionnalité de sauvegarde, dans certains cas,
cobalt cryptera et stockera temporairement les informations nécessaires au
tunnel. elles sont stockées dans la RAM du serveur de traitement pendant 90
secondes et purgées de manière irréversible par la suite. personne n'y a accès,
même les propriétaires d'instances, tant qu'ils ne modifient pas l'image
officielle de cobalt.

les fichiers traités/tunnelisés ne sont jamais mis en cache nulle part. tout est
tunnelisé en direct. la fonctionnalité de sauvegarde de cobalt est
essentiellement un service proxy sophistiqué.
</section>

<section id="encryption">
<SectionHeading
    title={$t("about.heading.encryption")}
    sectionId="encryption"
/>

les données de tunnel stockées temporairement sont cryptées en utilisant la
norme AES-256. les clés de déchiffrement ne sont incluses que dans le lien
d'accès et ne sont jamais enregistrées/mises en cache/stockées nulle part. seul
l'utilisateur final a accès au lien et aux clés de chiffrement. les clés sont
générées de manière unique pour chaque tunnel demandé.
</section>

{#if env.PLAUSIBLE_ENABLED}
<section id="plausible">
<SectionHeading
    title={$t("about.heading.plausible")}
    sectionId="plausible"
/>

pour des raisons de confidentialité, nous utilisons [l'analyse du trafic anonyme
de plausible](https://plausible.io/) pour obtenir un nombre approximatif
d'utilisateurs actifs de cobalt. aucune information identifiable vous concernant
ou concernant vos demandes n'est jamais stockée. toutes les données sont
anonymisées et agrégées. l'instance plausible que nous utilisons est hébergée et
gérée par nous.

plausible n'utilise pas de cookies et est entièrement conforme au RGPD, au CCPA
et au PECR.

[en savoir plus sur l'engagement de plausible en matière de
confidentialité.](https://plausible.io/privacy-focused-web-analytics)

si vous souhaitez désactiver les analyses anonymes, vous pouvez le faire dans
[paramètres de confidentialité](/settings/privacy#analytics).
</section>
{/if}

<section id="cloudflare">
<SectionHeading
    title={$t("about.heading.cloudflare")}
    sectionId="cloudflare"
/>

nous utilisons les services de cloudflare pour la protection contre le ddos et
les bots. nous utilisons également les pages de cloudflare pour déployer et
héberger l'application web statique. tout cela est nécessaire pour offrir la
meilleure expérience à tout le monde. c'est le fournisseur le plus privé et le
plus fiable que nous connaissions.

cloudflare est entièrement conforme au RGPD et à la HIPAA.

[en savoir plus sur l'engagement de cloudflare en matière de
confidentialité.](https://www.cloudflare.com/trust-hub/privacy-and-data-protection/)
</section>
