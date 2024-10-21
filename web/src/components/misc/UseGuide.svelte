<script>
    import { t } from "$lib/i18n/translations";
</script>

<div id="user-guide" class="user-guide">
    <h2>{$t('general.guide.title')}</h2>
    <p>{$t('general.guide.description1')}</p>
    <p>{$t('general.guide.description2')}</p>
</div>

<style>
    #user-guide {
        max-width: 800px;
        padding: 20px;
        background-color: #f5f5f5;
        border-radius: 8px;
        text-align: left;
        margin-top: 20px;
    }

    #user-guide h2 {
        font-size: 24px;
        margin-bottom: 10px;
    }

    #user-guide p {
        font-size: 16px;
        margin-bottom: 8px;
    }
</style>
