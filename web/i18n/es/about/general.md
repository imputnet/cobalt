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

cobalt te ayuda a guardar cualquier cosa de tus sitios web favoritos: vídeos,
audio, fotos o gifs. ¡sólo pega el enlace y listo!

no hay anuncios, rastreadores, funciones de pago, ni cualquier otra tontería. es
tan solo una conveniente aplicación web que funciona en cualquier parte, cuando
sea que la necesites.
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

cobalt es usado por incontables artistas, educadores, y creadores de contenido
para hacer lo que aman. siempre estamos en contacto con nuestra comunidad y
trabajamos juntos para hacer de cobalt incluso mas útil. ¡siéntete libre de
[unirte a la conversación](/about/community)!

creemos que el futuro del internet es abierto, razón por la cual cobalt es
[source first](https://sourcefirst.com/) y [fácil de
autoalojar]({docs.instanceHosting}).

si un amigo aloja una instancia de procesamiento, solo pídeles un dominio y
[añádelo en tu configuración de instancias](/settings/instances#community).

puedes mirar el código fuente y contribuir [en github]({contacts.github}) en
cualquier momento. ¡aceptamos todo tipo de contribuciones y sugerencias!
</section>
