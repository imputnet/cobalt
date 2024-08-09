<script lang="ts">
    export let price: number;
    export let desc: string;
    export let send: (amount: number) => void;

    const click = () => send(price * 100);
</script>

<button class="donation-option" on:click={click}>
    <div class="donate-card-title">
        <slot></slot>
        ${price}
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
