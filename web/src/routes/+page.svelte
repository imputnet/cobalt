<script lang="ts">
    import { t,INTERNAL_locale } from "$lib/i18n/translations";

    import Omnibox from "$components/save/Omnibox.svelte";
    import Meowbalt from "$components/misc/Meowbalt.svelte";
    import SupportedServices from "$components/save/SupportedServices.svelte";
    import UserGuide from "$components/misc/UseGuide.svelte"
    /*import Header from "$components/misc/Header.svelte"; // 导航栏组件
    import BlogPreview from "$components/blog/BlogPreview.svelte"; // 博客预览组件*/
    const donateLinks: Record<'en' | 'th' | 'zh' | 'ru', string> = {
        en: "https://buy.stripe.com/8wM5o6bHMeoO9oc8wz",
        th: "https://buy.stripe.com/dR6bMu5jobcC57W3ce",
        zh: "https://buy.stripe.com/5kAeYG7rwgwW43S4gh",
        ru: "https://buy.stripe.com/5kAeYG7rwgwW43S4gh",
    };
    let key: string = $INTERNAL_locale;
    const donateLink = donateLinks[key as keyof typeof donateLinks];

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
    <!--<section id="tutorials">
        <h2>如何使用我们的下载工具</h2>
        <p>使用我们的在线下载工具可以快速下载你喜欢的视频和音频文件。以下是一些常见的使用场景：</p>
        <ul>
            <li><a href="/guide#youtube">如何下载 YouTube 视频？</a></li>
            <li><a href="/guide#facebook">如何从 Facebook 保存视频？</a></li>
            <li><a href="/guide#formats">支持的平台和格式有哪些？</a></li>
        </ul>
        <a href="/guide">查看完整教程</a>

    </section>-->

    <section id="donate">
        <a href={donateLink} class="button">{$t("donate.banner.title")}</a>
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

    #tutorials, #donate {
        display: flex;
        flex-direction: column;
        padding: var(--padding);
        background-color: var(--popup-bg);
        border-radius: var(--border-radius);
        margin-bottom: var(--padding);
        width: 100%;
        max-width: 640px; /* 限制最大宽度，类似 Omnibox */
        box-sizing: border-box;
        gap: 15px; /* 增加内容之间的间距 */
        transition: all 0.3s ease; /* 添加平滑过渡效果 */
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

    /* 响应式设计：中等屏幕 */
    @media screen and (max-width: 768px) {
        #tutorials, #donate {
            padding: calc(var(--padding) / 1.5);
            gap: 10px;
        }

        h2 {
            font-size: 1.1rem;
        }

        p {
            font-size: 0.95rem;
        }
    }

    /* 响应式设计：小屏幕 */
    @media screen and (max-width: 440px) {
        #tutorials, #donate {
            width: 100%; /* 占满屏幕宽度 */
            padding: calc(var(--padding) / 2);
            gap: 8px;
        }

        h2 {
            font-size: 1rem;
        }

        p {
            font-size: 0.9rem;
        }

        .button {
            width: 100%; /* 按钮在小屏幕占满宽度 */
            text-align: center;
        }
    }


    @media screen and (max-width: 535px) {
        #cobalt-save-container {
            padding-top: calc(var(--padding) / 2);
        }


    }
</style>
