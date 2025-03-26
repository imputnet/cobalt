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

cobalt је направљен с љубављу и пажњом од стране [imput](https://imput.net/)
тима за истраживање и развој.

можете нас подржати на [страници за донације](/donate)!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

огромно хвала нашим „thing breakers “ који тестирају ажурирања рано и
осигуравају да су стабилна. такође су нам помогли да испоручимо cobalt 10!
<BetaTesters />

све везе су спољашње и воде на њихове личне веб странице или друштвене мреже.
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

meowbalt is cobalt's speedy mascot. he is an extremely expressive cat that loves
fast internet.

all amazing drawings of meowbalt that you see in cobalt were made by
[GlitchyPSI](https://glitchypsi.xyz/). he is also the original designer of the
character.

you cannot use or modify GlitchyPSI's artworks of meowbalt without his explicit
permission.

you cannot use or modify the meowbalt character design commercially or in any
form that isn't fan art.
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

cobalt processing server is open source and licensed under
[AGPL-3.0]({docs.apiLicense}).

cobalt frontend is [source first](https://sourcefirst.com/) and licensed under
[CC-BY-NC-SA 4.0]({docs.webLicense}). we decided to use this license to stop
grifters from profiting off our work & from creating malicious clones that
deceive people and hurt our public identity.

we rely on many open source libraries, create & distribute our own. you can see
the full list of dependencies on [github]({contacts.github}).
</section>
