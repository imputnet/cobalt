<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { partners, contacts, docs } from "$lib/env";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="summary">
<SectionHeading
    title={$t("about.heading.summary")}
    sectionId="summary"
/>

cobalt helps you save anything from your favorite websites: video, audio, photos
or gifs. just paste the link and you're ready to rock!

没有广告、跟踪器、付费墙或其他废话。只是一个方便的 Web 应用程序，可以随时随地运行。
</section>

<section id="motivation">
<SectionHeading
    title={$t("about.heading.motivation")}
    sectionId="motivation"
/>

cobalt 是为了公众利益而创建的，旨在保护人们免受其替代品推送的广告和恶意软件的侵害。我们相信最好的软件是安全、开放和可访问的。

得益于我们长期的基础设施合作伙伴 [royalehosting.net]({partners.royalehosting})，我们可以保持主要实例正常运行！
</section>

<section id="privacy">
<SectionHeading
    title={$t("about.heading.privacy")}
    sectionId="privacy"
/>

对后端的所有请求都是匿名的，并且有关隧道的所有信息都是加密的。我们有严格的零日志政策，不会追踪有关个人的*任何*信息。

when a request needs additional processing, cobalt processes files on-the-fly.
it's done by tunneling processed parts directly to the client, without ever
saving anything to disk. for example, this method is used when the source
service provides video and audio channels as separate files.

additionally, you can [enable forced tunneling](/settings/privacy#tunnel) to
protect your privacy. when enabled, cobalt will tunnel all downloaded files. no
one will know where you download something from, even your network provider. all
they'll see is that you're using a cobalt instance.
</section>

<section id="community">
<SectionHeading
    title={$t("about.heading.community")}
    sectionId="community"
/>

无数艺术家、教育工作者和内容创作者使用 cobalt 来做他们喜欢的事情。我们始终与社区保持联系，共同努力使 cobalt
变得更加有用。欢迎随时[加入对话](/about/community)！

我们相信互联网的未来是开放的，这就是为什么 Cobalt 是 [源代码优先](https://sourcefirst.com/)并且
[易于自托管]({docs.instanceHosting})的原因。

如果您的朋友托管一个处理实例，只需向他们索取一个域名并 [将其添加到实例设置中](/settings/instances#community)。

您可以随时检查源代码并 [在 github]({contacts.github}) 做出贡献。我们欢迎所有贡献和建议！
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

最新功能（例如
[remuxing](/remux)）可在您的设备上本地运行。设备上的处理非常高效，并且不会通过互联网发送任何内容。它完全符合我们未来将尽可能多的处理转移到客户端的目标。
</section>
