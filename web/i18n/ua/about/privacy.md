<script lang="ts">
    import env from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

політика конфіденційності cobalt проста: ми не збираємо і не зберігаємо нічого про вас. те, що ви робите, є винятково вашою справою, а не нашою чи когось іншого.

ці умови застосовуються тільки при використанні офіційної інстанції cobalt. в інших випадках вам, можливо, доведеться зв’язатися з хостером для отримання точної інформації.
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

інструменти, які використовують обробку на пристрої, працюють офлайн, локально і ніколи не надсилають жодних даних кудись. вони чітко позначені як такі, коли це застосовно.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

при використанні функціональності збереження в деяких випадках cobalt зашифрує та тимчасово зберігає інформацію, необхідну для тунелювання. вона зберігається в оперативній пам’яті сервера обробки протягом 90 секунд і безповоротно знищується після цього. ніхто не має доступу до неї, навіть власники інстанцій, якщо вони не модифікують офіційний образ cobalt.

оброблені/тунельовані файли ніколи не кешуються. все тунелюється в реальному часі. функціональність збереження cobalt по суті є розширеною проксі-службою.
</section>

<section id="encryption">
<SectionHeading
    title={$t("about.heading.encryption")}
    sectionId="encryption"
/>

тимчасово збережені дані тунелю зашифровані з використанням стандарту AES-256. ключі для розшифрування включаються лише у посилання доступу і ніколи не ведуться/не кешуються/не зберігаються. лише кінцевий користувач має доступ до посилання та ключів шифрування. ключі генеруються унікально для кожного запитуваного тунелю.
</section>

{#if env.PLAUSIBLE_ENABLED}
<section id="plausible">
<SectionHeading
    title={$t("about.heading.plausible")}
    sectionId="plausible"
/>

з метою конфіденційності ми використовуємо [анонімну аналітику трафіку plausible](https://plausible.io/), щоб отримати приблизну кількість активних користувачів cobalt. жодна ідентифікаційна інформація про вас або ваші запити ніколи не зберігається. всі дані анонімізовані та агрегіровані. інстанція plausible, яку ми використовуємо, хоститься і керується нами.

plausible не використовує файли cookie і повністю відповідає вимогам GDPR, CCPA та PECR.

[дізнайтеся більше про відданість plausible конфіденційності.](https://plausible.io/privacy-focused-web-analytics)

якщо ви бажаєте відмовитися від анонімної аналітики, ви можете зробити це в <a href="/settings/privacy#analytics">налаштуваннях конфіденційності</a>.
</section>
{/if}

<section id="cloudflare">
<SectionHeading
    title={$t("about.heading.cloudflare")}
    sectionId="cloudflare"
/>

ми використовуємо сервіси cloudflare для захисту від ddos-атак та ботів. ми також використовуємо cloudflare pages для розгортання та хостингу статичного веб-додатка. все це необхідно для забезпечення найкращого досвіду для всіх. це найбільш приватний і надійний постачальник, якого ми знаємо.

cloudflare повністю відповідає вимогам GDPR та HIPAA.

[дізнайтеся більше про відданість cloudflare конфіденційності.](https://www.cloudflare.com/trust-hub/privacy-and-data-protection/)
</section>
