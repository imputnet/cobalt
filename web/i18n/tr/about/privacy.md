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

cobalt'ın gizlilik politikası basittir: hakkınızda hiçbir şey toplamıyor veya saklamıyoruz.
ne yaptığınız yalnızca sizin işinizdir, bizim veya başkasının değil.

bu şartlar yalnızca resmi cobalt sunucusu kullanılırken geçerlidir.
diğer durumlarda, doğru bilgi için sunucu barındırıcısıyla iletişime geçmeniz gerekebilir.
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

cihaz içi işleme kullanan araçlar çevrimdışı, yerel olarak çalışır
ve işlenen verileri asla hiçbir yere göndermez.
uygulanabilir olduğunda bu şekilde açıkça işaretlenirler.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

kaydetme işlevi kullanılırken cobalt'ın dosyaları vekil sunucudan geçirmesi veya yeniden ambalajlaması/kodlaması gerekebilir.
bu durumda bu amaçla geçici bir tünel oluşturulur
ve medya hakkında gerekli olan en az bilgi 90 saniye boyunca saklanır.

değiştirilmemiş ve resmi bir cobalt sunucusunda,
**tüm tünel verileri yalnızca son kullanıcının erişebildiği bir anahtarla şifrelenir**.

şifrelenmiş tünel verileri şunları içerebilir:
- kaynak servisin adı.
- medya dosyaları için orijinal URL'ler.
- işleme türlerini ayırt etmek için gerekli dahili bağımsız değişkenler.
- asgari dosya üstverisi (oluşturulan dosya adı, başlık, yazar, yapım yılı, telif hakkı bilgisi).
- tünelleme sürecinde bir URL hatası olması durumunda kullanılabilecek orijinal istek hakkında asgari bilgi.

bu veriler 90 saniye sonra sunucunun RAM'inden geri döndürülemez şekilde temizlenir.
cobalt'ın kaynak kodu değiştirilmediği sürece sunucu sahipleri dahil hiç kimse önbelleğe alınmış tünel verilerine erişemez.

tünellerdeki medya verileri asla hiçbir yerde saklanmaz/önbelleğe alınmaz.
her şey canlı işlenir, yeniden ambalajlama ve yeniden kodlama sırasında bile.
cobalt tünelleri anonim bir vekil sunucu gibi çalışır.

cihazınız yerel işlemeyi destekliyorsa,
şifrelenmiş tünel bilgisi istemciye döndürüldüğü için çok daha az bilgi içerir.

nasıl çalıştığı hakkında daha fazla bilgi edinmek için [github üzerindeki ilgili kaynak koda](https://github.com/imputnet/cobalt/tree/main/api/src/stream) bakın.
</section>

<section id="encryption">
<SectionHeading
    title={$t("about.heading.encryption")}
    sectionId="encryption"
/>

geçici olarak saklanan tünel verileri AES-256 standardı kullanılarak şifrelenir.
şifre çözme anahtarları yalnızca erişim bağlantısında yer alır ve asla hiçbir yerde günlüğe kaydedilmez/önbelleğe alınmaz/saklanmaz.
bağlantıya ve şifreleme anahtarlarına yalnızca son kullanıcı erişebilir.
anahtarlar istenen her tünel için benzersiz olarak oluşturulur.
</section>

{#if env.PLAUSIBLE_ENABLED}
<section id="plausible">
<SectionHeading
    title={$t("about.heading.plausible")}
    sectionId="plausible"
/>

tamamen anonim olarak aktif cobalt kullanıcılarının yaklaşık sayısını öğrenmek için [plausible](https://plausible.io/) kullanıyoruz. siz veya istekleriniz hakkında hiçbir tanımlanabilir bilgi saklanmaz. tüm veriler anonimleştirilir ve birleştirilir.
cobalt'ın kullandığı [plausible sunucusunu](https://{env.PLAUSIBLE_HOST}/) kendimiz barındırıyor ve yönetiyoruz.

plausible çerez kullanmaz ve GDPR, CCPA ve PECR ile tam uyumludur.

anonim analitiklerden çıkmak isterseniz bunu [gizlilik ayarlarından](/settings/privacy#analytics) yapabilirsiniz.
çıkış yaparsanız plausible betiği hiç yüklenmeyecektir.

[plausible'ın gizlilik taahhüdü hakkında daha fazla bilgi edinin](https://plausible.io/privacy-focused-web-analytics).
</section>
{/if}

<section id="cloudflare">
<SectionHeading
    title={$t("about.heading.cloudflare")}
    sectionId="cloudflare"
/>

cloudflare hizmetlerini şunlar için kullanıyoruz:
- ddos ve kötüye kullanım koruması.
- bot koruması (cloudflare turnstile).
- statik olarak oluşturulmuş web uygulamasını barındırma ve dağıtma (cloudflare workers).

bunların tümü herkese en iyi deneyimi sunmak için gereklidir.
cloudflare bildiğimiz tüm çözümler arasında en gizli ve güvenilir sağlayıcıdır.

cloudflare GDPR ve HIPAA ile tam uyumludur.

[cloudflare'in gizlilik taahhüdü hakkında daha fazla bilgi edinin](https://www.cloudflare.com/trust-hub/privacy-and-data-protection/).
</section>
