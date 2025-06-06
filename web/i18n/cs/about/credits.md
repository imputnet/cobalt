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

cobalt je vyroben s láskou a péčí výzkumného a vývojového týmu
[imput](https://imput.net/).

můžete nás podpořit na [darovací stránce](/donate)!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

obrovské poděkování našim rozbíječům věcí za včasné testování aktualizací a
ověřování, že jsou stabilní. také nám pomohli vydat cobalt 10! <BetaTesters />

všechny odkazy jsou externí a vedou na jejich osobní webové stránky nebo
sociální média.
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

mňaubalt je rychlý maskot cobaltu. je to extrémně expresivní kocour, který
miluje rychlý internet.

všechny úžasné kresby mňaubalta, které vidíte v cobaltu, vytvořil
[GlitchyPSI](https://glitchypsi.xyz/). je také původním designérem této postavy.

nesmíš používat ani upravovat kresby mňaubalta od GlitchyPSI-ho bez jeho
výslovného souhlasu.

nemůžeš používat nebo upravovat design mňaubalta komerčně nebo v jakékoli formě,
která není fanart.
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

zpracovávací server cobaltu je open source a je licencován pod
[AGPL-3.0]({docs.apiLicense}).

cobalt frontend je [source first](https://sourcefirst.com/) a je licencován pod
[CC-BY-NC-SA 4.0]({docs.webLicense}). rozhodli jsme se použít tuto licenci,
abychom zabránili podvodníkům vydělávat na naší práci a vytvářet škodlivé klony,
které klamou lidi a poškozují naši veřejnou identitu.

spoléháme na mnoho open source knihoven, vytváříme a distribuujeme vlastní.
úplný seznam závislostí najdete na [githubu]({contacts.github}).
</section>
