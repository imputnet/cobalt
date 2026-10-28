<script lang="ts">
    import { contacts, docs, partners } from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
    import BetaTesters from "$components/misc/BetaTesters.svelte";
</script>

<section id="imput">
<SectionHeading
    title="imput"
    sectionId="imput"
/>

cobalt, [imput](https://imput.net/) tarafından sevgi ve özenle yapılmıştır ❤️

biz iki kişilik küçük bir ekibiz, ancak herkese fayda sağlayan harika yazılımlar üretmek için çok çalışıyoruz.
çalışmamızı beğendiyseniz, lütfen [bağış sayfasından](/donate) desteklemeyi düşünün!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

güncellemeleri erkenden test edip kararlı olduklarından emin oldukları için testçilerimize sonsuz teşekkürler.
ayrıca cobalt 10'u yayınlamamıza da yardımcı oldular!
<BetaTesters />

tüm bağlantılar dış bağlantıdır ve kişisel web sitelerine veya sosyal medyalarına yönlendirir.
</section>

<section id="partners">
<SectionHeading
    title={$t("about.heading.partners")}
    sectionId="partners"
/>

cobalt'ın işleme altyapısının bir kısmı
uzun süreli ortağımız [royalehosting.net]({partners.royalehosting}) tarafından sağlanmaktadır!
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

meowbalt, cobalt'ın hızlı maskotudur; hızlı interneti çok seven çok dışa dönük bir kedi.

cobalt'ta gördüğünüz meowbalt'ın tüm harika çizimleri
[GlitchyPSI](https://glitchypsi.xyz/) tarafından yapılmıştır.
kendisi aynı zamanda karakterin orijinal yaratıcısıdır.

imput, meowbalt'ın karakter tasarımının yasal haklarına sahiptir,
ancak GlitchyPSI tarafından oluşturulan belirli sanat eserlerine sahip değildir.

meowbalt'ı seviyoruz, bu yüzden onu korumak için birkaç kural koymak zorundayız:
- meowbalt'ın karakter tasarımını hayran sanatı (fan art) olmayan hiçbir şekilde kullanamazsınız.
- meowbalt'ın tasarımını veya çizimlerini ticari olarak kullanamazsınız.
- meowbalt'ın tasarımını veya çizimlerini kendi projelerinizde kullanamazsınız.
- GlitchyPSI'ın meowbalt çizimlerini hiçbir şekilde kullanamaz veya değiştiremezsiniz.

meowbalt için hayran sanatı yaparsanız, lütfen
[discord sunucumuzda](/about/community) paylaşın, görmeyi çok isteriz!
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

cobalt api (işleme sunucusu) kodu açık kaynaklıdır ve [AGPL-3.0]({docs.apiLicense}) altında lisanslanmıştır.

cobalt ön yüz (frontend) kodu [source first](https://sourcefirst.com/) modelindedir ve [CC-BY-NC-SA 4.0]({docs.webLicense}) altında lisanslanmıştır.

fırsatçıların çalışmamızdan kar elde etmesini ve insanları kandırıp kamu kimliğimize zarar veren kötü amaçlı klonlar oluşturmasını önlemek için ön yüzü kaynak öncelikli yapmak zorundaydık.
ticari kullanım dışında, birçok açık kaynak lisansıyla aynı ilkeleri takip eder.

birçok açık kaynak kütüphanesine güveniyoruz, ancak aynı zamanda kendimiz de geliştirip dağıtıyoruz.
bağımlılıkların tam listesini [github]({contacts.github}) üzerinde görebilirsiniz!
</section>
