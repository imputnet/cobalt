<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { partners, contacts, docs } from "$lib/env";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="summary">
<SectionHeading
    title={$t("about.heading.summary")}
    sectionId="summary"
/>

bamboo download helps you save anything from your favorite websites: video, audio, photos or gifs. just paste the link and you're ready to rock!

no ads, trackers, paywalls, or other nonsense. just a convenient web app that works anywhere, whenever you need it.
</section>



<section id="privacy">
<SectionHeading
    title={$t("about.heading.privacy")}
    sectionId="privacy"
/>

all requests to the backend are anonymous and all information about tunnels is encrypted.
we have a strict zero log policy and don't track *anything* about individual people.

when a request needs additional processing, bamboo download processes files on-the-fly.
it's done by tunneling processed parts directly to the client, without ever saving anything to disk.
for example, this method is used when the source service provides video and audio channels as separate files.

additionally, you can [enable forced tunneling](/settings/privacy#tunnel) to protect your privacy.
when enabled, bamboo download will tunnel all downloaded files.
no one will know where you download something from, even your network provider.
all they'll see is that you're using a bamboo download instance.
</section>



<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

newest features, such as [remuxing](/remux), work locally on your device.
on-device processing is efficient and never sends anything over the internet.
it perfectly aligns with our future goal of moving as much processing as possible to the client.
</section>
