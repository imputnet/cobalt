<script lang="ts">
    import { partners, contacts, docs } from "$lib/env";
    import OuterLink from "$components/misc/OuterLink.svelte";
</script>

<div id="privacy-body" class="long-text-noto about">
    <section id="saving">
        <h3>best way to save what you love</h3>
        <p>
            cobalt lets you save anything from your favorite websites: video, audio, photos or gifs — cobalt can do it all!
        </p>
        <p>
            no ads, trackers, or paywalls, no nonsense. just a convenient web app that works everywhere.
        </p>
    </section>

    <section id="privacy">
        <h3>leading privacy</h3>
        <p>
            all requests to backend are anonymous and all tunnels are encrypted.
            we have a strict zero log policy and don't track <i>anything at all</i>.
        </p>
        <p>
            to avoid caching or storing downloaded files, cobalt processes them on-fly, sending processed pieces directly to client.
            this technology is used when your request needs additional processing, such as when source service stores video & audio in separate files.
        </p>
        <p>
            for even higher level of protection, you can <a href="/settings/privacy#tunnel">ask cobalt to always tunnel everything</a>.
            when enabled, cobalt will proxy everything through itself. no one will know what you download, even your network provider/admin.
            all they'll see is that you're using cobalt.
        </p>
    </section>

    <section id="speed">
        <h3>blazing speed</h3>
        <p>
            since we don't rely on any existing downloaders and develop our own from ground up,
            cobalt is extremely efficient and a processing server can run on basically any hardware.
        </p>
        <p>
            main processing instances are hosted on several dedicated servers in several countries,
            to reduce latency and distribute the traffic.
        </p>
        <p>
            we constantly improve our infrastructure along with our long-standing partner,
            <OuterLink href="{partners.royalehosting}">royalehosting.net</OuterLink>!
            you're in good hands, and will get what you need within seconds.
        </p>
    </section>

    <section id="community">
        <h3>open community</h3>
        <p>
            cobalt is used by countless artists, educators, and content creators to do what they love.
            we're always on the line with our community and work together to create even more useful tools for them.
            feel free to <a href="/about/community">join the conversation</a>!
        </p>
        <p>
            we believe that the future of the internet is open,
            which is why cobalt is
            <OuterLink
                href="https://sourcefirst.com/">
                source first
            </OuterLink>
            and
            <OuterLink href={docs.instanceHosting}>
                easily self-hostable.
            </OuterLink>

            you can <OuterLink href="{contacts.github}">check the source code & contribute to cobalt</OuterLink>
            at any time, we welcome all contributions and suggestions.
        </p>
        <p>
            you can use any processing instances hosted by the community, including your own.
            if your friend hosts one, just ask them for a domain and <a href="/settings/instances#community">add it in instance settings</a>.
        </p>
    </section>

    <section id="local">
        <h3>on-device processing</h3>
        <p>
            new features, such as <a href="/remux">remuxing</a>, work on-device.
            on-device processing is efficient and never sends anything over the internet.
            it perfectly aligns with our future goal of moving as much processing as possible to client.
        </p>
    </section>
</div>
