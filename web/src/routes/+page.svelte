<script>
    import { t } from "$lib/i18n/translations";

    import Omnibox from "$components/save/Omnibox.svelte";
    import Meowbalt from "$components/misc/Meowbalt.svelte";
    import SupportedServices from "$components/save/SupportedServices.svelte";
    import UserGuide from "$components/misc/UseGuide.svelte"
    /*import Header from "$components/misc/Header.svelte"; // 导航栏组件
    import BlogPreview from "$components/blog/BlogPreview.svelte"; // 博客预览组件*/
</script>

<svelte:head>
    <title>{$t("general.cobalt")}</title>
    <meta property="og:title" content={$t("general.cobalt")} />
</svelte:head>

<!--<Header />-->

<div id="cobalt-save-container" class="center-column-container">
    <SupportedServices />
    <main
        id="cobalt-save"
        tabindex="-1"
        data-first-focus
        data-focus-ring-hidden
    >
        <Meowbalt emotion="smile" />
        <Omnibox />
        <!--<UserGuide/>-->
    </main>
    <!-- 添加教程和博客文章部分 -->
    <section id="tutorials">
        <h2>如何使用我们的下载工具</h2>
        <p>使用我们的在线下载工具可以快速下载你喜欢的视频和音频文件。以下是一些常见的使用场景：</p>
        <ul>
            <li><a href="/guide#youtube">如何下载 YouTube 视频？</a></li>
            <li><a href="/guide#facebook">如何从 Facebook 保存视频？</a></li>
            <li><a href="/guide#formats">支持的平台和格式有哪些？</a></li>
        </ul>
        <a href="/guide" class="button">查看完整教程</a>
    </section>

    <section id="blog">
        <h2>最新博客文章</h2>

    </section>
    <!--<div id="terms-note">
        {$t("save.terms.note.agreement")}
        <a href="/about/terms">{$t("save.terms.note.link")}</a>
    </div>-->
</div>

<style>
    #cobalt-save-container {
        padding: var(--padding);
        overflow: hidden;
    }

    #cobalt-save {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        gap: 15px;
    }

    #tutorials, #blog {
        padding: var(--padding);
        background-color: var(--popup-bg);
        border-radius: var(--border-radius);
        margin-bottom: var(--padding);
        width: 100%;
    }

    h2 {
        color: var(--blue);
    }

    ul {
        list-style: disc;
        padding-left: var(--padding);
    }

    a {
        text-decoration: none;
        color: var(--blue);
    }

    .button {
        display: inline-block;
        padding: 10px 20px;
        background-color: var(--secondary);
        color: var(--primary);
        border-radius: var(--border-radius);
        text-align: center;
    }

    #terms-note {
        bottom: 0;
        color: var(--gray);
        font-size: 13px;
        text-align: center;
        padding-bottom: var(--padding);
        font-weight: 500;
    }

    @media screen and (max-width: 535px) {
        #cobalt-save-container {
            padding-top: calc(var(--padding) / 2);
        }

        #terms-note {
            font-size: 11px;
            padding-bottom: 0;
        }
    }
</style>
