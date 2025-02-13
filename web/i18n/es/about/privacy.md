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

la política de privacidad de cobalt es simple: no recopilamos ni guardamos nada
sobre ti. lo que sea que hagas es asunto tuyo, no nuestro ni de nadie más.

estos términos solamente aplican cuando usas la instancia oficial de cobalt. en
otros casos, tendrás que contactarte con el dueño de esa instancia para más
información.
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

las herramientas que utilizan el procesamiento en el dispositivo funcionan sin
conexión, de forma local y nunca envían datos a ninguna parte. se marcan
explícitamente como tal siempre que sea aplicable.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

al utilizar la función de guardado, en algunos casos cobalt cifrará y almacenará
temporalmente la información necesaria para el tunelado. se almacena en la
memoria RAM del servidor de procesamiento durante 90 segundos y después se purga
irreversiblemente. nadie tiene acceso a ella, ni siquiera los propietarios de
las instancias, siempre que no modifiquen la imagen oficial de cobalt.

los archivos procesados/tunelados nunca se almacenan en caché en ningún sitio.
todo se tuneliza en directo. la funcionalidad de guardado de cobalt es
esencialmente un servicio de proxy elegante.
</section>

<section id="encryption">
<SectionHeading
    title={$t("about.heading.encryption")}
    sectionId="encryption"
/>

los datos del túnel almacenados temporalmente se cifran usando el estándar
AES-256. las claves de descifrado sólo se incluyen en el enlace de acceso y
nunca se registran o almacenan en caché en ningún lugar. solamente el usuario
final tiene acceso al enlace y a las claves de cifrado. las claves se generan de
forma exclusiva para cada túnel solicitado.
</section>

{#if env.PLAUSIBLE_ENABLED}
<section id="plausible">
<SectionHeading
    title={$t("about.heading.plausible")}
    sectionId="plausible"
/>

en aras de la privacidad, utilizamos [análisis de tráfico anónimo de
plausible](https://plausible.io/) para obtener un número aproximado de usuarios
activos de cobalt. nunca se almacena información identificable sobre ti o tus
solicitudes. todos los datos son anónimos y agregados. la instancia de plausible
que utilizamos está alojada y gestionada por nosotros.

plausible no utiliza cookies y cumple plenamente con GDPR, CCPA y PECR.

[más información sobre el compromiso de plausible con la
privacidad.](https://plausible.io/privacy-focused-web-analytics)

si desea optar por no participar en los análisis anónimos, puede hacerlo en
[configuración de privacidad](/settings/privacy#analytics).
</section>
{/if}

<section id="cloudflare">
<SectionHeading
    title={$t("about.heading.cloudflare")}
    sectionId="cloudflare"
/>

utilizamos los servicios de cloudflare para la protección contra ddos y bots.
también utilizamos cloudflare pages para desplegar y alojar la aplicación web
estática. todo esto es necesario para ofrecer la mejor experiencia a todo el
mundo. es el proveedor más privado y fiable que conocemos.

cloudflare cumple plenamente con GDPR e HIPAA.

[más información sobre el compromiso de cloudflare con la
privacidad.](https://www.cloudflare.com/trust-hub/privacy-and-data-protection/)
</section>
