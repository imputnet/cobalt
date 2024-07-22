import type { MeowbaltEmotions } from "$lib/types/meowbalt";

export type DialogButton = {
    text: string,
    color?: "red",
    main: boolean,
    action: () => unknown | Promise<unknown>
}

export type SmallDialogIcons = "warn-red";

export type DialogPickerItem = {
    type?: 'photo' | 'video',
    url: string,
    thumb?: string,
}

export type DialogInfo = {
    id: string,
    type: "small" | "picker",
    meowbalt?: MeowbaltEmotions,
    icon?: SmallDialogIcons,
    title?: string,
    bodyText?: string,
    bodySubText?: string,
    buttons?: DialogButton[],
    items?: DialogPickerItem[],
}
