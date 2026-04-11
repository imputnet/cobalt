<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

diese bedingungen gelten nur bei der verwendung der offiziellen cobalt-instanz.
in anderen fällen musst du möglicherweise den instanz-host für genaue informationen kontaktieren.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

die speicherfunktion vereinfacht das herunterladen von inhalten aus dem internet
und wir übernehmen keine haftung für die verwendung der gespeicherten inhalte.

verarbeitungsserver arbeiten wie erweiterte proxys und schreiben niemals angeforderte inhalte auf die festplatte.
alles wird im ram behandelt und dauerhaft gelöscht, sobald der tunnel abgeschlossen ist.
wir haben keine download-protokolle und können niemanden identifizieren.

du kannst mehr darüber erfahren, wie tunnels funktionieren, in der [datenschutzrichtlinie](/about/privacy).
</section>

<section id="responsibility">
<SectionHeading
    title={$t("about.heading.responsibility")}
    sectionId="responsibility"
/>

du (endbenutzer) bist verantwortlich für das, was du mit unseren tools machst, wie du die resultierenden inhalte verwendest und verbreitest.
sei bitte achtsam bei der verwendung von inhalten anderer und gib immer den ursprünglichen schöpfern kredit.
stelle sicher, dass du keine bedingungen oder lizenzen verletzt.

bei der verwendung zu bildungszwecken, zitiere immer quellen und gib den ursprünglichen schöpfern kredit.

fair use und kredite nützen allen.
</section>

<section id="abuse">
<SectionHeading
    title={$t("about.heading.abuse")}
    sectionId="abuse"
/>

wir haben keine möglichkeit, missbräuchliches verhalten automatisch zu erkennen, da cobalt vollständig anonym ist.
du kannst solche aktivitäten jedoch per e-mail an uns melden und wir werden unser bestes tun, um manuell zu reagieren: abuse[at]imput.net

**diese e-mail ist nicht für benutzerunterstützung gedacht, du wirst keine antwort erhalten, wenn dein anliegen nicht mit missbrauch zusammenhängt.**

wenn du probleme hast, kannst du über jede bevorzugte methode auf der [community-seite](/about/community) um unterstützung bitten.
</section>
