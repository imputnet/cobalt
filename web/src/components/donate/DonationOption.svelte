<script lang="ts">
    export let price: number;
    export let desc: string;
    export let send: (amount: number) => void;

    const click = () => send(price * 100);
</script>

<button class="donation-option" on:click={click}>
    <div class="donation-title">
        <slot></slot>
        ${price}
    </div>
    <div class="donation-subtitle">{desc}</div>
</button>

<style>
    .donation-option .donation-subtitle {
        white-space: nowrap;
    }

    .donation-option :global(svg) {
        width: 20px;
        height: 20px;
    }
</style>
