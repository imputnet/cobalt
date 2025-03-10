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

Cobalt, favori web sitelerinizden her şeyi kaydetmenize yardımcı olur: video, ses, fotoğraflar veya GIF'ler.
Sadece bağlantıyı yapıştırın ve hazırsınız!

Reklamlar, izleyiciler, ödeme duvarları veya başka saçmalıklar yok.
Sadece ihtiyacınız olduğunda, her yerde çalışan kullanışlı bir web uygulaması.
</section>

<section id="motivation">
<SectionHeading
    title={$t("about.heading.motivation")}
    sectionId="motivation"
/>

Cobalt, insanları alternatiflerinin sunduğu reklamlar ve kötü amaçlı yazılımlardan korumak amacıyla kamu yararına oluşturuldu.  
Biz en iyi yazılımın güvenli, açık ve erişilebilir olduğuna inanıyoruz.

Altyapımızın bir kısmı, uzun süredir iş ortağımız olan [royalehosting.net]({partners.royalehosting}) tarafından sağlanmaktadır!
</section>

<section id="privacy">
<SectionHeading
    title={$t("about.heading.privacy")}
    sectionId="privacy"
/>

Tüm arka uç istekleri anonimdir ve tüm tünel bilgileri şifrelenir.  
Sıkı bir **sıfır kayıt** politikamız vardır ve bireysel kullanıcılarla ilgili *hiçbir şeyi* takip etmiyoruz.

Bir istek ek işlem gerektirdiğinde, Cobalt dosyaları anlık olarak işler.  
Bu işlem, işlenen bölümleri doğrudan istemciye tünelleyerek yapılır, böylece hiçbir şey diske kaydedilmez.  
Örneğin, bu yöntem kaynak hizmetin video ve ses kanallarını ayrı dosyalar olarak sağlaması durumunda kullanılır.

Ek olarak, gizliliğinizi korumak için [zorunlu tünellemeyi etkinleştirebilirsiniz](/settings/privacy#tunnel).  
Bu özellik etkinleştirildiğinde, Cobalt indirilen tüm dosyaları tünelleyecektir.  
Böylece, indirdiğiniz şeyin kaynağını kimse bilemez – hatta internet servis sağlayıcınız bile.  
Tek görebilecekleri şey, bir Cobalt örneği kullandığınızdır.
</section>

<section id="community">
<SectionHeading
    title={$t("about.heading.community")}
    sectionId="community"
/>

Cobalt, sayısız sanatçı, eğitimci ve içerik üreticisi tarafından tutkularını gerçekleştirmek için kullanılmaktadır.  
Topluluğumuzla her zaman bağlantıdayız ve Cobalt'ı daha da kullanışlı hale getirmek için birlikte çalışıyoruz.  
Dilediğiniz zaman [sohbete katılabilirsiniz](/about/community)!

İnternetin geleceğinin açık olması gerektiğine inanıyoruz, bu yüzden Cobalt  
[source first](https://sourcefirst.com/) prensibine sahiptir ve [kolayca kendi sunucunuza kurabilirsiniz]({docs.instanceHosting}).

Eğer bir arkadaşınız bir işleme sunucusu çalıştırıyorsa, ondan bir alan adı isteyerek  
[örnek ayarlarınıza ekleyebilirsiniz](/settings/instances#community).

Kaynak kodunu inceleyebilir ve istediğiniz zaman [GitHub üzerinden katkıda bulunabilirsiniz]({contacts.github}).  
Tüm katkıları ve önerileri memnuniyetle karşılıyoruz!
</section>

<section id="local">
<SectionHeading
    title={$t("about.heading.local")}
    sectionId="local"
/>

[Remuxing](/remux) gibi en yeni özellikler, cihazınızda yerel olarak çalışır.  
Cihaz üzerinde yapılan işlemler verimlidir ve hiçbir şeyi internete göndermez.  
Bu yöntem, mümkün olduğunca fazla işlemi istemciye taşımayı hedefleyen gelecekteki vizyonumuzla mükemmel bir uyum içindedir.
</section>
