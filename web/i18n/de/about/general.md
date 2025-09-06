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

cobalt hilft dir dabei, alles von deinen lieblingswebsites zu speichern: video, audio, fotos oder gifs. einfach den link einfügen und du bist bereit!

keine werbung, tracker, paywalls oder anderer unsinn. nur eine praktische web-app, die überall funktioniert, wann immer du sie brauchst.
</section>

<section id="motivation">
<SectionHeading
    title={$t("about.heading.motivation")}
    sectionId="motivation"
/>

cobalt wurde für das öffentliche wohl geschaffen, um menschen vor werbung und malware zu schützen, die von alternativen downloadern verbreitet werden.
wir glauben, dass die beste software sicher, offen und zugänglich ist. alle imput-projekte folgen diesen grundprinzipien.
</section>

<section id="privacy-efficiency">
<SectionHeading
    title={$t("about.heading.privacy_efficiency")}
    sectionId="privacy-efficiency"
/>

alle anfragen an das backend sind anonym und alle informationen über potenzielle datei-tunnel sind verschlüsselt.
wir haben eine strenge null-log-richtlinie und speichern oder verfolgen *nichts* über einzelne personen.

wenn eine anfrage zusätzliche verarbeitung erfordert, wie remuxing oder transcoding, verarbeitet cobalt medien
direkt auf deinem gerät. dies gewährleistet beste effizienz und datenschutz.

wenn dein gerät lokale verarbeitung nicht unterstützt, wird stattdessen serverbasierte live-verarbeitung verwendet.
in diesem szenario werden verarbeitete medien direkt an den client gestreamt, ohne jemals auf der server-festplatte gespeichert zu werden.

du kannst [erzwungenes tunneling aktivieren](/settings/privacy#tunnel), um den datenschutz noch weiter zu verbessern.
wenn aktiviert, wird cobalt alle heruntergeladenen dateien tunneln, nicht nur die, die es erfordern.
niemand wird wissen, woher du etwas herunterlädst, nicht einmal dein netzwerkanbieter.
alles, was sie sehen werden, ist, dass du eine cobalt-instanz verwendest.
</section>

<section id="community">
<SectionHeading
    title={$t("about.heading.community")}
    sectionId="community"
/>

cobalt wird von unzähligen künstlern, pädagogen und content-creatoren verwendet, um das zu tun, was sie lieben.
wir sind immer in verbindung mit unserer community und arbeiten zusammen daran, cobalt noch nützlicher zu machen.
fühle dich frei, [dem gespräch beizutreten](/about/community)!

wir glauben, dass die zukunft des internets offen ist, weshalb cobalt
[source first](https://sourcefirst.com/) und [leicht selbst hostbar]({docs.instanceHosting}) ist.

wenn dein freund eine verarbeitungsinstanz hostet, frage ihn einfach nach einer domain und [füge sie in den instanz-einstellungen hinzu](/settings/instances#community).

du kannst den quellcode einsehen und beitragen [auf github]({contacts.github}) jederzeit.
wir begrüßen alle beiträge und vorschläge!
</section>
