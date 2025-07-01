<script lang="ts">
    import { contacts, docs, partners } from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
    import BetaTesters from "$components/misc/BetaTesters.svelte";
</script>

<section id="imput">
<SectionHeading
    title="imput"
    sectionId="imput"
/>

кобальт сделан с любовью и заботой руками [imput](https://imput.net/) ❤️

мы маленькая команда из двух человек, но мы очень усердно работаем, чтобы делать
классный софт, который приносит пользу всем. если тебе нравится то, что мы
делаем, поддержи нас на [странице донатов](/donate)!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

огромное спасибо нашим тестерам за то, что они тестировали обновления заранее и
следили за их стабильностью. они ещё помогли нам выпустить cobalt 10!
<BetaTesters />

все ссылки внешние и ведут на их личные сайты или соцсети.
</section>

<section id="partners">
<SectionHeading
    title={$t("about.heading.partners")}
    sectionId="partners"
/>

часть инфраструктуры кобальта предоставлена нашим давним партнёром,
[royalehosting.net]({partners.royalehosting})!
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

мяубальт — это шустрый маскот кобальта, очень выразительный кот, который любит
быстрый интернет.

весь потрясающий арт мяубальта, который ты видишь в кобальте, был сделан
[GlitchyPSI](https://glitchypsi.xyz/). он ещё и оригинальный создатель этого
персонажа.

imput владеет юридическими правами на дизайн персонажа мяубальта, но не на
конкретные арты, которые были созданы GlitchyPSI.

мы любим мяубальта, поэтому мы вынуждены установить пару правил, чтобы его
защитить:
- ты не можешь использовать дизайн персонажа мяубальта ни в какой форме, кроме
  фанарта.
- ты не можешь использовать дизайн или арты мяубальта в коммерческих целях.
- ты не можешь использовать дизайн или арты мяубальта в своих проектах.
- ты не можешь использовать или изменять работы GlitchyPSI с мяубальтом ни в
  каком виде.

если ты нарисуешь фанарт мяубальта, не стесняйся делиться им в [нашем
дискорд-сервере](/about/community), мы с нетерпением ждём!
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

код api (сервера обработки) кобальта — open source и распространяется по
лицензии [AGPL-3.0]({docs.apiLicense}).

код фронтенда кобальта — [source first](https://sourcefirst.com/) и
распространяется по лицензии [CC-BY-NC-SA 4.0]({docs.webLicense}).

нам пришлось сделать фронтенд source first, чтобы грифтеры не наживались на
нашем труде и не создавали вредоносные клоны для обмана людей и порче нашей
репутации. кроме коммерческого использования, у этого типа лицензии те же
принципы, что и у многих open source лицензий.

мы используем много опенсорсных библиотек, но также создаём и распространяем
свои собственные. полный список зависимостей можно посмотреть на
[github]({contacts.github})!
</section>
