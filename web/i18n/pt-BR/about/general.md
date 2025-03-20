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

O cobalt ajuda você a salvar qualquer coisa dos seus sites favoritos: vídeos, áudios, fotos ou gifs. Basta colar o link e você está pronto para começar!

Sem anúncios, rastreadores, paywalls ou outras bobagens. Apenas um aplicativo web conveniente que funciona em qualquer lugar, sempre que você precisar.
</section>

<section id="motivation">
<SectionHeading
    title={$t("about.heading.motivation")}
    sectionId="motivation"
/>

O cobalt foi criado para o benefício público, para proteger as pessoas de anúncios e malware propagados por suas alternativas.
Acreditamos que o melhor software é seguro, aberto e acessível.

Parte da nossa infraestrutura é fornecida pelo nosso parceiro de longa data, [royalehosting.net]({partners.royalehosting})!
</section>

<section id="privacy">
<SectionHeading
    title={$t("about.heading.privacy")}
    sectionId="privacy"
/>

Todas as solicitações ao backend são anônimas, e todas as informações sobre os túneis são criptografadas.
Temos uma política estrita de zero logs e não rastreamos *nada* sobre indivíduos.

Quando uma solicitação precisa de processamento adicional, o cobalt processa os arquivos em tempo real.
Isso é feito tunelando as partes processadas diretamente para o cliente, sem nunca salvar nada no disco.
Por exemplo, esse método é usado quando o serviço de origem fornece vídeo e áudio como arquivos separados.

Além disso, você pode [ativar o tunelamento forçado](/settings/privacy#tunnel) para proteger sua privacidade.
Quando ativado, o cobalt tunelará todos os arquivos baixados.
Ninguém saberá de onde você está baixando algo, nem mesmo seu provedor de internet.
Tudo o que eles verão é que você está usando uma instância do cobalt.
</section>

<section id="community">
<SectionHeading
    title={$t("about.heading.community")}
    sectionId="community"
/>

O cobalt é usado por inúmeros artistas, educadores e criadores de conteúdo para fazer o que amam.
Estamos sempre em contato com nossa comunidade e trabalhamos juntos para tornar o cobalt ainda mais útil.
Sinta-se à vontade para [participar da conversa](/about/community)!

Acreditamos que o futuro da internet é aberto, e é por isso que o cobalt é
[source first](https://sourcefirst.com/) e [facilmente auto-hospedável]({docs.instanceHosting}).

Se um amigo seu hospedar uma instância de processamento, basta pedir o domínio e [adicioná-lo nas configurações de instância](/settings/instances#community).

Você pode verificar o código-fonte e contribuir [no GitHub]({contacts.github}) a qualquer momento.
Aceitamos todas as contribuições e sugestões!
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

Os recursos mais recentes, como [remuxing](/remux), funcionam localmente no seu dispositivo.
O processamento no dispositivo é eficiente e nunca envia nada pela internet.
Isso se alinha perfeitamente com nosso objetivo futuro de mover o máximo de processamento possível para o cliente.
</section>