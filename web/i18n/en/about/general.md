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

cobalt helps you save anything from your favorite websites: video, audio, photos or gifs. just paste the link and you're ready to rock!

no ads, trackers, paywalls, or other nonsense. just a convenient web app that works anywhere, whenever you need it.
</section>

<section id="motivation">
<SectionHeading
    title={$t("about.heading.motivation")}
    sectionId="motivation"
/>

cobalt was created for public benefit, to protect people from ads and malware pushed by alternative downloaders.
we believe that the best software is safe, open, and accessible. all imput project follow these basic principles.
</section>

<section id="privacy-efficiency">
<SectionHeading
    title={$t("about.heading.privacy_efficiency")}
    sectionId="privacy-efficiency"
/>

all requests to the backend are anonymous and all information about potential file tunnels is encrypted.
we have a strict zero log policy and don't store or track *anything* about individual people.

if a request requires additional processing, such as remuxing or transcoding, cobalt processes media
directly on your device. this ensures best efficiency and privacy.

if your device doesn't support local processing, then server-based live processing is used instead.
in this scenario, processed media is streamed directly to client, without ever being stored on server's disk.

you can [enable forced tunneling](/settings/privacy#tunnel) to boost privacy even further.
when enabled, cobalt will tunnel all downloaded files, not just those that require it.
no one will know where you download something from, even your network provider.
all they'll see is that you're using a cobalt instance.
</section>

<section id="community">
<SectionHeading
    title={$t("about.heading.community")}
    sectionId="community"
/>

cobalt is used by countless artists, educators, and content creators to do what they love.
we're always on the line with our community and work together to make cobalt even more useful.
feel free to [join the conversation](/about/community)!

we believe that the future of the internet is open, which is why cobalt is
[source first](https://sourcefirst.com/) and [easily self-hostable]({docs.instanceHosting}).

if your friend hosts a processing instance, just ask them for a domain and [add it in instance settings](/settings/instances#community).

you can check the source code and contribute [on github]({contacts.github}) at any time.
we welcome all contributions and suggestions!
</section>
