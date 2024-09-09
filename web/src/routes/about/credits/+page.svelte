<script lang="ts">
    import { contacts, docs } from "$lib/env";
    import OuterLink from "$components/misc/OuterLink.svelte";
</script>

<div id="credits-body" class="long-text-noto about">
    <section id="meowbalt">
        <h3>meowbalt</h3>
        <p>
            meowbalt is cobalt's speedy mascot. he is an extremely expressive cat that loves fast internet.
        </p>
        <p>
            all amazing drawings of meowbalt that you see in cobalt were made by
            <OuterLink href="https://glitchypsi.xyz/">GlitchyPSI</OuterLink>.
            he is also the original designer of the character.
        </p>
        <p>
            you cannot use or modify GlitchyPSI's artworks of meowbalt without his explicit permission.
        </p>
        <p>
            you cannot use or modify the meowbalt character design commercially or in any form that isn't fan art.
        </p>
    </section>
    <section id="licenses">
        <h3>cobalt licenses</h3>
        <p>
            cobalt processing server is open source and licensed under <OuterLink href={docs.apiLicense}>AGPL-3.0</OuterLink>.
        </p>
        <p>
            cobalt frontend is
            <OuterLink href="https://sourcefirst.com/">source first</OuterLink>
            and licensed under
            <OuterLink href={docs.webLicense}>CC-BY-NC-SA 4.0</OuterLink>.
            we decided to use this license to stop grifters from profiting off our work & from creating malicious clones that deceive people and hurt our public identity.
        </p>
        <p>
            we rely on many open source libraries, create & distribute our own.
            you can see the full list of dependencies on <OuterLink href={contacts.github}>github</OuterLink>.
        </p>
    </section>
</div>
