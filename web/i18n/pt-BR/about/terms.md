<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

Estes termos são aplicáveis apenas ao usar a instância oficial do cobalt.
Em outros casos, você pode precisar entrar em contato com o host para obter informações precisas.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

A funcionalidade de salvamento simplifica o download de conteúdo da internet e não assume nenhuma responsabilidade pelo uso do conteúdo salvo.
Os servidores de processamento funcionam como proxies avançados e nunca gravam nenhum conteúdo em disco.
Tudo é processado na RAM e permanentemente excluído assim que o túnel é concluído.
Não temos logs de download e não podemos identificar ninguém.

[Você pode ler mais sobre como os túneis funcionam em nossa política de privacidade.](/about/privacy)
</section>

<section id="responsibility">
<SectionHeading
    title={$t("about.heading.responsibility")}
    sectionId="responsibility"
/>

Você (usuário final) é responsável pelo que faz com nossas ferramentas, como usa e distribui o conteúdo resultante.
Por favor, seja consciente ao usar o conteúdo de outras pessoas e sempre dê crédito aos criadores originais.
Certifique-se de não violar nenhum termo ou licença.

Quando usado para fins educacionais, sempre cite as fontes e dê crédito aos criadores originais.

O uso justo e os créditos beneficiam a todos.
</section>

<section id="abuse">
<SectionHeading
    title={$t("about.heading.abuse")}
    sectionId="abuse"
/>

Não temos como detectar automaticamente comportamentos abusivos, pois o cobalt é 100% anônimo.
No entanto, você pode relatar tais atividades para nós por e-mail, e faremos o possível para agir manualmente: abuse[at]imput.net

**Este e-mail não é destinado ao suporte ao usuário; você não receberá uma resposta se sua solicitação não estiver relacionada a abusos.**

Se você estiver enfrentando problemas, entre em contato conosco por qualquer método preferido na [página de suporte](/about/community).
</section>