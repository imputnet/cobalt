<script lang="ts">
    import { contacts, docs } from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
    import BetaTesters from "$components/misc/BetaTesters.svelte";
</script>

<section id="imput">
<SectionHeading
    title="imput"
    sectionId="imput"
/>

cobalt fue hecho con amor y dedicación por el equipo de desarrollo e
investigación de [imput](https://imput.net/).

¡puedes apoyarnos en la [página de donación](/donate)!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

un gran agradecimiento a nuestros "rompedores" por probar las actualizaciones
antes de tiempo y asegurarse de que son estables. también nos han ayudado a
distribuir cobalt 10! <BetaTesters />

todos los enlaces son externos y conducen a sus sitios web personales o redes
sociales.
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

miaubalt es la mascota veloz de cobalt. es un gato extremadamente expresivo que
adora el internet rápido.

todos los increíbles dibujos de meowbalt que puedes ver en cobalt fueron hechos
por [GlitchyPSI](https://glitchypsi.xyz/). él es también el diseñador original
del personaje.

no puedes usar o modificar las obras de meowbalt de GlitchyPSI sin su explícito
permiso previo.

no puedes utilizar o modificar el diseño del personaje meowbalt comercialmente o
de ninguna forma que no sea fan art.
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

el servidor de procesamiento de cobalt es de código abierto y está licenciado
bajo [AGPL-3.0]({docs.apiLicense}).

el frontend de cobalt es [source first](https://sourcefirst.com/) y licenciado
bajo [CC-BY-NC-SA 4.0]({docs.webLicense}). decidimos usar esta licencia para
evitar que los estafadores se aprovechen de nuestro trabajo y creen clones
maliciosos que engañen a la gente y dañen nuestra identidad pública.

dependemos de muchas bibliotecas de código abierto, creamos y distribuimos las
nuestras. puedes ver la lista completa de dependencias en
[github]({contacts.github}).
</section>
