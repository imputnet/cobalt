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

O cobalt é feito com amor e cuidado pela equipe de pesquisa e desenvolvimento da
[imput](https://imput.net/).

você pode nos apoiar na [página de doações](/donate)!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

Um grande agradecimento aos nossos “quebradores de coisas” por testarem as
atualizações com antecedência e se certificarem de que estão estáveis. Eles
também nos ajudaram a lançar o cobalt 10! <BetaTesters />

todos os links são externos e levam a seus sites pessoais ou redes sociais.
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

meowbalt é o mascote do cobalt. ele é um gato muito expressivo que adora
internet rápida.

todos os incríveis desenhos do meowbalt foram feitos por
[GlitchyPSI](https://glitchypsi.xyz/). ele é o criador original do personagem.

você não pode usar ou modificar a arte de GlitchyPSI sem sua permissão.

você não pode usar comercialmente ou modificar o meowbalt de nenhuma forma que
não seja fan art.
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

o servidor de processamento do cobalt é de código aberto e licenciado sobre
[AGPL-3.0]({docs.apiLicense}).

a página do cobalt é [source first](https://sourcefirst.com/) e licenciado sobre
[CC-BY-NC-SA 4.0]({docs.webLicense}). decidimos usar essa licença para evitar
que pessoas ruins lucrem em cima de nosso trabalho e criem clones maliciosos que
enganem as pessoas e machuque nossa identidade pública.

dependemos de muitas bibliotecas de código aberto, além de criar e distribuir as
nossas próprias. você pode ver a lista completa de dependências no
[github]({contacts.github}).
</section>
