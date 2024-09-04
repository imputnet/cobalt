<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import { defaultSettingsPage } from "$lib/subnav";

    onMount(() => {
        if ($page.error?.message === "Not Found") {
            if ($page.url.pathname.startsWith("/settings")) {
                goto(defaultSettingsPage(), { replaceState: true });
            } else {
                goto("/", { replaceState: true });
            }
        }
    });
</script>
