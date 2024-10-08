<script lang="ts">
    import locale from "$lib/i18n/locale";

    import { contacts } from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import DonateAltItem from "$components/donate/DonateAltItem.svelte";
</script>

<!--
    this page is not final and is more of a quick mockup. this is why donate alt item is used for links.
-->
<div id="community-body">
    {#if $locale !== "ru"}
        <DonateAltItem
            type="open"
            name={$t("about.community.discord")}
            address={contacts.discord}
        />

        <DonateAltItem
            type="open"
            name={$t("about.community.twitter")}
            address={contacts.twitter}
            title="@justusecobalt"
        />
    {/if}

    <DonateAltItem
        type="open"
        name={$t("about.community.github")}
        address={contacts.github}
    />

    <DonateAltItem
        type="open"
        name={$t("about.community.email")}
        address="mailto:{contacts.email}"
        title="{contacts.email}"
    />

    {#if $locale === "ru"}
        <DonateAltItem
            type="open"
            name={$t("about.community.telegram")}
            address={contacts.telegram_ru}
            title="@justusecobalt_ru"
        />
    {/if}
</div>

<style>
    #community-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
    }

    @media screen and (max-width: 1030px) {
        #community-body {
            grid-template-columns: 1fr;
        }
    }
</style>
