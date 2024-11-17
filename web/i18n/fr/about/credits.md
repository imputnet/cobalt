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

cobalt est fait par amour et attention par la team de recherche et de développement [imput](https://imput.net/).

vous pouvez nous supporter sur la [page de donation](/donate) !
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

un grand merci à nos "thing breakers" pour tester les futurs mises à jours et s'assurent qu'ils sont stables.
ils nous ont aussi aidés à mettre en avant cobalt 10 !
<BetaTesters />

tout les liens sont externe et amènent vers leurs site personnels ou à leurs réseaux sociaux.
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

meowbalt est la mascotte rapide de cobalt. il est un chat extrênement expressif qui aime la rapidité d'internet.

tout les dessins étonnant de meowbalt que tu vois dans cobalt sont fait par [GlitchyPSI](https://glitchypsi.xyz/).
il est aussi le dessinateur original du personnage.

tu ne peux pas utiliser ou modifier les artworks de GlitchyPSI de meowbalt sans sa permission explicite.

tu ne peux pas utiliser ou modifier le design du personnage meowbalt à des fins commercial ou dans aucunes formes qui ne soit pas celle d'un fan art.
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

cobalt processing server is open source and licensed under [AGPL-3.0]({docs.apiLicense}).

cobalt frontend is [source first](https://sourcefirst.com/) and licensed under [CC-BY-NC-SA 4.0]({docs.webLicense}).
we decided to use this license to stop grifters from profiting off our work
& from creating malicious clones that deceive people and hurt our public identity.

we rely on many open source libraries, create & distribute our own.
you can see the full list of dependencies on [github]({contacts.github}).
</section>
