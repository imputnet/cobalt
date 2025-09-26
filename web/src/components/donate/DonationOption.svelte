<script lang="ts">
    export let price: number;
    export let desc: string;
    export let href: string;
    export let icon: ConstructorOfATypedSvelteComponent;

    const USD = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
    });
</script>

<button
    class="donation-option"
    on:click={() => {
        window.open(href, "_blank");
    }}
>
    <div class="donate-card-title">
        <svelte:component this={icon} />
        {USD.format(price)}
    </div>
    <div class="donate-card-subtitle">{desc}</div>
</button>

<style>
    .donation-option .donate-card-subtitle {
        white-space: nowrap;
    }

    .donation-option :global(svg) {
        width: 20px;
        height: 20px;
        stroke-width: 1.8px;
    }

    @media screen and (max-width: 550px) {
        .donation-option :global(svg) {
            width: 18px;
            height: 18px;
        }
    }
</style>
