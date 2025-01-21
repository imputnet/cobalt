const allowedLinkTypes = new Set(["text/plain", "text/uri-list"]);

export const pasteLinkFromClipboard = async () => {
    const clipboard = await navigator.clipboard.read();

    if (clipboard?.length) {
        const clipboardItem = clipboard[0];
        for (const type of clipboardItem.types) {
            if (allowedLinkTypes.has(type)) {
                const blob = await clipboardItem.getType(type);
                const blobText = await blob.text();

                return blobText;
            }
        }
    }
}
