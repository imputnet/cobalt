<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

tyto podmínky platí pouze v případě, že používáš oficiální hlavní instanci
cobaltu. v ostatních případech se můžeš obrátit na hostitele, který ti poskytne
relevantnější informace.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

ukládání zjednodušuje stahování obsahu z internetu a nenese žádnou odpovědnost
za to, k čemu se uložený obsah používá. servery pro zpracování fungují jako
specializované proxy servery a nikdy nezapisují žádný obsah na disk. vše se
zpracovává v paměti RAM a po dokončení tunelování se data nenávratně smažou.
nedržíme žádné záznamy o stahování a nemůžeme nikoho identifikovat.

[více informací o fungování tunelů nalezneš v našich zásadách ochrany osobních
údajů.](/about/privacy)
</section>

<section id="responsibility">
<SectionHeading
    title={$t("about.heading.responsibility")}
    sectionId="responsibility"
/>

ty (koncový uživatel) jsi zodpovědný/á za to, co s našimi nástroji děláš, a jak
používáš a šíříš výsledný obsah. při používání cizího obsahu buď prosím
obezřetný/á a vždy uváděj původního tvůrce. ujisti se, že neporušuješ žádné
podmínky nebo licence.

při používání pro vzdělávací účely vždy uváděj zdroje a uveď původní tvůrce.

spravedlivé použití a zásluha jsou přínosem pro všechny.
</section>

<section id="abuse">
<SectionHeading
    title={$t("about.heading.abuse")}
    sectionId="abuse"
/>

we have no way of detecting abusive behavior automatically because cobalt is
100% anonymous. however, you can report such activities to us via email and
we'll do our best to comply manually: abuse[at]imput.net

**tento e-mail není určen pro uživatelskou podporu, pokud se tvůj problém netýká
zneužití, nedostaneš odpověď.**

pokud máš problémy s cobaltem, kontaktuj nás jakýmkoli preferovaným způsobem na
[stránce podpory](/about/community).
</section>
