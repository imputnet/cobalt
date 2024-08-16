import { writable } from "svelte/store";

import type { Writable } from "svelte/store";
import type { CobaltSession } from "$lib/types/api";

export const cachedSession: Writable<CobaltSession | null> = writable();
