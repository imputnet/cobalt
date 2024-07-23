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

type Dialog = {
    id: string,
    buttons?: DialogButton[],
};

type SmallDialog = Dialog & {
    type: "small",
    meowbalt?: MeowbaltEmotions,
    icon?: SmallDialogIcons,
    title?: string,
    bodyText?: string,
    bodySubText?: string,
};

type PickerDialog = Dialog & {
    type: "picker",
    items?: DialogPickerItem[],
};

export type DialogInfo = SmallDialog | PickerDialog;