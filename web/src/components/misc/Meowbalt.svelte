<script lang="ts">
    import { t } from "$lib/i18n/translations";

    import type { MeowbaltEmotions } from "$lib/types/meowbalt";

    export let emotion: MeowbaltEmotions;
</script>

<img
    class="meowbalt {emotion}"
    src="/meowbalt/{emotion}.png"
    height="152"
    alt={$t(`a11y.meowbalt.${emotion}`)}
/>

<style>
    .meowbalt {
        display: block;
        margin: 0;
        object-fit: cover;
    }

    .think,
    .error {
        height: 160px;
    }

    .error {
        margin-left: 25px;
    }
</style>
