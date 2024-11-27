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

cobalt pomaga tobie zapisać wszystko z twoich ulubionych stron: filmy, audio,
zdjęcia, gify. po prostu wklej link i gotowe!

bez reklam, trackerów, płatnych zapór i innych bzdur. po prostu wygodna
aplikacja internetowa, która działa wszędzie i zawsze, gdy jej potrzebujesz.
</section>

<section id="motivation">
<SectionHeading
    title={$t("about.heading.motivation")}
    sectionId="motivation"
/>

cobalt został stworzony dla dobra publicznego, aby chronić ludzi przed reklamami
i złośliwym oprogramowaniem wypychanym przez jego alternatywy. wierzymy, że
najlepsze oprogramowanie jest bezpieczne, otwarte i dostępne.

dzięki naszemu długotrwałemu partnerowi infrastrukturalnemu,
[royalehosting.net]({partners.royalehosting}), możliwe jest utrzymanie głownych
instancji!
</section>

<section id="privacy">
<SectionHeading
    title={$t("about.heading.privacy")}
    sectionId="privacy"
/>

wszystkie żądania do naszych serwerów są anonimowe i wszystkie informacje o
tunelach są szyfrowane. mamy ścisłą zasadę "zero logów" i nie śledzimy *niczego*
o poszczególnych osobach.

gdy żądanie wymaga dodatkowego przetwarzania, cobalt przetwarza pliki w locie.
odbywa się to poprzez tunelowanie przetworzonych części bezpośrednio do klienta,
bez zapisywania czegokolwiek na dysku. na przykład ta metoda jest używana, gdy
usługa podaje kanały wideo i audio jako oddzielne pliki.

dodatkowo możesz [włączyć wymuszone tunelowanie](/settings/privacy#tunnel), aby
chronić swoją prywatność. kiedy włączone, cobalt będzie tunelował wszystkie
pobranie pliki. nikt nie będzie wiedział, skąd coś pobierasz, nawet twój
dostawca sieci. wszystko, co wiedzą to to, że używasz instancji cobalta.
</section>

<section id="community">
<SectionHeading
    title={$t("about.heading.community")}
    sectionId="community"
/>

cobalt jest używany przez niezliczonych artystów, nauczycieli i twórców treści,
aby robić to, co kochają, zawsze jesteśmy na linii z naszą społecznością i
pracujemy razem, aby cobalt był jeszcze bardziej przydatny. nie krępuj się
[dołączyć do rozmowy](/about/community)!

wierzymy, że przysłość internetu jest otwarta, dlatego cobalt jest [source
first](https://sourcefirst.com/) i [łatwy do samodzielnego
hostowania]({docs.instanceHosting}).

jeśli twój znajomy hostuje instancję przetwarzania, po prostu poproś go o domenę
i [dodaj ją w ustawieniach instancji](/settings/instances#community).

możesz sprawdzić kod źródłowy i kontrybuować [na githubie]({contacts.github}) w
dowolnym momencie. witamy wszystkie kontrybucje i sugestie!
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

najnowsze funkcje, takie jak [remuxowanie](/remux), działają lokalnie na twoim
urządzeniu. przetwarzanie na urządzeniu jest wydajne i nigdy nie wysyła niczego
przez internet. doskonale pasuje do naszego przyszłego celu, jakim jest
przeniesienie jak największej ilości przetwarzania do klienta.
</section>
