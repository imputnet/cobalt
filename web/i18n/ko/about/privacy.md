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

cobalt의 개인정보 처리 정책은 간단합니다: 저희는 귀하의 어떤 것도 추적하거나 저장하지 않습니다.

이하 약관은 공식 cobalt 인스턴스를 사용할 때만 적용됩니다. 이외에는 인스턴스 운영자에게 연락해 정확한 정보를 확인해주세요.
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

기기 내 처리를 사용하는 도구는 오프라인으로 작동하며 어디로도 데이터를 보내지 않습니다. 이에 해당되는 경우 항상 표시됩니다.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

저장 기능을 사용할 때, 일부 경우 cobalt는 터널링에 필요한 정보를 암호화하고 임시로 저장합니다. 이는 처리 서버의 RAM에 90초 동안 저장되며 그 후 영구적으로 삭제됩니다. 공식 cobalt 이미지를 수정하지 않는 한 인스턴스 소유자도 접근할 수 없습니다.

처리/터널링된 파일은 어디에도 캐시되지 않습니다. 모든 것은 실시간으로 터널링됩니다. cobalt의 저장 기능은 별도의 프록시 서비스입니다.
</section>

<section id="encryption">
<SectionHeading
    title={$t("about.heading.encryption")}
    sectionId="encryption"
/>

임시 저장된 터널 데이터는 AES-256을 사용해 암호화됩니다. 복호화 키는 접근 링크에만 포함되며 어디에도 저장되지 않습니다. 최종 사용자만 링크 및 복호화 키에 접근할 수 있습니다. 각 요청에 대해 고유하게 생성됩니다.
</section>

{#if env.PLAUSIBLE_ENABLED}
<section id="plausible">
<SectionHeading
    title={$t("about.heading.plausible")}
    sectionId="plausible"
/>

개인정보 보호를 위해 [plausible의 익명 트래픽 분석](https://plausible.io/)을 사용해 활동 중인 cobalt 사용자 수를 분석합니다. 귀하 또는 귀하의 요청에 대한 식별 가능한 정보는 절대 저장되지 않습니다. 모든 데이터는 익명화되고 집계됩니다. 사용하는 plausible 인스턴스는 저희에 의해 호스팅 및 관리됩니다.

plausible는 쿠키를 사용하지 않으며 GDPR, CCPA 및 PECR와 완전히 호환됩니다.

[plausible의 개인정보 보호에 대해 더 알아보세요.](https://plausible.io/privacy-focused-web-analytics)

익명 분석을 거부하고 싶다면 <a href="/settings/privacy#analytics">개인정보 설정</a>에서 설정할 수 있습니다.
</section>
{/if}

<section id="cloudflare">
<SectionHeading
    title={$t("about.heading.cloudflare")}
    sectionId="cloudflare"
/>

DDoS 및 봇 보호를 위해 cloudflare 서비스를 사용합니다. 또한 정적 웹 앱을 배포 및 호스팅하기 위해 cloudflare pages를 사용합니다. 이들은 모두 모두 최고의 경험을 제공하기 위해 필요합니다. 이는 저희가 알고 있는 가장 개인정보 보호 및 신뢰할 수 있는 공급자입니다.

cloudflare는 GDPR 및 HIPAA와 완전히 호환됩니다.

[cloudflare의 개인정보 보호에 대해 더 알아보세요.](https://www.cloudflare.com/trust-hub/privacy-and-data-protection/)
</section>
