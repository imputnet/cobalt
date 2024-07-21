import type { SvelteComponent } from "svelte"

export interface ChangelogMetadata {
    title: string,
    date: string,
    banner?: {
        file: string,
        alt: string
    }
};

export interface MarkdownMetadata {
    metadata: ChangelogMetadata
};

export type ChangelogImport = {
    default: SvelteComponent,
    metadata: ChangelogMetadata
};