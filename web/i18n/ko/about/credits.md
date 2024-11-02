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

cobalt는 [imput](https://imput.net/)의 연구 개발 팀이 사랑과 정성을 담아 만들었습니다.

[기부](/donate) 페이지에서 지원하실 수 있습니다.
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

공식 cobalt 인스턴스를 테스트하는 데 도움을 주신 테스터들에게 감사드립니다.
<BetaTesters />

모든 링크는 외부이며 개인 웹사이트 또는 소셜 미디어로 연결됩니다.
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

meowbalt는 cobalt의 빠른 마스코트입니다. 그는 빠른 인터넷을 사랑하는 매우 표현력이 풍부한 고양이입니다.

cobalt에서 볼 수 있는 모든 마스코트 그림은 [GlitchyPSI](https://glitchypsi.xyz/)가 디자인하고 제작하였습니다.

그의 명시적 허가 없이는 meowbalt의 작품을 사용하거나 수정할 수 없습니다.

meowbalt 캐릭터 디자인은 상업적 목적으로 사용하거나 판매할 수 없으며 팬아트 이외의 형태로도 사용할 수 없습니다.
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

cobalt 처리 서버는 [AGPL-3.0]({docs.apiLicense}) 라이선스로 오픈 소스입니다.

cobalt 프론트엔드는 [CC-BY-NC-SA 4.0]({docs.webLicense}) 라이선스로 [source first](https://sourcefirst.com/)입니다.
이 라이선스는 거짓 클론을 만들어 사람들을 속이고 공공 이미지를 해치는 거짓말꾼들로부터 우리 작업을 보호하기 위해 사용되었습니다.

저희는 여러 오픈 소스 라이브러리를 사용하며 자체적으로 만들고 배포합니다.
[github]({contacts.github})에서 모든 의존성을 확인할 수 있습니다.
</section>
