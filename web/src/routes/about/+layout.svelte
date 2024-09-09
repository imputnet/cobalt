<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import PageNav from "$components/subnav/PageNav.svelte";

    import PageNavTab from "$components/subnav/PageNavTab.svelte";
    import PageNavSection from "$components/subnav/PageNavSection.svelte";

    import IconLock from "@tabler/icons-svelte/IconLock.svelte";
    import IconComet from "@tabler/icons-svelte/IconComet.svelte";
    import IconLicense from "@tabler/icons-svelte/IconLicense.svelte";
    import IconChecklist from "@tabler/icons-svelte/IconChecklist.svelte";
    import IconUsersGroup from "@tabler/icons-svelte/IconUsersGroup.svelte";
</script>

<PageNav
    pageName="about"
    homeNavPath="/about"
    homeTitle={$t("tabs.about")}
    contentPadding
    wideContent
>
    <svelte:fragment slot="navigation">
        <PageNavSection>
            <PageNavTab
                tabPath="/about/general"
                tabTitle={$t("about.page.general")}
                iconColor="blue"
            >
                <IconComet />
            </PageNavTab>
            <PageNavTab
                tabPath="/about/community"
                tabTitle={$t("about.page.community")}
                iconColor="green"
            >
                <IconUsersGroup />
            </PageNavTab>
        </PageNavSection>

        <PageNavSection>
            <PageNavTab
                tabPath="/about/terms"
                tabTitle={$t("about.page.terms")}
                iconColor="gray"
            >
                <IconChecklist />
            </PageNavTab>
            <PageNavTab
                tabPath="/about/privacy"
                tabTitle={$t("about.page.privacy")}
                iconColor="gray"
            >
                <IconLock />
            </PageNavTab>
            <PageNavTab
                tabPath="/about/credits"
                tabTitle={$t("about.page.credits")}
                iconColor="gray"
            >
                <IconLicense />
            </PageNavTab>
        </PageNavSection>
    </svelte:fragment>

    <slot slot="content"></slot>
</PageNav>
