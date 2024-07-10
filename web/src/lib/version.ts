type VersionResponse = {
    commit: string;
    branch: string;
    remote: string;
    version: string;
}

const fetchVersion = async function () {
    const response: VersionResponse | undefined = await fetch('/version.json')
        .then(r => r.json())
        .catch(() => {});

    if (!response) return {
        commit: "unknown",
        branch: "unknown",
        remote: "unknown",
        version: "unknown"
    }

    return response;
}

export const version = await fetchVersion();
