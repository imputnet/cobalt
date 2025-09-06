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

tú (el usuario final) eres responsable de lo que hagas con nuestras
herramientas, el cómo usas y distribuyes el contenido resultante. por favor sé
considerado al usar contenido de otros y siempre acredita a los creadores
originales. asegúrate de no violar ningún término o licencia.

cuando sea utilizado con fines educativos, cita siempre las fuentes y da
créditos a los creadores originales.

el uso justo y dar crédito a sus creadores beneficia a todos.
</section>

<section id="abuse">
<SectionHeading
    title={$t("about.heading.abuse")}
    sectionId="abuse"
/>

we have no way of detecting abusive behavior automatically because cobalt is
fully anonymous. however, you can report such activities to us via email and
we'll do our best to comply manually: abuse[at]imput.net

**este correo electrónico no es destinado para el soporte al usuario, no
obtendrás una respuesta si tu asunto no esta relacionado con abuso**

if you're experiencing issues, you can reach out for support via any preferred
method on [the community page](/about/community).
</section>
