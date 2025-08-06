<script lang="ts">
    import { contacts, docs, partners } from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
    import BetaTesters from "$components/misc/BetaTesters.svelte";
</script>

<section id="imput">
<SectionHeading
    title="imput"
    sectionId="imput"
/>

cobalt wird mit liebe und sorgfalt von [imput](https://imput.net/) gemacht ❤️

wir sind ein kleines team von zwei jungs, aber wir arbeiten wirklich hart daran, großartige software zu machen, die allen nützt.
wenn dir unsere arbeit gefällt, erwäge bitte, sie auf der [spendenseite](/donate) zu unterstützen!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

riesen dank an unsere tester, die updates früh testen und sicherstellen, dass sie stabil sind.
sie haben uns auch dabei geholfen, cobalt 10 zu veröffentlichen!
<BetaTesters />

alle links sind extern und führen zu ihren persönlichen websites oder sozialen medien.
</section>

<section id="partners">
<SectionHeading
    title={$t("about.heading.partners")}
    sectionId="partners"
/>

ein teil von cobalts verarbeitungsinfrastruktur
wird von unserem langjährigen partner [royalehosting.net]({partners.royalehosting}) bereitgestellt!
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

meowbalt ist cobalts schnelles maskottchen, eine sehr ausdrucksstarke katze, die schnelles internet liebt.

alle erstaunlichen kunstwerke von meowbalt, die du in cobalt siehst,
wurden von [GlitchyPSI](https://glitchypsi.xyz/) gemacht.
er ist auch der ursprüngliche schöpfer der figur.

imput hält die rechtlichen rechte an meowbalts charakterdesign,
aber nicht an spezifischen kunstwerken, die von GlitchyPSI erstellt wurden.

wir lieben meowbalt, daher müssen wir einige regeln festlegen, um ihn zu schützen:
- du kannst meowbalts charakterdesign nicht in irgendeiner form verwenden, die kein fanart ist.
- du kannst meowbalts design oder kunstwerke nicht kommerziell verwenden.
- du kannst meowbalts design oder kunstwerke nicht in deinen eigenen projekten verwenden.
- du kannst GlitchyPSIs kunstwerke von meowbalt nicht in irgendeiner form verwenden oder modifizieren.

wenn du fanart von meowbalt erstellst, teile es bitte in
[unserem discord server](/about/community), wir würden es gerne sehen!
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

cobalt api (verarbeitungsserver) code ist open source und lizenziert unter [AGPL-3.0]({docs.apiLicense}).

cobalt frontend code ist [source first](https://sourcefirst.com/) und lizenziert unter [CC-BY-NC-SA 4.0]({docs.webLicense}).

wir mussten das frontend source first machen, um zu verhindern, dass betrüger von unserer arbeit profitieren
& bösartige klone erstellen, die menschen täuschen und unserer öffentlichen identität schaden.
außer kommerzieller nutzung folgt es den gleichen prinzipien wie viele open source lizenzen.

wir verlassen uns auf viele open source bibliotheken, erstellen und verteilen aber auch unsere eigenen.
du kannst die vollständige liste der abhängigkeiten auf [github]({contacts.github}) sehen!
</section>
