import { writable } from "svelte/store";
import * as ServerInfo from "$lib/api/server-info";

export default writable<ServerInfo.CobaltServerInfoCache | undefined>();
