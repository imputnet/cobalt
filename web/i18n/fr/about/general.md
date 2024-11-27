<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { partners, contacts, docs } from "$lib/env";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="summary">
<SectionHeading
    title={$t("about.heading.summary")}
    sectionId="summary"
/>

cobalt vous permet de sauvegarder tout ce que vous aimez sur vos sites web
préférés : vidéo, audio, photos ou gifs. collez simplement le lien et vous êtes
prêt à démarrer !

pas de publicités, de traqueurs, d'accès payant ou autres absurdités. juste une
application web pratique qui fonctionne partout et quand vous en avez besoin.
</section>

<section id="motivation">
<SectionHeading
    title={$t("about.heading.motivation")}
    sectionId="motivation"
/>

cobalt a été créé pour le bien public, pour protéger les gens des publicités et
des logiciels malveillants diffusés par ses alternatives. nous pensons que le
meilleur logiciel est sûr, ouvert et accessible.

il est possible de maintenir les instances principales en activité grâce à notre
partenaire d'infrastructure de longue date,
[royalehosting.net]({partners.royalehosting}) !
</section>

<section id="privacy">
<SectionHeading
    title={$t("about.heading.privacy")}
    sectionId="privacy"
/>

toutes les requêtes vers le backend sont anonymes et toutes les informations sur
les tunnels sont chiffrés. nous avons une politique stricte de zéro journal et
ne traquons *rien* sur les individus.

lorsqu'une demande nécessite un traitement supplémentaire, cobalt traite les
fichiers à la volée. cela se fait en tunnelisant les parties traitées
directement vers le client, sans jamais rien enregistrer sur le disque. par
exemple, cette méthode est utilisée lorsque le service source fournit des canaux
vidéo et audio sous forme de fichiers séparés.

de plus, vous pouvez [activer le tunneling forcé](/settings/privacy#tunnel) pour
protéger votre vie privée. lorsqu'il est activé, cobalt tunnellisera tous les
fichiers téléchargés. personne ne saura d'où vous téléchargez quelque chose,
même votre fournisseur de réseau. tout ce qu'ils verront, c'est que vous
utilisez une instance cobalt.
</section>

<section id="community">
<SectionHeading
    title={$t("about.heading.community")}
    sectionId="community"
/>

cobalt est utilisé par d'innombrables artistes, éducateurs et créateurs de
contenu pour faire ce qu'ils aiment. nous sommes toujours en contact avec notre
communauté et travaillons ensemble pour créer encore plus d'outils utiles pour
eux. n'hésitez pas à [rejoindre la conversation](/about/community) !

nous croyons que l'avenir de l'internet est ouvert, c'est pourquoi cobalt est
[source first](https://sourcefirst.com/) et [facilement
auto-hébergeable]({docs.instanceHosting}).

si votre ami en héberge un, demandez-lui simplement un domaine et [ajoutez-le
dans les paramètres de l'instance](/settings/instances#community).

vous pouvez consulter le code source et contribuer [sur
github]({contacts.github}) à tout moment. nous accueillons toutes les
contributions et suggestions !
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

les nouvelles fonctionnalités, telles que [le remuxing](/remux), fonctionnent
sur votre appareil. le traitement sur l'appareil est efficace et n'envoie jamais
rien sur internet. il est parfaitement aligné avec notre objectif futur de
déplacer autant de traitement que possible vers le client.
</section>
