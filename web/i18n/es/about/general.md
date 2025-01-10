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

cobalt fue creado para beneficio público, para proteger a la gente de los
anuncios y malware impulsados por sus alternativas. creemos que el mejor
software es seguro, abierto y accesible.

nos es posible mantener las instancias principales abiertas gracias a nuestro
duradero partner de infraestructura,
[royalehosting.net]({partners.royalehosting})!
</section>

<section id="privacy">
<SectionHeading
    title={$t("about.heading.privacy")}
    sectionId="privacy"
/>

todas las peticiones hacia el backend son anónimas y toda la información sobre
túneles está encriptada. tenemos una política estricta de cero registros y no
rastreamos *nada* sobre ningún individual.

cuando una petición necesita procesamiento adicional, cobalt procesa archivos en
el acto. esto se hace transfiriendo partes procesadas directamente al cliente,
sin guardar nada al disco. por ejemplo, este método se usa cuando el servicio
fuente provee audio y vídeo como archivos separados.

adicionalmente, puedes [activar la tunelización
forzada](/settings/privacy#tunnel) para proteger tu privacidad. al activarla,
cobalt tunelizará todos los archivos descargados. nadie sabrá de donde
descargaste algo, ni siquiera tu proveedor de red. todo lo que verán será que
estás usando una instancia de cobalt.
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

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

nuevas características, como el [remezclado](/remux), funcionan localmente en tu
dispositivo. procesar en el dispositivo es eficiente y nunca envía nada por el
internet. se alinea perfectamente con nuestro futuro objetivo de mover el
procesamiento hacia el cliente lo máximo posible.
</section>
