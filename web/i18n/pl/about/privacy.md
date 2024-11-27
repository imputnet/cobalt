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

polityka prywatności cobalta jest prosta: nie zbieramy ani nie przechowujemy
żadnych informacji o tobie. to, co robisz, jest wyłącznie twoją sprawą, a nie
naszą lub kogokolwiek innego.

niniejsze warunki mają zastosowanie tylko w przypadku korzystania z oficjalnej
instancji cobalta. w innych przypadkach może być konieczne skontaktowanie się z
hosterem w celu uzyskania dokładnych informacji.
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

narzędzia korzystające z przetwarzania na urządzeniu działają w trybie offline,
lokalnie i nigdy nie wysyłają nigdzie żadnych danych. są one wyraźnie oznaczone
jako takie, gdy ma to zastosowanie.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

podczas korzystania z funkcji zapisywania, w niektórych przypadkach cobalt
szyfruje i tymczasowo przechowuje informacje potrzebne do tunelowania. są one
przechowywane w pamięci RAM serwera przetwarzania przez 90 sekund, a następnie
nieodwracalnie usuwane. nikt nie ma do nich dostępu, nawet właściciele
instancji, o ile nie zmodyfikują oficjalnego obrazu cobalta.

przetwarzane/tunelowane pliki nigdy nie są nigdzie buforowane. wszystko jest
tunelowane na żywo. funkcja zapisywania cobalta jest zasadniczo elegancką usługą
proxy.
</section>

<section id="encryption">
<SectionHeading
    title={$t("about.heading.encryption")}
    sectionId="encryption"
/>

tymczasowo przechowywane dane tunelu są szyfrowane przy użyciu standardu
AES-256. klucze deszyfrujące są zawarte tylko w łączu dostępu i nigdy nie są
nigdzie rejestrowane/buforowane/przechowywane. tylko użytkownik końcowy ma
dostęp do łącza i kluczy szyfrujących. klucze są generowane unikalnie dla
każdego żądanego tunelu.
</section>

{#if env.PLAUSIBLE_ENABLED}
<section id="plausible">
<SectionHeading
    title={$t("about.heading.plausible")}
    sectionId="plausible"
/>

w trosce o prywatność korzystamy z [anonimowej analizy ruchu od
plausible](https://plausible.io/), aby uzyskać przybliżoną liczbę aktywnych
użytkowników cobalt. żadne informacje umożliwiające zidentyfikowanie ciebie lub
twoje żądania nie są nigdy przechowywane. wszystkie dane są zanimizowane i
agregowane. instancja plausible, której używamy, jest przez nas hostowana i
zarządzana.

plausible nie używa ciasteczek i jest w pełni zgodny z RODO, CCPA i PECR.

[dowiedz się więcej o zaangażowaniu plausible w ochronę
prywatności.](https://plausible.io/privacy-focused-web-analytics)

jeśli chcesz zrezygnować z anonimowych analiz, możesz to zrobić w [ustawieniach
prywatności](/settings/privacy#analytics).
</section>
{/if}

<section id="cloudflare">
<SectionHeading
    title={$t("about.heading.cloudflare")}
    sectionId="cloudflare"
/>

korzystamy z usług cloudflare do ochrony przed ddos i botami. używany również
cloudflare pages do wdrażania i hostowania statycznej aplikacji internetowej.
wszystkie te elementy są wymagane, aby zapewnić najlepsze doświadczenie dla
wszystkich. jest to najbardziej prywatny i niezawodny dostawca, jakiego znamy.

cloudflare jest w pełni zgodny z RODO i HIPAA.

[dowiedz się więcej o zaangażowaniu cloudflare w ochronę
prywatności.](https://www.cloudflare.com/trust-hub/privacy-and-data-protection/)
</section>
