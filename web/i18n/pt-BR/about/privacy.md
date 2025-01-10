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

a política de privacidade do cobalt é simples: não coletamos ou armazenamos nada sobre você. O que você faz é apenas da sua conta, não nossa ou de qualquer outra pessoa.

estes termos são aplicáveis apenas ao usar a instância oficial do cobalt. Em outros casos, você pode precisar contatar o host para informações precisas.
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

ferramentas que usam processamento no dispositivo funcionam offline, localmente, e nunca enviam dados para lugar algum. Elas são explicitamente marcadas como tal sempre que aplicável.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

ao usar a funcionalidade de salvamento, em alguns casos o cobalt irá criptografar e armazenar temporariamente informações necessárias para o tunelamento. Elas são armazenadas na RAM do servidor de processamento por 90 segundos e depois eliminadas irreversivelmente. Ninguém tem acesso a elas, nem mesmo os proprietários da instância, desde que não modifiquem a imagem oficial do cobalt.

arquivos processados/tunelados nunca são armazenados em cache em lugar algum. Tudo é tunelado ao vivo. A funcionalidade de salvamento do cobalt é essencialmente um serviço de proxy sofisticado.
</section>

<section id="encryption">
<SectionHeading
    title={$t("about.heading.encryption")}
    sectionId="encryption"
/>

os dados do túnel armazenados temporariamente são criptografados usando o padrão AES-256. As chaves de descriptografia são incluídas apenas no link de acesso e nunca são registradas/armazenadas em cache/armazenadas em qualquer lugar. Apenas o usuário final tem acesso ao link e às chaves de criptografia. As chaves são geradas exclusivamente para cada túnel solicitado.
</section>

{#if env.PLAUSIBLE_ENABLED}
<section id="plausible">
<SectionHeading
    title={$t("about.heading.plausible")}
    sectionId="plausible"
/>

por questões de privacidade, usamos [análise anônima de tráfego do Plausible](https://plausible.io/) para obter um número aproximado de usuários ativos do cobalt. Nenhuma informação identificável sobre você ou suas solicitações é armazenada. Todos os dados são anonimizados e agregados. A instância do Plausible que usamos é hospedada e gerenciada por nós.

o Plausible não usa cookies e está totalmente em conformidade com GDPR, CCPA e PECR.

[Saiba mais sobre o compromisso do Plausible com a privacidade.](https://plausible.io/privacy-focused-web-analytics)

se você deseja desativar as análises anônimas, pode fazer isso nas [configurações de privacidade](/settings/privacy#analytics).
</section>
{/if}

<section id="cloudflare">
<SectionHeading
    title={$t("about.heading.cloudflare")}
    sectionId="cloudflare"
/>

usamos os serviços da Cloudflare para proteção contra DDoS e bots. Também usamos o Cloudflare Pages para implantar e hospedar o aplicativo web estático. Todos esses são necessários para fornecer a melhor experiência para todos. É o provedor mais privado e confiável que conhecemos.

a Cloudflare está totalmente em conformidade com GDPR e HIPAA.

[Saiba mais sobre o compromisso da Cloudflare com a privacidade.](https://www.cloudflare.com/trust-hub/privacy-and-data-protection/)
</section>

