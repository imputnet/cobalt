<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

niniejsze warunki mają zastosowanie tylko w przypadku korzystania z oficjalnej
instancji cobalta. w innych przypadkach może być konieczne skontaktowanie się z
hosterem w celu uzyskania dokładnych informacji.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

funkcja zapisywania upraszcza pobieranie treści z Internetu i nie ponosi żadnej
odpowiedzialności za to, do czego zapisana zawartość jest używana. serwery
przetwarzania działają jak zaawansowane serwery proxy i nigdy nie zapisują
żadnej zawartości na dysku. wszystko jest obsługiwane w pamięci RAM i trwale
usuwane po zakończeniu tunelu. nie mamy dzienników pobierania i nie możemy
nikogo zidentyfikować.

[możesz przeczytać więcej o tym, jak działają tunele w naszej polityce
prywatności.](/about/privacy)
</section>

<section id="responsibility">
<SectionHeading
    title={$t("about.heading.responsibility")}
    sectionId="responsibility"
/>

ty (użytkownik końcowy) jesteś odpowiedzialny za to, co robisz z naszymi
narzędziami, w jaki sposób wykorzystujesz i rozpowszechniasz powstałe treści.
prosimy o zachowanie ostrożności podczas korzystania z treści innych osób i
zawsze kredytuj oryginalnych twórców. upewnij się, że nie naruszasz żadnych
warunków ani licencji.

jeśli używasz ich w celach edukacyjnych, zawsze podawaj źródła i podawaj nazwy
twórców.

uczciwe użytkowanie i kredytowanie przynosi wszystkim korzyści.
</section>

<section id="abuse">
<SectionHeading
    title={$t("about.heading.abuse")}
    sectionId="abuse"
/>

we have no way of detecting abusive behavior automatically because cobalt is
100% anonymous. however, you can report such activities to us via email and
we'll do our best to comply manually: abuse[at]imput.net

**ten adres email nie jest przeznaczony do wsparcia użytkowników, nie otrzymasz
odpowiedzi, jeśli twoje obawy nie są związane z nadużyciami.**

jeśli masz problemy, skontaktuj się z nami za pomocą dowolnej preferowanej
metody na [stronie wsparcia](/about/community).
</section>
