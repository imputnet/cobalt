<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import type { MeowbaltEmotions } from "$lib/types/meowbalt";

    export let emotion: MeowbaltEmotions;
</script>

<img
    class="meowbalt {emotion}"
    src="/meowbalt/{emotion}.png"
    height="152"
    alt={$t('general.meowbalt')}
    aria-hidden="true"
/>

<style>
    .meowbalt {
        display: block;
        margin: 0;
        object-fit: cover;
    }

    .error {
        height: 160px;
    }

    .question {
        height: 140px;
    }

    .error {
        margin-left: 25px;
    }
</style>
