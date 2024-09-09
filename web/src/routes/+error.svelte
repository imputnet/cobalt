<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { defaultNavPage } from "$lib/subnav";

    onMount(() => {
        if ($page.error?.message === "Not Found") {
            if ($page.url.pathname.startsWith("/settings")) {
                goto(defaultNavPage("settings"), { replaceState: true });
            } else if ($page.url.pathname.startsWith("/about")) {
                goto(defaultNavPage("about"), { replaceState: true });
            } else {
                goto("/", { replaceState: true });
            }
        }
    });
</script>
