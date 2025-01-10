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

o cobalt é feito com amor e carinho pela equipe de pesquisa e desenvolvimento da [imput](https://imput.net/).

você pode nos apoiar na [página de doação](/donate)!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

um enorme agradecimento aos nossos testadores por testarem as atualizações antecipadamente e garantirem que sejam estáveis.
eles também nos ajudaram a lançar o cobalt 10!
<BetaTesters />

todos os links são externos e levam aos seus sites pessoais ou redes sociais.
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

meowbalt é o mascote veloz do cobalt. ele é um gato extremamente expressivo que adora internet rápida.

todos os incríveis desenhos do meowbalt que você vê no cobalt foram feitos por [GlitchyPSI](https://glitchypsi.xyz/).
ele também é o designer original do personagem.

você não pode usar ou modificar as artes do meowbalt feitas pelo GlitchyPSI sem sua permissão explícita.

você não pode usar ou modificar o design do personagem meowbalt comercialmente ou de qualquer forma que não seja fan art.
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

o servidor de processamento do cobalt é de código aberto e licenciado sob [AGPL-3.0]({docs.apiLicense}).

o frontend do cobalt é [source first](https://sourcefirst.com/) e licenciado sob [CC-BY-NC-SA 4.0]({docs.webLicense}).
decidimos usar esta licença para impedir que oportunistas lucrem com nosso trabalho
e criem clones maliciosos que enganem pessoas e prejudiquem nossa identidade pública.

dependemos de muitas bibliotecas de código aberto, criamos e distribuímos as nossas próprias.
você pode ver a lista completa de dependências no [github]({contacts.github}).
</section>
