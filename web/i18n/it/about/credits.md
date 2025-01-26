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

cobalt è sviluppato con amore e cura dal team di ricerca e sviluppo
[imput](https://imput.net/).

puoi supportarci sulla [pagina delle donazioni](/donate)!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

enorme shoutout ai nostri pasticcioni per testare in anticipo gli aggiornamenti
e assicurarsi che siano stabili. ci hanno anche aiutato a rilasciare cobalt 10!
<BetaTesters />

tutti i link sono esterni e portano ai loro siti personali o social media.
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

miaobalt è la mascotte velocissima di cobalt. è un gatto estremamente espressivo
che ama l'internet veloce.

tutti i disegni bellissimi di miaobalt che vedi su cobalt sono stati fatti da
[GlitchyPSI](https://glitchypsi.xyz/). è anche il designer originale del
personaggio.

non puoi usare o modificare gli artwork di miaobalt di GlitchyPSI senza il suo
permesso esplicito.

non puoi usare o modificare il design del personaggio di miaobalt
commercialmente o in nessun modo che non sia fan art.
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

il server di processazione di cobalt è open source e sotto licenza
[AGPL-3.0]({docs.apiLicense}).

il frontend di cobalt è [source first](https://sourcefirst.com/) e sotto licenza
[CC-BY-NC-SA 4.0]({docs.webLicense}). abbiamo deciso di usare questa licenza per
evitare ai truffatori di guadagnare dal nostro lavoro e creare cloni malevoli
che ingannano le persone e rovinano la nostra reputazione.

facciamo affidamento su molte librerie open source, creiamo e distribuiamo le
nostre. puoi vedere la lista completa di dipendenze su
[github]({contacts.github}).
</section>
