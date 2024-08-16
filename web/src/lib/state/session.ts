import { writable } from "svelte/store";
import type { CobaltSession } from "$lib/types/api";

export const cachedSession = writable<CobaltSession | undefined>();
