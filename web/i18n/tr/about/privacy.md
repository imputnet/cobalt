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

Cobalt’ın gizlilik politikası basittir: sizinle ilgili hiçbir şeyi toplamaz veya saklamayız.  
Ne yaptığınız tamamen sizin işinizdir, bizim ya da başkasının değil.

Bu koşullar yalnızca resmi Cobalt örneğini kullanırken geçerlidir.  
Diğer durumlarda, doğru bilgi almak için sunucuyu barındıran kişiyle iletişime geçmeniz gerekebilir.
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

Cihaz üzerinde işlem yapan araçlar çevrimdışı çalışır, tamamen yereldir ve hiçbir veriyi herhangi bir yere göndermez.  
Bu araçlar, geçerli olduğu durumlarda açıkça işaretlenmiştir.
</section>

<section id="saving">
<SectionHeading
    title={$t("about.heading.saving")}
    sectionId="saving"
/>

Kaydetme işlevini kullanırken, bazı durumlarda Cobalt, tünelleme için gerekli bilgileri şifreleyip geçici olarak saklayabilir.  
Bu bilgiler işleme sunucusunun RAM’inde **90 saniye** tutulur ve ardından geri döndürülemez şekilde silinir.  
Resmi Cobalt görüntüsünü değiştirmediği sürece, bu verilere **hiç kimse**, hatta sunucu sahipleri bile erişemez.

İşlenmiş/tünellenmiş dosyalar hiçbir yerde önbelleğe alınmaz.  
Tüm veriler canlı olarak tünellenir.  
Cobalt’ın kaydetme işlevi, temelde gelişmiş bir proxy hizmetidir.
</section>

<section id="encryption">
<SectionHeading
    title={$t("about.heading.encryption")}
    sectionId="encryption"
/>

Geçici olarak saklanan tünel verileri **AES-256** standardı kullanılarak şifrelenir.  
Şifre çözme anahtarları yalnızca erişim bağlantısında bulunur ve hiçbir yerde **kaydedilmez, önbelleğe alınmaz veya saklanmaz**.  
Yalnızca **son kullanıcı** bağlantıya ve şifreleme anahtarlarına erişebilir.  
Anahtarlar, talep edilen her tünel için benzersiz olarak oluşturulur.
</section>

{#if env.PLAUSIBLE_ENABLED}
<section id="plausible">
<SectionHeading
    title={$t("about.heading.plausible")}
    sectionId="plausible"
/>

Gizliliği korumak adına, **Cobalt’ın aktif kullanıcı sayısını yaklaşık olarak belirlemek için**  
[Plausible’ın anonim trafik analizini](https://plausible.io/) kullanıyoruz.  
**Kimliğinizi belirleyebilecek hiçbir bilgi** saklanmaz.  
Tüm veriler anonimleştirilmiş ve toplulaştırılmıştır.  
Kullandığımız Plausible örneği, tamamen **bizim tarafımızdan barındırılmakta ve yönetilmektedir**.

Plausible çerez kullanmaz ve **GDPR, CCPA ve PECR** ile tamamen uyumludur.

[Plausible’ın gizliliğe olan bağlılığı hakkında daha fazla bilgi edinin.](https://plausible.io/privacy-focused-web-analytics)

Eğer anonim analizlerden çıkmak isterseniz, bunu  
[gizlilik ayarları](/settings/privacy#analytics) üzerinden yapabilirsiniz.
</section>
{/if}

<section id="cloudflare">
<SectionHeading
    title={$t("about.heading.cloudflare")}
    sectionId="cloudflare"
/>

DDoS ve bot koruması için **Cloudflare** hizmetlerini kullanıyoruz.  
Ayrıca, statik web uygulamasını dağıtmak ve barındırmak için **Cloudflare Pages** kullanıyoruz.  
Bunların hepsi, herkes için **en iyi deneyimi** sağlamak adına gereklidir.  
Cloudflare, bildiğimiz en **gizlilik dostu ve güvenilir sağlayıcıdır**.

Cloudflare, **GDPR ve HIPAA** ile tamamen uyumludur.

[Cloudflare’ın gizliliğe olan bağlılığı hakkında daha fazla bilgi edinin.](https://www.cloudflare.com/trust-hub/privacy-and-data-protection/)
</section>
