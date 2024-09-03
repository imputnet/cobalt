<script lang="ts">
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import { defaultSettingsPage } from "$lib/settings/defaults";
    import { onMount } from "svelte";

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
