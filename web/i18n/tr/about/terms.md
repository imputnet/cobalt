<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

bu şartlar yalnızca resmi cobalt sunucusu kullanılırken geçerlidir.
diğer durumlarda, doğru bilgi için sunucu barındırıcısıyla iletişime geçmeniz gerekebilir.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

kaydetme işlevi internetten içerik indirmeyi kolaylaştırır
ve kaydedilen içeriğin ne için kullanıldığı konusunda hiçbir sorumluluk kabul etmiyoruz.

işleme sunucuları gelişmiş vekil sunucular gibi çalışır ve istenen hiçbir içeriği diske yazmaz.
her şey RAM'de işlenir ve tünel tamamlandığında kalıcı olarak temizlenir.
indirme kaydımız yoktur ve kimseyi tespit edemeyiz.

tünellerin nasıl çalıştığı hakkında daha fazla bilgiyi [gizlilik politikasında](/about/privacy) öğrenebilirsiniz.
</section>

<section id="responsibility">
<SectionHeading
    title={$t("about.heading.responsibility")}
    sectionId="responsibility"
/>

araçlarımızla ne yaptığınızdan, ortaya çıkan içeriği nasıl kullandığınızdan ve dağıttığınızdan siz (son kullanıcı) sorumlusunuz.
lütfen başkalarının içeriğini kullanırken dikkatli olun ve her zaman orijinal içerik üreticilerini belirtin.
herhangi bir şartı veya lisansı ihlal etmediğinizden emin olun.

eğitim amacıyla kullanıldığında, her zaman kaynakları gösterin ve orijinal içerik üreticilerini belirtin.

adil kullanım ve kaynak gösterme herkese fayda sağlar.
</section>

<section id="abuse">
<SectionHeading
    title={$t("about.heading.abuse")}
    sectionId="abuse"
/>

cobalt tamamen anonim olduğu için kötüye kullanım davranışlarını otomatik olarak tespit etme imkanımız yoktur.
ancak bu tür faaliyetleri bize e-posta yoluyla bildirebilirsiniz ve manuel olarak gereğini yapmak için elimizden geleni yaparız: abuse[at]imput.net

**bu e-posta kullanıcı desteği için tasarlanmamıştır, sorununuz kötüye kullanımla ilgili değilse yanıt alamazsınız.**

sorun yaşıyorsanız [topluluk sayfasındaki](/about/community) tercih ettiğiniz herhangi bir yöntemle desteğe ulaşabilirsiniz.
</section>
