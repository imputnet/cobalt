<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { partners, contacts, docs } from "$lib/env";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="saving">
<SectionHeading
    title={$t("about.heading.summary")}
    sectionId="saving"
/>

cobalt vous permet de sauvegarder tout ce que vous aimez sur vos sites web préférés : vidéo, audio, photos ou gifs — cobalt peut tout faire !

pas de publicités, de traqueurs ou de paiements, pas d'absurdités. juste une application web pratique qui fonctionne partout.
</section>

<section id="privacy">
<SectionHeading
    title={$t("about.heading.privacy")}
    sectionId="privacy"
/>

toutes les requêtes vers le backend sont anonymes et tous les tunnels sont chiffrés.
nous avons une politique de journalisation stricte et ne traquons *rien* sur les individus.

pour éviter la mise en cache ou le stockage des fichiers téléchargés, cobalt les traite à la volée, envoyant les morceaux traités directement au client.
cette technologie est utilisée lorsque votre demande nécessite un traitement supplémentaire, par exemple lorsque le service source stocke la vidéo et l'audio dans des fichiers séparés.

pour un niveau de protection encore plus élevé, vous pouvez [demander à cobalt de toujours tout tunneliser](/settings/privacy#tunnel).
lorsqu'il est activé, cobalt fera tout passer par lui-même. personne ne saura ce que vous téléchargez, même votre fournisseur/réseau administratif.
tout ce qu'ils verront, c'est que vous utilisez cobalt.
</section>

<section id="speed">
<SectionHeading
    title={$t("about.heading.speed")}
    sectionId="speed"
/>

comme nous ne nous appuyons sur aucun téléchargeur existant et que nous développons le nôtre à partir de zéro,
cobalt est extrêmement efficace et un serveur de traitement peut fonctionner sur pratiquement n'importe quel matériel.

les principales instances de traitement sont hébergées sur plusieurs serveurs dédiés dans plusieurs pays,
pour réduire la latence et distribuer le trafic.

nous améliorons constamment notre infrastructure avec notre partenaire de longue date, [royalehosting.net]({partners.royalehosting}) !
vous êtes entre de bonnes mains, et vous obtiendrez ce dont vous avez besoin en quelques secondes.
</section>

<section id="community">
<SectionHeading
    title={$t("about.heading.community")}
    sectionId="community"
/>

cobalt est utilisé par d'innombrables artistes, éducateurs et créateurs de contenu pour faire ce qu'ils aiment.
nous sommes toujours en contact avec notre communauté et travaillons ensemble pour créer encore plus d'outils utiles pour eux.
n'hésitez pas à [rejoindre la conversation](/about/community) !

nous croyons que l'avenir de l'internet est ouvert, c'est pourquoi cobalt est [source first](https://sourcefirst.com/) et [facilement auto-hébergeable]({docs.instanceHosting}). vous pouvez [vérifier le code source & contribuer à cobalt]({contacts.github})
à tout moment, nous accueillons toutes les contributions et suggestions.

vous pouvez utiliser n'importe quelle instance de traitement hébergée par la communauté, y compris la vôtre.
si votre ami en héberge un, demandez-lui simplement un domaine et [ajoutez-le dans les paramètres de l'instance](/settings/instances#community).
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

les nouvelles fonctionnalités, telles que [le remuxing](/remux), fonctionnent sur l'appareil.
le traitement sur l'appareil est efficace et n'envoie jamais rien sur internet.
il est parfaitement aligné avec notre objectif futur de déplacer autant de traitement que possible vers le client.

</section>
