<script lang="ts">
    import { page } from "$app/stores";

    export let categoryName: string;
    export let categoryLink: string;
    export let iconColor: "gray" | "blue" | "green" = "gray";

    $: isActive = $page.url.pathname === `/settings/${categoryLink}`;
</script>

<a
    class="settings-category"
    href="/settings/{categoryLink}"
    class:active={isActive}
>
    <div class="category-icon" style="background: var(--{iconColor})">
        <slot></slot>
    </div>
    <span>{categoryName}</span>
</a>

<style>
    .settings-category {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 10px;
        padding: 8px;
        font-weight: 500;
        background: var(--primary);
        color: var(--button-text);
        border-radius: var(--border-radius);
    }

    .settings-category:hover {
        background: var(--button-hover-transparent);
    }

    .settings-category.active {
        background: var(--secondary);
        color: var(--primary);
    }

    .settings-category span {
        font-size: 14.5px;
    }

    .category-icon {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 5px;
        border-radius: 5px;
    }
</style>
