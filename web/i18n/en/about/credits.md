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

cobalt is made with love and care by [imput](https://imput.net/) ❤️

we're a small team of two guys, but we work really hard to make great software that benefits everyone.
if you like our work, please consider supporting it on the [donate page](/donate)!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

huge shout-out to our testers for testing updates early and making sure they're stable.
they also helped us ship cobalt 10!
<BetaTesters />

all links are external and lead to their personal websites or social media.
</section>

<section id="partners">
<SectionHeading
    title={$t("about.heading.partners")}
    sectionId="partners"
/>

a portion of cobalt's processing infrastructure
is provided by our long-standing partner, [royalehosting.net]({partners.royalehosting})!
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

meowbalt is cobalt's speedy mascot, a very expressive cat who loves fast internet.

all amazing art of meowbalt that you see in cobalt
was made by [GlitchyPSI](https://glitchypsi.xyz/).
he's also the original creator of the character.

imput holds legal rights to meowbalt's character design,
but not specific artworks that were created by GlitchyPSI.

we love meowbalt, so we have to set a few rules in place to protect him:
- you cannot use meowbalt's character design in any form that isn't fan art.
- you cannot use meowbalt's design or artworks commercially.
- you cannot use meowbalt's design or artworks in your own projects.
- you cannot use or modify GlitchyPSI's artworks of meowbalt in any form.

if you create fan art of meowbalt, please share it in
[our discord server](/about/community), we'd love to see it!
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

cobalt api (processing server) code is open source and licensed under [AGPL-3.0]({docs.apiLicense}).

cobalt frontend code is [source first](https://sourcefirst.com/) and is licensed under [CC-BY-NC-SA 4.0]({docs.webLicense}).

we had to make frontend source first to stop grifters from profiting off our work
& from creating malicious clones that deceive people and hurt our public identity.
other than commercial use, it follows same principles as many open source licenses.

we rely on many open source libraries, but also create & distribute our own.
you can see the full list of dependencies on [github]({contacts.github})!
</section>
