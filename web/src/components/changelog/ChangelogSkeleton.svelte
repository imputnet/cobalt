<script lang="ts">
    import Skeleton from "$components/misc/Skeleton.svelte";
    export let version: string;
</script>

<main>
    <div id="changelog-header">
        <div class="changelog-info">
            <div class="changelog-version">{ version }</div>
            <div class="changelog-date">
                <Skeleton
                    width="8em"
                    height="16px"
                />
            </div>
        </div>
        <Skeleton
            width="100%"
            height="27.59px"
        />
    </div>
    <div class="changelog-content">
        <Skeleton
            class="big changelog-banner"
            width="100%"
        />
        <div class="contents">
            {#each {length: 3 + Math.random() * 5} as _}
                <p>
                    <Skeleton
                        width="100%"
                        height={(Math.random() * 84 + 16) + 'px'}
                    />
                </p>
            {/each}
        </div>
    </div>
</main>

<style src="./ChangelogEntry.css"></style>