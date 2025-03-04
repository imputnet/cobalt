<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="general">
<SectionHeading
    title={$t("about.heading.general")}
    sectionId="general"
/>

Bu koşullar yalnızca resmi Cobalt örneğini kullanırken geçerlidir.  
Diğer durumlarda, doğru bilgi almak için sunucuyu barındıran kişiyle iletişime geçmeniz gerekebilir.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

Kaydetme işlevi, internetten içerik indirme işlemini kolaylaştırır ve kaydedilen içeriğin nasıl kullanıldığıyla ilgili **hiçbir sorumluluk kabul etmez**.  
İşleme sunucuları, gelişmiş proxyler gibi çalışır ve hiçbir içeriği diske yazmaz.  
Tüm işlemler **RAM üzerinde gerçekleştirilir** ve tünel tamamlandığında **kalıcı olarak silinir**.  
Herhangi bir indirme kaydı tutmuyoruz ve kullanıcıları kimlik olarak belirleyemiyoruz.

[Tünellerin nasıl çalıştığı hakkında daha fazla bilgiyi gizlilik politikamızda okuyabilirsiniz.](/about/privacy)
</section>

<section id="responsibility">
<SectionHeading
    title={$t("about.heading.responsibility")}
    sectionId="responsibility"
/>

Siz (son kullanıcı), araçlarımızı nasıl kullandığınızdan ve ortaya çıkan içeriği nasıl dağıttığınızdan **sorumlusunuz**.  
Lütfen başkalarının içeriklerini kullanırken **dikkatli olun** ve her zaman orijinal yaratıcılarına **kaynak gösterin**.  
Herhangi bir lisansı veya kullanım şartlarını ihlal etmediğinizden emin olun.

Eğitim amaçlı kullanımlarda, her zaman **kaynak belirtmeli** ve orijinal içerik üreticilerini **krediyle anmalısınız**.

Adil kullanım ve kaynak gösterme, herkesin yararınadır.
</section>

<section id="abuse">
<SectionHeading
    title={$t("about.heading.abuse")}
    sectionId="abuse"
/>

Cobalt %100 anonim olduğu için **kötüye kullanım davranışlarını otomatik olarak tespit etme imkânımız yoktur**.  
Ancak, bu tür faaliyetleri bize **e-posta yoluyla bildirebilirsiniz** ve elimizden geleni yaparız: abuse[at]imput.net

**Bu e-posta kullanıcı desteği için değildir.**  
Eğer bildiriminiz kötüye kullanım ile ilgili değilse, **yanıt almazsınız**.

Bir sorun yaşıyorsanız, **[destek sayfamız](/about/community)** üzerinden tercih ettiğiniz bir yöntemle bizimle iletişime geçebilirsiniz.
</section>
