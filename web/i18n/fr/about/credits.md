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

cobalt est fait avec amour et soin par l'équipe de recherche et développement
d'[imput](https://imput.net/).

vous pouvez nous soutenir sur la [page de don](/donate) !
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

un grand merci à nos casseurs de trucs de tester rapidement les mises à jour et
de s'assurer qu'elles sont stables. ils nous ont également aidés à sortir cobalt
10 ! <BetaTesters />

tous les liens sont externes et mènent à leurs sites web personnels ou à leurs
réseaux sociaux.
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

miaoubalt est la mascotte rapide de cobalt. c'est un chat extrêmement expressif
qui adore l'internet rapide.

tous les dessins incroyables de miaoubalt que vous voyez dans cobalt ont été
réalisés par [GlitchyPSI](https://glitchypsi.xyz/). il est également le
concepteur original du personnage.

vous ne pouvez pas utiliser ou modifier les œuvres de GlitchyPSI de miaoubalt
sans sa permission explicite.

vous ne pouvez pas utiliser ou modifier le design du personnage miaoubalt
commercialement ou sous une forme qui n'est pas du fan art.
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

le serveur de traitement cobalt est open source et sous licence
[AGPL-3.0]({docs.apiLicense}).

le frontend de cobalt est [source first](https://sourcefirst.com/) et sous
licence [CC-BY-NC-SA 4.0](https://sourcefirst.com/). nous avons décidé
d'utiliser cette licence pour empêcher les escrocs de profiter de notre travail
et de créer des clones malveillants qui trompent les gens et nuisent à notre
identité publique.

nous nous appuyons sur de nombreuses bibliothèques open source, créons et
distribuons les nôtres. vous pouvez voir la liste complète des dépendances sur
[github]({contacts.github}).
</section>
