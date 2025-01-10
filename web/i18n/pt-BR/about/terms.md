<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

estes termos são aplicáveis apenas ao usar a instância oficial do cobalt.
em outros casos, você pode precisar contatar o operador da instância para obter informações precisas.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

a funcionalidade de salvamento simplifica o download de conteúdo da internet e não assume nenhuma responsabilidade sobre como o conteúdo salvo é utilizado.
os servidores de processamento funcionam como proxies avançados e nunca gravam nenhum conteúdo no disco.
tudo é manipulado na RAM e permanentemente eliminado assim que o túnel é finalizado.
não mantemos registros de downloads e não podemos identificar ninguém.

[você pode ler mais sobre como os túneis funcionam em nossa política de privacidade.](/about/privacy)
</section>

<section id="responsibility">
<SectionHeading
    title={$t("about.heading.responsibility")}
    sectionId="responsibility"
/>

você (usuário final) é responsável pelo que faz com nossas ferramentas, como usa e distribui o conteúdo resultante.
por favor, seja consciente ao usar conteúdo de outros e sempre dê crédito aos criadores originais.
certifique-se de não violar nenhum termo ou licença.

quando usado para fins educacionais, sempre cite as fontes e dê crédito aos criadores originais.

uso justo e créditos beneficiam a todos.
</section>

<section id="abuse">
<SectionHeading
    title={$t("about.heading.abuse")}
    sectionId="abuse"
/>

não temos como detectar comportamento abusivo automaticamente porque o cobalt é 100% anônimo.
no entanto, você pode nos reportar tais atividades via email e faremos o possível para resolver manualmente: abuse[at]imput.net

**este email não é destinado ao suporte ao usuário, você não receberá resposta se sua questão não estiver relacionada a abuso.**

se você está tendo problemas, entre em contato conosco através de qualquer método preferido na [página de suporte](/about/community).
</section>

