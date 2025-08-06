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

cobalts datenschutzrichtlinie ist einfach: wir sammeln oder speichern nichts über dich.
was du tust, ist ausschließlich deine sache, nicht unsere oder die von jemand anderem.

diese bedingungen gelten nur bei der verwendung der offiziellen cobalt-instanz.
in anderen fällen musst du möglicherweise den instanz-host für genaue informationen kontaktieren.
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

tools, die on-device-verarbeitung verwenden, arbeiten offline, lokal,
und senden niemals verarbeitete daten irgendwohin.
sie sind explizit als solche gekennzeichnet, wann immer zutreffend.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

bei der verwendung der speicherfunktion muss cobalt möglicherweise dateien proxy oder remux/transcode.
wenn das der fall ist, wird ein temporärer tunnel zu diesem zweck erstellt
und minimale erforderliche informationen über die medien werden für 90 sekunden gespeichert.

auf einer unmodifizierten & offiziellen cobalt-instanz
**werden alle tunnel-daten mit einem schlüssel verschlüsselt, auf den nur der endbenutzer zugriff hat**.

verschlüsselte tunnel-daten können enthalten:
- name des ursprungsdienstes.
- originale URLs für mediendateien.
- interne argumente, die benötigt werden, um zwischen arten der verarbeitung zu unterscheiden.
- minimale datei-metadaten (generierter dateiname, titel, autor, erstellungsjahr, urheberrechtsinfo).
- minimale informationen über die ursprüngliche anfrage, die im fall eines URL-fehlers während des tunneling-prozesses verwendet werden können.

diese daten werden nach 90 sekunden unwiderruflich aus dem server-ram gelöscht.
niemand hat zugriff auf zwischengespeicherte tunnel-daten, nicht einmal instanz-besitzer,
solange cobalts quellcode nicht modifiziert wird.

mediendaten aus tunnels werden niemals irgendwo gespeichert/zwischengespeichert.
alles wird live verarbeitet, auch während remuxing und transcoding.
cobalt-tunnels funktionieren wie ein anonymer proxy.

wenn dein gerät lokale verarbeitung unterstützt,
enthält die verschlüsselte tunnel-info viel weniger informationen, weil sie stattdessen an den client zurückgegeben wird.

siehe den [zugehörigen quellcode auf github](https://github.com/imputnet/cobalt/tree/main/api/src/stream)
um mehr darüber zu erfahren, wie es funktioniert.
</section>

<section id="encryption">
<SectionHeading
    title={$t("about.heading.encryption")}
    sectionId="encryption"
/>

temporär gespeicherte tunnel-daten werden mit dem AES-256-standard verschlüsselt.
entschlüsselungsschlüssel sind nur im zugriffs-link enthalten und werden niemals protokolliert/zwischengespeichert/gespeichert.
nur der endbenutzer hat zugriff auf den link & entschlüsselungsschlüssel.
schlüssel werden einzigartig für jeden angeforderten tunnel generiert.
</section>

{#if env.PLAUSIBLE_ENABLED}
<section id="plausible">
<SectionHeading
    title={$t("about.heading.plausible")}
    sectionId="plausible"
/>

wir verwenden [plausible](https://plausible.io/), um eine ungefähre anzahl
aktiver cobalt-nutzer zu erhalten, vollständig anonym. keine identifizierbaren informationen über
dich oder deine anfragen werden jemals gespeichert. alle daten werden anonymisiert und aggregiert.
wir hosten und verwalten die [plausible-instanz](https://{env.PLAUSIBLE_HOST}/), die cobalt verwendet.

plausible verwendet keine cookies und ist vollständig mit GDPR, CCPA und PECR konform.

wenn du dich von anonymen analysen abmelden möchtest, kannst du das in den [datenschutzeinstellungen](/settings/privacy#analytics) tun.
wenn du dich abmeldest, wird das plausible-script überhaupt nicht geladen.

[erfahre mehr über plausibles engagement für datenschutz](https://plausible.io/privacy-focused-web-analytics).
</section>
{/if}

<section id="cloudflare">
<SectionHeading
    title={$t("about.heading.cloudflare")}
    sectionId="cloudflare"
/>

wir verwenden cloudflare-dienste für:
- ddos & missbrauchsschutz.
- bot-schutz (cloudflare turnstile).
- hosting & deployment der statisch gerenderten web-app (cloudflare workers).

alle diese sind erforderlich, um die beste erfahrung für alle zu bieten.
cloudflare ist der privateste & zuverlässigste anbieter für alle genannten lösungen, die wir kennen.

cloudflare ist vollständig mit GDPR und HIPAA konform.

[erfahre mehr über cloudflares engagement für datenschutz](https://www.cloudflare.com/trust-hub/privacy-and-data-protection/).
</section>
