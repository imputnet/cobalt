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

cobalt jest stworzony z miłością i troską prze zespół badawczo-rozwojowy
[imput](https://imput.net/).

możesz nas wesprzeć na [stronie darowizn](/donate)!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

ogromne podziękowania dla naszych psujów rzeczy za wczesne testowanie
aktualizacji i upewnianie się, że są stabilne. pomogli nam również wydać cobalt
10! <BetaTesters />

wszystkie linki są zewnętrzne i prowadzą do ich osobistych stron lub mediów
społecznościowych.
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

miaubalt jest szybką maskotką cobalta. on jest niezwykle ekspresyjnym kotem,
który uwielbia szybki internet.

wszystkie niesamowite rysunki miaubalta, które widzisz w cobalcie, zostały
stworzone przez [GlitchyPSI](https://glitchypsi.xyz/). on jest również
oryginalnym projektantem postaci.

nie możesz używać ani modyfikować dzieł sztuki GlitchyPSI z miaubaltem bez jego
wyraźnej zgody.

nie możesz używać ani modyfikować miaubalta w celach komercyjnych lub w
jakiejkolwiek formie, która nie jest fan artem.
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

serwer procesyjny cobalta jest open source na licencji
[AGPL-3.0]({docs.apiLicense}).

interfejs (front-end) cobalta jest [source first](https://sourcefirst.com/) i na
licencji [CC-BY-NC-SA 4.0]({docs.webLicense}). zdecydowaliśmy się użyć tej
licencji, aby powstrzymać oszustów przed czerpaniem zysków z naszej pracy i
przed tworzeniem złośliwych klonów, które oszukują ludzi i szkodzą naszej
publicznej tożsamości.

korzystamy z wielu bibliotek open source, a także tworzymy i dystrybuujemy
własne. pełną listę zależności możesz zobaczyć na [githubie]({contacts.github}).
</section>
