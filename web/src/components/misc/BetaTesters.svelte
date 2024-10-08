<script lang="ts">
    import OuterLink from "./OuterLink.svelte";

    type Tester = { name: string, url?: string };
    const credits: Tester[] = [
        { name: "codfish246" },
        { name: "damir", url: "https://otomir23.me/" },
        { name: "Hunter" },
        { name: "hyperdefined", url: "https://hyper.lol/" },
        { name: "KwiatekMiki", url: "https://kwiatekmiki.com/" },
        { name: "Lao", url: "https://lao.ooo/" },
        { name: "lostdusty", url: "https://lostdusty.dev.br/" },
        { name: "noblereign", url: "https://fursona.directory/@frost" },
        { name: "Spax", url: "https://spax.zone/" },
        { name: "synzr", url: "https://synzr.space/" },
        { name: "vimae", url: "https://mae.wtf/" }
    ];
</script>

<ul>
    {#each credits as { name, url }}
        <li>
            {#if url}
                <OuterLink href={url}>
                    {name}
                </OuterLink>
            {:else}
                {name}
            {/if}
        </li>
    {/each}
</ul>
