<script lang="ts">
    import env from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

zásady ochrany osobních údajů cobaltu jsou jednoduché: nic o tobě
neshromažďujeme ani neukládáme. to, co děláš, je výhradně tvoje věc, ne naše
nebo kohokoli jiného.

tyto podmínky platí pouze v případě, že používáš oficiální hlavní instanci
cobaltu. v ostatních případech se můžeš obrátit na hostitele, který ti poskytne
relevantnější informace.
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

nástroje, které používají zpracování na zařízení, pracují offline, lokálně a
nikdy nikam neodesílají žádná data. jsou tak výslovně označeny, kdykoli je to
možné.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

při použití funkce ukládání v některých případech cobalt zašifruje a dočasně
uloží informace potřebné pro tunelování. jsou uloženy v paměti RAM
zpracovávajícího serveru po dobu 90 sekund a poté jsou nenávratně vymazány.
nikdo k nim nemá přístup, dokonce ani vlastníci instancí, pokud nezměnili
oficiální obraz cobaltu.

zpracovávané/tunelované soubory se nikdy nikde neukládají do mezipaměti. vše se
tuneluje za běhu. funkce ukládání v cobaltu je v podstatě speciální proxy
služba.
</section>

<section id="encryption">
<SectionHeading
    title={$t("about.heading.encryption")}
    sectionId="encryption"
/>

dočasně uložená data tunelu jsou šifrována pomocí standardu AES-256. dešifrovací
klíče jsou obsaženy pouze v přístupovém odkazu a nikdy nejsou nikde
zaznamenány/ukládány do mezipaměti. přístup k odkazu a šifrovacím klíčům má
pouze koncový uživatel. klíče jsou generovány jedinečně pro každý požadovaný
tunel.
</section>

{#if env.PLAUSIBLE_ENABLED}
<section id="plausible">
<SectionHeading
    title={$t("about.heading.plausible")}
    sectionId="plausible"
/>

z důvodu ochrany soukromí používáme [anonymní analýzu provozu]
(https://plausible.io/) Plausible k získání přibližného počtu aktivních
uživatelů cobaltu. nikdy se neukládají žádné identifikovatelné informace o tobě
nebo tvých požadavcích. všechna data jsou anonymizovaná a agregovaná. instance
Plausible, kterou používáme, je hostována a spravována námi.

plausible nepoužívá cookies a je plně v souladu s GDPR, CCPA a PECR.

[zjistěte více o ochraně osobních údajů v
plausible.](https://plausible.io/privacy-focused-web-analytics)

pokud se chceš odhlásit z anonymní analýzy, můžeš tak učinit v [nastavení
soukromí](/settings/privacy#analytics).
</section>
{/if}

<section id="cloudflare">
<SectionHeading
    title={$t("about.heading.cloudflare")}
    sectionId="cloudflare"
/>

používáme službu cloudflare pro ochranu proti ddos a botům. používáme také
cloudflare pages pro nasazení a hostování statické webové aplikace. všechny tyto
služby jsou nutné pro zajištění co nejlepšího zážitku pro všechny. je to
nejsoukromější a nejspolehlivější poskytovatel, o kterém víme.

cloudflare je plně v souladu s GDPR a HIPAA.

[více informací o ochraně osobních údajů v společnosti
cloudflare.](https://www.cloudflare.com/trust-hub/privacy-and-data-protection/)
</section>
