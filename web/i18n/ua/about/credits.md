<script lang="ts">
    import { contacts, docs } from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
    import BetaTesters from "$components/misc/BetaTesters.svelte";
</script>

<section id="imput">
<SectionHeading
    title="введення"
    sectionId="imput"
/>

cobalt створено з любов’ю та турботою командою досліджень і розробок [imput](https://imput.net/).

ви можете підтримати нас на [сторінці донату](/donate)!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

величезне спасибі нашим бета-тестерам за тестування оновлень заздалегідь та за забезпечення їх стабільності.
вони також допомогли нам випустити cobalt 10!
<BetaTesters />

всі посилання є зовнішніми та ведуть на їхні особисті веб-сайти або соціальні мережі.
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

meowbalt — швидкий маскот cobalt. це надзвичайно виразний кіт, який любить швидкий інтернет.

всі чудові малюнки meowbalt, які ви бачите в cobalt, були створені [GlitchyPSI](https://glitchypsi.xyz/).
він також є оригінальним дизайнером персонажа.

ви не можете використовувати чи змінювати твори GlitchyPSI з meowbalt без його явного дозволу.

ви не можете використовувати чи змінювати дизайн персонажа meowbalt в комерційних цілях або в будь-якій формі, що не є фан-артом.
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

сервер обробки cobalt є з відкритим кодом і ліцензований під [AGPL-3.0]({docs.apiLicense}).

фронтенд cobalt є [source first](https://sourcefirst.com/) і ліцензований під [CC-BY-NC-SA 4.0]({docs.webLicense}).
ми вирішили використовувати цю ліцензію, щоб запобігти шахраям заробляти на нашій праці
та створювати злісні клони, які обманюють людей і шкодять нашій громадській ідентичності.

ми покладаємося на багато бібліотек з відкритим кодом, створюємо та розподіляємо свої власні.
ви можете побачити повний список залежностей на [github]({contacts.github}).
</section>
