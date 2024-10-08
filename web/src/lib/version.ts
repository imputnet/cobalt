import { readable } from "svelte/store";
import type { Optional } from "./types/generic";
import { browser } from "$app/environment";

type VersionResponse = {
    commit: string;
    branch: string;
    remote: string;
    version: string;
}

export const version = readable<Optional<VersionResponse>>(
    undefined,
    (set) => {
        if (!browser) return;

        fetch('/version.json')
            .then(r => r.json())
            .then(set)
            .catch(() => {})
    }
)
