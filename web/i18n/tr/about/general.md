<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import { contacts, docs } from "$lib/env";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
</script>

<section id="summary">
<SectionHeading
    title={$t("about.heading.summary")}
    sectionId="summary"
/>

cobalt favori web sitelerinizden her şeyi kaydetmenize yardımcı olur: video, ses, fotoğraf veya gif. sadece bağlantıyı yapıştırın ve hazırsınız!

reklam, takipçi, ödeme duvarı veya diğer saçmalıklar yok. ihtiyacınız olduğunda her yerde çalışan kullanışlı bir web uygulaması.
</section>

<section id="motivation">
<SectionHeading
    title={$t("about.heading.motivation")}
    sectionId="motivation"
/>

cobalt kamu yararı için, insanları alternatif indiriciler tarafından sunulan reklamlar ve kötü amaçlı yazılımlardan korumak amacıyla oluşturulmuştur.
en iyi yazılımın güvenli, açık ve erişilebilir olduğuna inanıyoruz. tüm imput projeleri bu temel ilkeleri takip eder.
</section>

<section id="privacy-efficiency">
<SectionHeading
    title={$t("about.heading.privacy_efficiency")}
    sectionId="privacy-efficiency"
/>

arka uca (backend) yapılan tüm istekler anonimdir ve potansiyel dosya tünelleri hakkındaki tüm bilgiler şifrelenir.
kesin bir sıfır kayıt politikamız var ve bireyler hakkında *hiçbir şeyi* saklamıyor veya takip etmiyoruz.

bir istek yeniden ambalajlama veya yeniden kodlama gibi ek işleme gerektiriyorsa cobalt medyayı
doğrudan cihazınızda işler. bu en iyi verimliliği ve gizliliği sağlar.

cihazınız yerel işlemeyi desteklemiyorsa sunucu tabanlı canlı işleme kullanılır.
bu senaryoda, işlenen medya sunucunun diskinde saklanmadan doğrudan istemciye aktarılır.

gizliliği daha da artırmak için [zorunlu tünellemeyi etkinleştirebilirsiniz](/settings/privacy#tunnel).
etkinleştirildiğinde cobalt yalnızca gerektirenleri değil, indirilen tüm dosyaları tüneller.
ağ sağlayıcınız bile nereden bir şey indirdiğinizi bilemez.
görecekleri tek şey bir cobalt sunucusu kullandığınızdır.
</section>

<section id="community">
<SectionHeading
    title={$t("about.heading.community")}
    sectionId="community"
/>

cobalt sayısız sanatçı, eğitmen ve içerik üreticisi tarafından sevdikleri işi yapmak için kullanılıyor.
topluluğumuzla her zaman iletişim halindeyiz ve cobalt'ı daha da yararlı hale getirmek için birlikte çalışıyoruz.
[sohbete katılmaktan](/about/community) çekinmeyin!

internetin geleceğinin açık olduğuna inanıyoruz, bu yüzden cobalt
[source first](https://sourcefirst.com/) modelindedir ve [kolayca kendi sunucunuzda barındırılabilir]({docs.instanceHosting}).

bir arkadaşınız bir işleme sunucusu barındırıyorsa ondan alan adını isteyin ve [sunucu ayarlarından ekleyin](/settings/instances#community).

kaynak kodunu istediğiniz zaman [github]({contacts.github}) üzerinden kontrol edebilir ve katkıda bulunabilirsiniz.
tüm katkıları ve önerileri memnuniyetle karşılıyoruz!
</section>
