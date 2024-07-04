<script lang="ts">
    import { goto } from '$app/navigation';
    import { page } from '$app/stores';
    import { defaultSettingsPage } from '$lib/settings/defaults';

    $: {
        if (
            $page.error?.message === 'Not Found'
            && $page.url.pathname.startsWith('/settings')
        ) {
            goto(defaultSettingsPage(), { replaceState: true });
        }
    }
</script>

<!-- TODO: nicer errors -->
<h1>{$page.status}: {$page.error?.message}</h1>