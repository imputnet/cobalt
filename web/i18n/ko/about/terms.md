<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

이하 약관은 공식 cobalt 인스턴스를 사용할 때만 적용됩니다. 이외에는 인스턴스 운영자에게 연락해 정확한 정보를 확인해주세요.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

저장 기능은 인터넷에서 콘텐츠를 다운로드하는 과정을 단순화하며, 저장된 콘텐츠의 사용 목적에 대해서는 어떠한 책임도 지지 않습니다.
처리 서버는 고급 프록시처럼 작동하며 디스크에 어떠한 콘텐츠도 기록하지 않습니다.
모든 처리는 RAM에서 이루어지며 터널이 종료되면 영구적으로 삭제됩니다.
다운로드 기록을 보관하지 않으며 사용자를 식별할 수 없습니다.

[터널 작동 방식에 대해 더 알아보세요.](/about/privacy)
</section>

<section id="responsibility">
<SectionHeading
    title={$t("about.heading.responsibility")}
    sectionId="responsibility"
/>

귀하(최종 사용자)는 우리의 도구를 어떻게 사용하고, 결과물을 어떻게 사용하고 배포하는지에 대한 책임이 있습니다.
다른 사람의 콘텐츠를 사용할 때는 신중을 기하고 원작자의 공로를 항상 인정해주세요.
모든 약관과 라이선스를 위반하지 않도록 주의하세요.

교육 목적으로 사용할 때는 항상 출처를 인용하고 원작자의 공로를 인정해주세요.

공정한 사용과 저작권 표시는 모두에게 이롭습니다.
</section>

<section id="abuse">
<SectionHeading
    title={$t("about.heading.abuse")}
    sectionId="abuse"
/>

cobalt는 100% 익명이기 때문에 악용 행위를 자동으로 감지할 방법이 없습니다.
하지만 이러한 활동을 신고해주시면 수동으로 최선을 다해 대응하겠습니다: **safety@imput.net**

**이 이메일은 사용자 지원을 위한 것이 아니며, 악용과 관련되지 않은 문의에는 답변하지 않습니다.**

문제가 있으시다면 [지원 페이지](/about/community)에서 원하시는 방법으로 연락해주세요.
</section>
