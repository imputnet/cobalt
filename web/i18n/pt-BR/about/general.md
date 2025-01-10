<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { partners, contacts, docs } from "$lib/env";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="summary">
<SectionHeading
    title={$t("about.heading.summary")}
    sectionId="summary"
/>

O cobalt ajuda você a salvar qualquer coisa dos seus sites favoritos: vídeo, áudio, fotos ou gifs. basta colar o link e você está pronto para começar!

sem anúncios, rastreadores, paywall ou outras bobagens. apenas um aplicativo web conveniente que funciona em qualquer lugar, sempre que você precisar.
</section>

<section id="motivation">
<SectionHeading
    title={$t("about.heading.motivation")}
    sectionId="motivation"
/>

O cobalt foi criado para benefício público, para proteger as pessoas de anúncios e malware enviados por suas alternativas.
acreditamos que o melhor software é seguro, aberto e acessível.

é possível manter as principais instâncias funcionando graças ao nosso parceiro de infraestrutura de longa data, [royalehosting.net]({partners.royalehosting})!
</section>

<section id="privacy">
<SectionHeading
    title={$t("about.heading.privacy")}
    sectionId="privacy"
/>

todas as solicitações ao backend são anônimas e todas as informações sobre túneis são criptografadas.
temos uma política rigorosa de zero logs e não rastreamos *nada* sobre indivíduos.

quando uma solicitação precisa de processamento adicional, o cobalt processa os arquivos em tempo real.
isso é feito através do tunelamento das partes processadas diretamente para o cliente, sem nunca salvar nada no disco.
por exemplo, este método é usado quando o serviço de origem fornece canais de vídeo e áudio como arquivos separados.

além disso, você pode [ativar o tunelamento forçado](/settings/privacy#tunnel) para proteger sua privacidade.
quando ativado, o cobalt tunelará todos os arquivos baixados.
ninguém saberá de onde você baixa algo, nem mesmo seu provedor de rede.
tudo o que eles verão é que você está usando uma instância do cobalt.
</section>

<section id="community">
<SectionHeading
    title={$t("about.heading.community")}
    sectionId="community"
/>

o cobalt é usado por inúmeros artistas, educadores e criadores de conteúdo para fazer o que amam.
estamos sempre em contato com nossa comunidade e trabalhamos juntos para tornar o cobalt ainda mais útil.
sinta-se à vontade para [participar da conversa](/about/community)!

acreditamos que o futuro da internet é aberto, por isso o cobalt é
[source first](https://sourcefirst.com/) e [facilmente auto-hospedável]({docs.instanceHosting}).

se seu amigo hospeda uma instância de processamento, basta pedir o domínio e [adicioná-lo nas configurações de instância](/settings/instances#community).

você pode verificar o código-fonte e contribuir [no github]({contacts.github}) a qualquer momento.
aceitamos todas as contribuições e sugestões!
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

os recursos mais recentes, como [remuxing](/remux), funcionam localmente no seu dispositivo.
o processamento no dispositivo é eficiente e nunca envia nada pela internet.
isso se alinha perfeitamente com nosso objetivo futuro de mover o máximo possível de processamento para o cliente.
</section>
