<script lang="ts">
    import { t, INTERNAL_locale } from "$lib/i18n/translations";
    import { onMount } from 'svelte';

    import Omnibox from "$components/save/Omnibox.svelte";
    import Meowbalt from "$components/misc/Meowbalt.svelte";
    import SupportedServices from "$components/save/SupportedServices.svelte";
    import UserGuide from "$components/misc/UseGuide.svelte";
    /*import Header from "$components/misc/Header.svelte"; // 导航栏组件
    import BlogPreview from "$components/blog/BlogPreview.svelte"; // 博客预览组件*/
    const donateLinks: Record<'en' | 'th' | 'zh' | 'ru', string> = {
        en: "https://buy.stripe.com/8wM5o6bHMeoO9oc8wz",
        th: "https://buy.stripe.com/dR6bMu5jobcC57W3ce",
        zh: "https://buy.stripe.com/5kAeYG7rwgwW43S4gh",
        ru: "https://buy.stripe.com/5kAeYG7rwgwW43S4gh",
    };
    let key: string = $INTERNAL_locale;
    const donateLink = donateLinks[key as keyof typeof donateLinks];    let showMindsou = false;
    let showYumcheck = false;
    let showNotification = true; // 控制通知显示

    // 检查本地存储中是否已关闭通知
    onMount(() => {
        const notificationClosed = localStorage.getItem('notification-xiaohongshu-youtube-closed');
        if (notificationClosed === 'true') {
            showNotification = false;
        }
    });

    // 关闭通知并保存状态到本地存储
    const closeNotification = () => {
        showNotification = false;
        localStorage.setItem('notification-xiaohongshu-youtube-closed', 'true');
    };
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
        <!-- 通知信息 -->
        {#if showNotification}
            <div class="notification" role="alert">
                <div class="notification-content">
                    <span class="notification-icon">🎉</span>
                    <span class="notification-text">最新功能=>【传输】: 你可以方便的在你的设备之间传输文件和文本。采用端到端加密技术，保护隐私性!</span>                    <button 
                        class="notification-close" 
                        aria-label="关闭通知"
                        on:click={closeNotification}
                    >
                        ×
                    </button>
                </div>
            </div>
        {/if}
        
        <Meowbalt emotion="smile" />
        <Omnibox />
        <!--<UserGuide/>-->
    </main>

    <!-- 引流推广模块 -->
    <section id="promotions">
        <!-- Mindsou Accordion -->
        <section id="mindsou">
            <button
                type="button"
                class="accordion-header"
                aria-expanded={showMindsou}
                on:click={() => showMindsou = !showMindsou}
            >
                <img src="/popularize/mindsou_logo.png"
                     alt="Mindsou Logo"
                     class="section-icon" />
                <span>基于相同想法的陌生人聊天网站,不用担心尬聊</span>
                <span class="arrow">{showMindsou ? '▲' : '▼'}</span>
            </button>
            {#if showMindsou}
                <div class="details" role="region">
                    <ul> 
                        <li>1.发布你大脑中某时刻的想法</li>
                        <li>2.完全匹配,语义匹配,互补匹配</li>
                        <li>3.点击匹配对象即可聊天</li>
                        <li>4.离线匹配邮件提醒</li>
                        <li>5.限时内容 & 隐私保护，自动销毁减少信息负担</li>
                    </ul>
                    <a class="button" href="https://mindsou.online" target="_blank" rel="noopener noreferrer">
                        访问 Mindsou
                    </a>
                </div>
            {/if}
        </section>

        <!-- YumCheck Accordion -->
        <section id="yumcheck">
            <button
                type="button"
                class="accordion-header"
                aria-expanded={showYumcheck}
                on:click={() => showYumcheck = !showYumcheck}
            >
                <img src="/popularize/yumcheck.ico"
                     alt="YumCheck Logo"
                     class="section-icon" />
                <span>食品配料表,拍照自动查询分析</span>
                <span class="arrow">{showYumcheck ? '▲' : '▼'}</span>
            </button>
            {#if showYumcheck}
                <div class="details" role="region">
                    <ul>
                        <li>拍摄配料表，一键成分分析与健康风险评估</li>
                        <li>食品添加剂对比欧盟标准，多维度了解</li>
                        <li>扫描食品标准号，快速解读规范信息</li>
                        <li>血液检测报告智能解析，普通人也能读懂血液报告</li>
                    </ul>
                    <a class="button" href="https://yumcheck.online" target="_blank" rel="noopener noreferrer">
                        访问 YumCheck
                    </a>
                </div>
            {/if}
        </section>
    </section>
</div>

<style>
    #cobalt-save-container {
        padding: var(--padding);
        /* 允许纵向滚动，移除 overflow:hidden 限制 */
        overflow-y: auto;
        overflow-x: hidden;
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

    /* 推广模块样式 */
    #promotions {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: var(--padding);
        padding: var(--padding) 0;
    }
    #promotions > section {
        display: flex;
        flex-direction: column;
        padding: var(--padding);
        background-color: var(--popup-bg);
        border-radius: var(--border-radius);
        width: 100%;
        max-width: 640px;
        box-sizing: border-box;
        gap: 12px;
        transition: all 0.3s ease;
    }

    .accordion-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: pointer;
        padding: var(--padding);
        background: var(--popup-bg);
        border-radius: var(--border-radius);
        transition: background 0.2s;
        gap: 8px;
    }
    .accordion-header:hover {
        background: var(--secondary-bg);
    }
    .arrow {
        font-size: 0.9rem;
    }
    .details {
        padding: calc(var(--padding) / 2) var(--padding);
        background: var(--popup-bg);
        border-bottom-left-radius: var(--border-radius);
        border-bottom-right-radius: var(--border-radius);
        margin-bottom: var(--padding);
        animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to   { opacity: 1; transform: translateY(0); }
    }

    /* Mindsou 与 YumCheck 模块样式覆盖（默认暗色） */
    #promotions > section#mindsou,
    #promotions > section#yumcheck {
        background-color: var(--popup-bg);
        color: var(--primary);
    }

    /* Center‑align YumCheck 标题与箭头 */
    #promotions > section#yumcheck .accordion-header {
        justify-content: center;
        text-align: center;     /* 万一有多行文字也会居中 */
    }

    /* Light 模式：使用深绿背景 + 白字 */
    @media (prefers-color-scheme: light) {
        #promotions > section#mindsou,
        #promotions > section#yumcheck {
            background-color: var(--secondary);
            color: #ffffff;
        }
        #promotions .accordion-header,
        #promotions .details {
            background: transparent;
            color: inherit;
        }
        #promotions .accordion-header:hover {
            background-color: #FFB02E;
        }
        #promotions a.button {
            background-color: #ffffff;
            color: var(--secondary);
        }
    }

    /* Dark 模式：文字白色 */
    @media (prefers-color-scheme: dark) {
        #promotions > section#mindsou,
        #promotions > section#yumcheck {
            color: #ffffff;
        }
        #promotions a.button {
            color: #ffffff;
        }
    }

    @media screen and (max-width: 535px) {
        #cobalt-save-container {
            padding-top: calc(var(--padding) / 2);
        }
    }

    /* 图标尺寸 & 间距 */
    .section-icon {
        width: 24px;
        height: 24px;
        margin: 0; /* 左右间距由 gap 控制 */
    }

    /* 确保小屏时不溢出 */
    #promotions > section .section-icon {
        max-width: 100%;
    }    /* 通知组件样式 */
    .notification {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: var(--padding);
        background-color: #e8f5e8;
        color: #2e7d32;
        border-radius: var(--border-radius);
        width: 100%;
        max-width: 640px;
        box-sizing: border-box;
        margin-bottom: var(--padding);
        animation: slideIn 0.5s ease-out;
        border: 1px solid #c8e6c9;
    }
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 10px;
    }
    .notification-icon {
        font-size: 1.5rem;
        margin-right: 10px;
    }
    .notification-text {
        flex: 1;
        font-size: 0.9rem;
    }    .notification-close {
        background: none;
        border: none;
        color: inherit;
        font-size: 1.2rem;
        cursor: pointer;
        padding: 0;
        margin-left: 10px;
        transition: opacity 0.2s;
    }
    .notification-close:hover {
        opacity: 0.7;
    }

    /* 深色模式下的通知样式 */
    @media (prefers-color-scheme: dark) {
        .notification {
            background-color: #1b3e1f;
            color: #81c784;
            border-color: #2e7d32;
        }
    }

    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
</style>
