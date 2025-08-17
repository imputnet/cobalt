import { writable } from "svelte/store";
import type { CobaltDownloadButtonState } from "$lib/types/omnibox";

export const link = writable("");
export const downloadButtonState = writable<CobaltDownloadButtonState>("idle");
