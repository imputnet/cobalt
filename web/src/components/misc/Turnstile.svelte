<script lang="ts">
    import env from "$lib/env";
    import { onMount } from "svelte";

    import { turnstileLoaded, turnstileCreated } from "$lib/state/turnstile";

    let turnstileElement: HTMLElement;
    let turnstileScript: HTMLElement;

    onMount(() => {
        const sitekey = env.TURNSTILE_KEY;
        if (!sitekey) return;

        $turnstileCreated = true;

        const setup = () => {
            window.turnstile?.render(turnstileElement, {
                sitekey,
                "error-callback": (error) => {
                    console.log("turnstile error code:", error);
                    return true;
                },
                callback: () => {
                    $turnstileLoaded = true;
                }
            });
        }

        if (window.turnstile) {
            setup();
        } else {
            turnstileScript.addEventListener("load", setup);
        }
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
