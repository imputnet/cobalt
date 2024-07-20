import { readable } from "svelte/store";

type VersionResponse = {
    commit: string;
    branch: string;
    remote: string;
    version: string;
}

const unknownVersion = {
    commit: "unknown",
    branch: "unknown",
    remote: "unknown",
    version: "unknown"
};

export const version = readable<VersionResponse>(
    unknownVersion,
    (set) => {
        fetch('/version.json')
            .then(r => r.json())
            .then(set)
            .catch(() => {})
    }
)
