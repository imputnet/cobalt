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

A política de privacidade do cobalt é simples: não coletamos nem armazenamos nada sobre você. O que você faz é exclusivamente de sua responsabilidade, não nossa ou de mais ninguém.

Estes termos são aplicáveis apenas ao usar a instância oficial do cobalt. Em outros casos, você pode precisar entrar em contato com o host para obter informações precisas.
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

As ferramentas que usam processamento no dispositivo funcionam offline, localmente, e nunca enviam dados para nenhum lugar. Elas são explicitamente marcadas como tal quando aplicável.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

Ao usar a funcionalidade de salvamento, em alguns casos, o cobalt criptografará e armazenará temporariamente as informações necessárias para o tunelamento. Esses dados são armazenados na RAM do servidor de processamento por 90 segundos e depois são irreversivelmente excluídos. Ninguém tem acesso a eles, nem mesmo os proprietários da instância, desde que não modifiquem a imagem oficial do cobalt.

Arquivos processados/tunelados nunca são armazenados em cache. Tudo é tunelado em tempo real. A funcionalidade de salvamento do cobalt é essencialmente um serviço de proxy sofisticado.
</section>

<section id="encryption">
<SectionHeading
    title={$t("about.heading.encryption")}
    sectionId="encryption"
/>

Os dados de tunelamento armazenados temporariamente são criptografados usando o padrão AES-256. As chaves de descriptografia são incluídas apenas no link de acesso e nunca são registradas, armazenadas em cache ou guardadas em qualquer lugar. Somente o usuário final tem acesso ao link e às chaves de criptografia. As chaves são geradas de forma única para cada túnel solicitado.
</section>

{#if env.PLAUSIBLE_ENABLED}
<section id="plausible">
<SectionHeading
    title={$t("about.heading.plausible")}
    sectionId="plausible"
/>

Para garantir a privacidade, usamos [análises de tráfego anônimas da Plausible](https://plausible.io/) para obter um número aproximado de usuários ativos do cobalt. Nenhuma informação identificável sobre você ou suas solicitações é armazenada. Todos os dados são anonimizados e agregados. A instância da Plausible que usamos é hospedada e gerenciada por nós.

A Plausible não usa cookies e é totalmente compatível com GDPR, CCPA e PECR.

[Saiba mais sobre o compromisso da Plausible com a privacidade.](https://plausible.io/privacy-focused-web-analytics)

Se você deseja optar por não participar das análises anônimas, pode fazê-lo nas [configurações de privacidade](/settings/privacy#analytics).
</section>
{/if}

<section id="cloudflare">
<SectionHeading
    title={$t("about.heading.cloudflare")}
    sectionId="cloudflare"
/>

Usamos os serviços da Cloudflare para proteção contra DDoS e bots. Também usamos o Cloudflare Pages para implantar e hospedar o aplicativo web estático. Tudo isso é necessário para fornecer a melhor experiência para todos. É o provedor mais privado e confiável que conhecemos.

A Cloudflare é totalmente compatível com GDPR e HIPAA.

[Saiba mais sobre o compromisso da Cloudflare com a privacidade.](https://www.cloudflare.com/trust-hub/privacy-and-data-protection/)
</section>