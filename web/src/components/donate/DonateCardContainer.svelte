<script lang="ts">
    export let id: string;
    export let classes: string = "";
</script>

<div {id} class="donate-card {classes}">
    <slot></slot>
</div>

<style>
    :global(.donate-card) {
        --donate-card-main-padding: 18px;
        --donate-card-padding: 12px;

        display: flex;
        flex-direction: column;
        width: 100%;
        height: fit-content;

        border-radius: var(--donate-border-radius);
        gap: calc(var(--donate-card-main-padding) / 2);

        color: white;
        background: linear-gradient(
            180deg,
            var(--donate-gradient-end) 0%,
            var(--donate-gradient-start) 80%
        );
        box-shadow: 0 0 0 2px rgba(255, 255, 255, var(--donate-border-opacity))
            inset;
    }

    :global(.donate-card button) {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        text-align: left;
        border-radius: var(--donate-card-padding);
        background: rgba(255, 255, 255, 0.05);
        padding: 14px 18px;
        color: var(--white);
        gap: 0;
        letter-spacing: -0.3px;
    }

    :global(.donate-card button:not(:focus-visible)) {
        box-shadow: none;
    }

    :global(.donate-card button:active) {
        background: rgba(255, 255, 255, 0.1);
    }

    @media (hover: hover) {
        :global(.donate-card button:hover) {
            background: rgba(255, 255, 255, 0.1);
        }
    }

    :global(.donate-card button.selected) {
        background: rgba(255, 255, 255, 0.15);
    }

    :global(.donate-card button.selected:not(:focus-visible)) {
        box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.1) inset !important;
    }

    :global(.donate-card-subtitle) {
        font-size: 13px;
        color: var(--white);
        opacity: 0.5;
        line-height: 1.5;
    }

    :global(.donate-card-title) {
        display: flex;
        align-items: center;
        font-size: 16px;
        gap: 4px;
        font-weight: 500;
    }

    @media screen and (max-width: 760px) {
        :global(.donate-card) {
            --donate-card-main-padding: 16px;
        }
    }
</style>
