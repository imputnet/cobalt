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

cobalt ti pomůže uložit cokoli z tvých oblíbených webových stránek: video, zvuk,
fotografie nebo gify. stačí vložit odkaz a můžeme jít na to!

žádné reklamy, trackery, paywally ani jiné nesmysly. jen pohodlná webová
aplikace, která funguje kdekoli a kdykoli ji potřebuješ.
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

cobalt používá nespočet umělců, pedagogů a tvůrců obsahu k tomu, aby mohli
dělat, co je baví. s naší komunitou jsme stále na jedné lodi a společně
pracujeme na tom, aby byl cobalt ještě užitečnější. neváhejte a [zapojte se do
konverzace](/about/community)!

věříme, že budoucnost internetu je otevřená, a proto je cobalt [source
first](https://sourcefirst.com/) a [snadno
hostovatelný]({docs.instanceHosting}).

pokud tvůj kamarád hostuje zpracovávací instanci, stačí je požádat o doménu a
[přidat ji do nastavení instance](/settings/instances#community).

kdykoli můžeš zkontrolovat zdrojový kód a přispívat do něj [na
githubu]({contacts.github}). vítáme všechny příspěvky a návrhy!
</section>
