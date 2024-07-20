import type { MeowbaltEmotions } from "$lib/types/meowbalt";

export type DialogButton = {
    text: string,
    color: "blue" | "red" | "default",
    main: boolean,
    action: () => unknown | Promise<unknown>
}

export type DialogInfo = {
    id: string,
    type: "small",
    meowbalt: MeowbaltEmotions | "",
    title: string,
    bodyText: string,
    bodySubText: string,
    buttons: DialogButton[],
}
