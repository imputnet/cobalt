<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

questi termini si applicano solo se usi l'istanza ufficiale di cobalt. in
qualsiasi altro caso, potresti dover contattare l'hoster per informazioni
accurate.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

la funzionalità di salvataggio semplifica il download di contenuti da internet e
non si assume nessuna responsabilità per cosa viene utilizzato il contenuto
salvato. i server di processazione funzionano come dei proxy avanzati e non
scrivono mai nessun contenuto sul disco. tutto è gestito in RAM e eliminato
permanentemente una volta finito il tunnel. non manteniamo nessun log e non
possiamo identificare nessuno.

[puoi leggere di più su come funzionano i tunnel nella nostra policy sulla
privacy.](/about/privacy)
</section>

<section id="responsibility">
<SectionHeading
    title={$t("about.heading.responsibility")}
    sectionId="responsibility"
/>

tu (l'utente finale) sei responsabile per quello che fai con i nostri strumenti,
come usi e distribuisci i contenuti risultanti. sii consapevole quando usi i
contenuti di altri e dai sempre i crediti ai creator originali. assicurati di
non violare nessun termine o licenza.

quando usati per scopi educativi, cita sempre le fonti originali e dai i crediti
ai creator originali.

i crediti e il fair use beneficiano tutti.
</section>

<section id="abuse">
<SectionHeading
    title={$t("about.heading.abuse")}
    sectionId="abuse"
/>

we have no way of detecting abusive behavior automatically because cobalt is
100% anonymous. however, you can report such activities to us via email and
we'll do our best to comply manually: abuse[at]imput.net

**questa email non è per il supporto agli utenti, non riceverai alcuna risposta
se il tuo problema non è correlato a un abuso**

se hai dei problemi, contattaci tramite il tuo metodo preferito sulla [pagina
del supporto](/about/community).
</section>
