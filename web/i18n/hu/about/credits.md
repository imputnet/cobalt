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

cobalt szeretettel és figyelemmel készül az [imput](https://imput.net/) kutatási
és fejlesztői csapat által.

támogathatsz minket a [támogatási oldalunkon](/donate)!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

hatalmas nagy shoutout azoknak akik mindig megtalálták a hibákat, hogy
tesztelték a frissítéseket kiadás előtt és hogy biztosra mentek azzal, hogy
stabilak. ők segítettek a cobalt 10 megjelenésében is! <BetaTesters />

minden link külső és az emberek személyes weboldalára vezet, vagy a social
mediájára.
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

meowbalt a cobaltnak sebes kabalája. egy túlságosan is lenyűgöző és kifejező
cica, aki szereti a gyors internetet.

az összes elképesztő rajz meowbaltról amit látsz a cobalt oldalán
[GlitchyPSI](https://glitchypsi.xyz/) által lettek készítve. amúgy ő az eredeti
elkészítője a karakternek.

nem használhatod fel vagy módosíthatod GlitchyPSI-nak az alkotásait meowbaltról
az ő engedélye nélkül.

nem használhatod vagy módosíthatod a meowbalt eredeti karakter dizájnját üzleti
szempontból, vagy bármilyen másik formában ami nem egy rajongói alkotás.
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

a cobalt feldolgozó szervere nyílt forráskódú és a [AGPL-3.0]({docs.apiLicense})
licenc alatt van.

a cobalt frontendje [source first](https://sourcefirst.com/) és [CC-BY-NC-SA
4.0]({docs.webLicense}) alatt licencelt. azért jutottunk erre a licencre, hogy
megállítsuk a csalókat a mi munkánkról való profitálástól, és hogy ne tudjanak
rosszindulatú klónokat gyártani amivel megtévesztenek embereket és megbántják a
nyilvános identitásunkat.

nagyon sok nyílt forrású modulon alapszunk, csináld meg és oszd meg a sajátod. a
teljes dependencia listát láthatod [githubon]({contacts.github}).
</section>
