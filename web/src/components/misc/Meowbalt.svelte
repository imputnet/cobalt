<script lang="ts">
    import { t } from "$lib/i18n/translations";
    import type { MeowbaltEmotions } from "$lib/types/meowbalt";

    type Props = {
        emotion: MeowbaltEmotions;
        forceLoaded?: boolean;
    };

    const { emotion, forceLoaded }: Props = $props();

    let loaded = $state(false);
</script>

<img
    class="meowbalt {emotion}"
    class:loaded={loaded || forceLoaded}
    onload={() => (loaded = true)}
    src="/meowbalt/{emotion}.png"
    height="152"
    alt={$t("general.meowbalt")}
    aria-hidden="true"
/>

<style>
    .meowbalt {
        display: block;
        margin: 0;
        object-fit: cover;
        opacity: 0;
        transition: opacity 0.15s;
    }

    .meowbalt.loaded {
        opacity: 1;
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
