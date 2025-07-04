<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { contacts, docs } from "$lib/env";

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

cobalt was created for public benefit, to protect people from ads and malware
pushed by alternative downloaders. we believe that the best software is safe,
open, and accessible. all imput project follow these basic principles.
</section>

<section id="privacy-efficiency">
<SectionHeading
    title={$t("about.heading.privacy_efficiency")}
    sectionId="privacy-efficiency"
/>

all requests to the backend are anonymous and all information about potential
file tunnels is encrypted. we have a strict zero log policy and don't store or
track *anything* about individual people.

if a request requires additional processing, such as remuxing or transcoding,
cobalt processes media directly on your device. this ensures best efficiency and
privacy.

if your device doesn't support local processing, then server-based live
processing is used instead. in this scenario, processed media is streamed
directly to client, without ever being stored on server's disk.

you can [enable forced tunneling](/settings/privacy#tunnel) to boost privacy
even further. when enabled, cobalt will tunnel all downloaded files, not just
those that require it. no one will know where you download something from, even
your network provider. all they'll see is that you're using a cobalt instance.
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
