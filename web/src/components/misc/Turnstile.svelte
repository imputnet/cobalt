<script lang="ts">
    import env from "$lib/env";
    import { onMount } from "svelte";

    let turnstileElement: HTMLElement;
    let turnstileScript: HTMLElement;

    onMount(() => {
        if (!env.TURNSTILE_KEY) return;

        turnstileScript.addEventListener("load", () => {
            window.turnstile?.render(turnstileElement, {
                sitekey: env.TURNSTILE_KEY,
                "error-callback": (error) => {
                    console.log("turnstile error code:", error);
                    return true;
                },
            });
        });
    });
</script>

<svelte:head>
    <script
        bind:this={turnstileScript}
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        defer
    ></script>
</svelte:head>

<div id="turnstile-container">
    <div bind:this={turnstileElement} id="turnstile-widget"></div>
</div>

<style>
    #turnstile-container {
        position: absolute;
        z-index: 999;
        right: 0;
    }
</style>
