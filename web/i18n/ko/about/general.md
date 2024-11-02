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

cobalt는 좋아하는 웹사이트에서 뭐든지 저장할 수 있도록 도와줍니다: 동영상, 오디오, 사진 또는 GIF. 링크를 복사하고 바로 시작하세요!

광고, 추적기, 결제, 또는 기타 그러한 것이 없습니다. 그저 어디서나 작동하는 편리한 웹 앱입니다.
</section>

<section id="motivation">
<SectionHeading
    title={$t("about.heading.motivation")}
    sectionId="motivation"
/>

cobalt는 모두의 이익을 위해 만들어졌으며, 기존 방법들이 제공하는 광고와 악성코드로부터 사람들을 보호하기 위해 탄생했습니다
저희는 최고의 소프트웨어는 안전하고, 개방적이며, 접근성이 좋아야 한다고 믿습니다.

[royalehosting.net]({partners.royalehosting})의 도움으로 메인 인스턴스를 계속 운영할 수 있습니다!
</section>

<section id="privacy">
<SectionHeading
    title={$t("about.heading.privacy")}
    sectionId="privacy"
/>

모든 요청은 익명이며 터널에 대한 모든 정보는 암호화됩니다.
저희는 엄격한 로그 정책을 가지고 있으며 사용자의 어느 것도 추적하지 않습니다.

요청이 추가 처리를 필요로 할 때, cobalt은 즉시 파일을 처리합니다.
이는 파일을 디스크에 저장하지 않고 클라이언트로 직접 처리된 부분을 터널링하는 방법을 사용합니다.
예를 들어, 이 방법은 서비스가 비디오와 오디오 채널을 별도의 파일로 제공할 때 사용됩니다.

또한, [강제 터널링](/settings/privacy#tunnel)을 통해 개인 정보를 보호할 수 있습니다.
강제 터널링을 활성화하면 cobalt은 다운로드한 모든 파일을 터널링합니다.
네트워크 제공자도 당신이 어디에서 다운로드를 받는지 알 수 없으며, cobalt 인스턴스를 사용하고 있다는 것뿐만 알 수 있습니다.
</section>

<section id="community">
<SectionHeading
    title={$t("about.heading.community")}
    sectionId="community"
/>

셀 수 없이 많은 아티스트, 교육자, 콘텐츠 크리에이터들이 cobalt을 사용합니다.
저희는 항상 커뮤니티와 함께 일하며 함께 더 유용하게 만들어 나갑니다.
[커뮤니티 토론](/about/community)에 참여해 주세요!

저희는 인터넷의 미래는 개방적이라고 믿습니다. 이는 cobalt이 [source first](https://sourcefirst.com/)이며 [쉽게 자가 호스팅 가능]({docs.instanceHosting})한 이유입니다.

친구가 프로세스 인스턴스를 호스팅하고 있다면, 도메인을 물어보고 [인스턴스 설정](/settings/instances#community)에 추가하세요.

소스 코드를 확인하고 [github]({contacts.github})에 기여할 수 있습니다.
모든 기여와 제안을 환영합니다!
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

최근 기능, 예를 들어 [remux](/remux)는 귀하의 기기에서 로컬로 작동합니다.
기기에서 처리는 효율적이며 인터넷을 통해 아무것도 보내지 않습니다.
이는 클라이언트로 가능한 많은 처리를 이동하는 미래 목표와 완벽하게 맞아떨어집니다.
</section>
