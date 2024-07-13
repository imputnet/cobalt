export type DialogButton = {
    text: string,
    color: string,
    action: () => unknown | Promise<unknown>
}

export type DialogInfo = {
    id: string,
    type: "small",
    title: string,
    bodyText: string,
    bodySubText: string,
    buttons: DialogButton[]
}
