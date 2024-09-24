<script lang="ts">
    import { onMount } from "svelte";

    import { cachedInfo } from "$lib/api/server-info";
    import { turnstileLoaded, turnstileCreated } from "$lib/state/turnstile";

    let turnstileElement: HTMLElement;
    let turnstileScript: HTMLElement;

    onMount(() => {
        const sitekey = $cachedInfo?.info?.cobalt?.turnstileSitekey;
        if (!sitekey) return;

        $turnstileCreated = true;

        const setup = () => {
            window.turnstile?.render(turnstileElement, {
                sitekey,
                "error-callback": (error) => {
                    console.log("error code from turnstile:", error);
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
