<script lang="ts">
    import { contacts, docs } from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
    import BetaTesters from "$components/misc/BetaTesters.svelte";
</script>

<section id="imput">
<SectionHeading
    title="imput"
    sectionId="imput"
/>

O cobalt é feito com amor e cuidado pela equipe de pesquisa e desenvolvimento da [imput](https://imput.net/).

Você pode nos apoiar na [página de doação](/donate)!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

Um enorme agradecimento aos nossos "quebradores de coisas" por testarem as atualizações antecipadamente e garantirem que elas estejam estáveis.
Eles também nos ajudaram a lançar o cobalt 10!
<BetaTesters />

Todos os links são externos e levam aos seus sites pessoais ou redes sociais.
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

Meowbalt é o mascote rápido do cobalt. Ele é um gato extremamente expressivo que ama internet rápida.

Todos os desenhos incríveis do Meowbalt que você vê no cobalt foram feitos por [GlitchyPSI](https://glitchypsi.xyz/).
Ele também é o designer original do personagem.

Você não pode usar ou modificar as obras de arte do Meowbalt criadas por GlitchyPSI sem a permissão explícita dele.

Você não pode usar ou modificar o design do personagem Meowbalt comercialmente ou de qualquer forma que não seja fan art.
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

O servidor de processamento do cobalt é de código aberto e licenciado sob [AGPL-3.0]({docs.apiLicense}).

O frontend do cobalt é [source first](https://sourcefirst.com/) e licenciado sob [CC-BY-NC-SA 4.0]({docs.webLicense}).
Decidimos usar essa licença para impedir que oportunistas lucrem com o nosso trabalho
e para evitar a criação de clones maliciosos que enganam as pessoas e prejudicam nossa identidade pública.

Dependemos de muitas bibliotecas de código aberto, criamos e distribuímos as nossas próprias.
Você pode ver a lista completa de dependências no [github]({contacts.github}).
</section>