<script lang="ts">
    import { contacts, docs } from "$lib/env";
    import { t } from "$lib/i18n/translations";

    import SectionHeading from "$components/misc/SectionHeading.svelte";
    import BetaTesters from "$components/misc/BetaTesters.svelte";
</script>

<section id="imput">
<SectionHeading
    title="imput"
    sectionId="imput"
/>

cobalt, [imput](https://imput.net/) araştırma ve geliştirme ekibi tarafından sevgi ve özenle yapılmıştır.

Bizi [bağış sayfası](/donate) üzerinden destekleyebilirsiniz!
</section>

<section id="testers">
<SectionHeading
    title={$t("about.heading.testers")}
    sectionId="testers"
/>

Güncellemeleri erkenden test edip stabil olmalarını sağlayan şeyleri kıran ekibimize büyük teşekkürler.
Ayrıca, Cobalt 10'u yayınlamamıza yardımcı oldular!
<BetaTesters />

Tüm bağlantılar haricidir ve kişisel web sitelerine veya sosyal medya hesaplarına yönlendirir.
</section>

<section id="meowbalt">
<SectionHeading
    title={$t("general.meowbalt")}
    sectionId="meowbalt"
/>

Meowbalt, Cobalt'ın hızlı maskotudur. Hızlı interneti seven, son derece ifade dolu bir kedidir.

Cobalt'ta gördüğünüz tüm harika Meowbalt çizimleri [GlitchyPSI](https://glitchypsi.xyz/) tarafından yapılmıştır.
Kendisi ayrıca karakterin orijinal tasarımcısıdır.

GlitchyPSI'nin Meowbalt çizimlerini, açık izni olmadan kullanamaz veya değiştiremezsiniz.

Meowbalt karakter tasarımını ticari amaçla veya hayran sanatı dışında herhangi bir şekilde kullanamaz ya da değiştiremezsiniz.
</section>

<section id="licenses">
<SectionHeading
    title={$t("about.heading.licenses")}
    sectionId="licenses"
/>

Cobalt işlem sunucusu açık kaynaklıdır ve [AGPL-3.0]({docs.apiLicense}) lisansı altındadır.

Cobalt arayüzü [source first](https://sourcefirst.com/) modeline sahiptir ve [CC-BY-NC-SA 4.0]({docs.webLicense}) lisansı altındadır.
Bu lisansı, emeğimizden kâr elde etmek isteyen fırsatçıları ve insanları kandırarak zarar veren kötü niyetli kopyalar oluşturanları engellemek amacıyla seçtik.

Birçok açık kaynak kütüphanesine güveniyoruz, kendi kütüphanelerimizi oluşturuyor ve dağıtıyoruz.
Tüm bağımlılıkların tam listesini [GitHub]({contacts.github}) üzerinden görebilirsiniz.
</section>
