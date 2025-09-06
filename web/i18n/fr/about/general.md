<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { contacts, docs } from "$lib/env";

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

cobalt was created for public benefit, to protect people from ads and malware
pushed by alternative downloaders. we believe that the best software is safe,
open, and accessible. all imput project follow these basic principles.
</section>

<section id="privacy-efficiency">
<SectionHeading
    title={$t("about.heading.privacy_efficiency")}
    sectionId="privacy-efficiency"
/>

all requests to the backend are anonymous and all information about potential
file tunnels is encrypted. we have a strict zero log policy and don't store or
track *anything* about individual people.

if a request requires additional processing, such as remuxing or transcoding,
cobalt processes media directly on your device. this ensures best efficiency and
privacy.

if your device doesn't support local processing, then server-based live
processing is used instead. in this scenario, processed media is streamed
directly to client, without ever being stored on server's disk.

you can [enable forced tunneling](/settings/privacy#tunnel) to boost privacy
even further. when enabled, cobalt will tunnel all downloaded files, not just
those that require it. no one will know where you download something from, even
your network provider. all they'll see is that you're using a cobalt instance.
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
