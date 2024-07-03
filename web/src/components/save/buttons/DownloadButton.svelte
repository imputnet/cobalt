<script lang="ts">
    import '@fontsource-variable/noto-sans-mono';

    import API from "$lib/api";
    import { device } from '$lib/device';

    export let url: string;

    $: buttonText = '>>';
    $: isDisabled = false;

    const changeDownloadButton = (state: string) => {
        isDisabled = true;
        switch(state) {
            case "think":
                buttonText = '...';
                break;
            case "check":
                buttonText = '..?';
                break;
            case "done":
                buttonText = '>>>';
                break;
            case "error":
                buttonText = '!!';
                break;
        }
    }

    const restoreDownloadButton = () => {
        setTimeout(() => {
            buttonText = '>>';
            isDisabled = false;
        }, 2500)
    }

    const downloadFile = (url: string) => {
        if (device.is.iOS) {
            return navigator?.share({ url }).catch(() => {});
        } else {
            return window.open(url, '_blank');
        }
    }

    // alerts are temporary, we don't have an error popup yet >_<
    export const download = async (link: string) => {
        changeDownloadButton("think");

        const response = await API.request(link);

        if (!response) {
            changeDownloadButton("error");
            restoreDownloadButton();

            return alert("couldn't access the api")
        }

        if (response.status === "error" || response.status === "rate-limit") {
            changeDownloadButton("error");
            restoreDownloadButton();

            return alert(`error from api: ${response.text}`);
        }

        if (response.status === "redirect") {
            changeDownloadButton("done");
            restoreDownloadButton();

            return downloadFile(response.url);
        }

        if (response.status === "stream") {
            changeDownloadButton("check");

            const probeResult = await API.probeCobaltStream(response.url);

            if (probeResult === 200) {
                changeDownloadButton("done");
                restoreDownloadButton();

                return downloadFile(response.url);
            } else {
                changeDownloadButton("error");
                restoreDownloadButton();

                return alert("couldn't probe the stream");
            }
        }
    };
</script>

<button id="download-button" disabled={isDisabled} on:click={() => download(url)}>
    <span id="download-state">{buttonText}</span>
</button>

<style>
    #download-button {
        display: flex;
        align-items: center;
        justify-content: center;

        height: 100%;
        min-width: 48px;

        border-radius: 0;
        padding: 0 12px;

        background: none;
        box-shadow: none;
        transform: none;

        border-left: 1.5px var(--input-border) solid;
        border-top-right-radius: var(--border-radius);
        border-bottom-right-radius: var(--border-radius);
    }

    #download-button:focus-visible {
        box-shadow: 0 0 0 2px var(--blue) inset;
    }

    #download-state {
        font-size: 24px;
        font-family: "Noto Sans Mono Variable", "Noto Sans Mono", "IBM Plex Mono", monospace;
        font-weight: 400;

        text-align: center;
        text-indent: -5px;
        letter-spacing: -0.22em;

        margin-bottom: 0.1rem;
    }

    #download-button:disabled {
        cursor: unset;
    }

    :global(#input-container.focused) #download-button {
        border-left: 2px var(--secondary) solid;
    }

    @media (hover: hover) {
        #download-button:hover {
            background: var(--button-hover-transparent);
        }
        #download-button:disabled:hover {
            background: none;
        }
    }
</style>
