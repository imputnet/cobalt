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

cobalt byl vytvořen pro veřejný prospěch, aby chránil lidi před reklamami a
škodlivým softwarem, který prosazují jeho alternativy. věříme, že nejlepší
software je bezpečný, otevřený a přístupný všem.

díky našemu dlohodobému partnerovi v oblasti infrastruktury, společnosti
[royalehosting.net]({partners.royalehosting}), je možné udržet hlavní instanci v
provozu!
</section>

<section id="privacy">
<SectionHeading
    title={$t("about.heading.privacy")}
    sectionId="privacy"
/>

všechny požadavky na backend jsou anonymní a všechny informace o tunelech jsou
šifrované. máme přísnou politiku nulového logování a nesledujeme *nic* o
jednotlivých lidech.

pokud požadavek vyžaduje další zpracování, cobalt zpracovává soubory za běhu. to
se provádí tunelováním zpracovaných částí přímo do klienta, aniž by se cokoli
ukládalo na disk. tato metoda se používá například tehdy, když zdrojová služba
poskytuje video a zvukové kanály jako samostatné soubory.

navíc můžeš [zapnout vynucené tunelování](/settings/privacy#tunnel) a chránit
tak své soukromí. pokud je tato funkce povolena, cobalt bude tunelovat všechny
stahované soubory. nikdo se nedozví, odkud něco stahuješ, dokonce ani tvůj
poskytovatel sítě. uvidí pouze to, že používáš instanci cobaltu.
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

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

nejnovější funkce, jako je [remuxing](/remux), fungují lokálně na zařízení.
zpracování na zařízení je efektivní a nikdy se nic neodesílá přes internet.
dokonale to odpovídá našemu budoucímu cíli přesunout co nejvíce zpracování na
klienta.
</section>
