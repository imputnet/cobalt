<script>
    import locale from '$lib/i18n/locale';
    import { page } from '$app/stores';

    const component = import(`$i18n/${$locale}/about/${$page.params.page}.md`);
</script>

{#await component then component}
    <svelte:component this={component.default} />
{/await}
