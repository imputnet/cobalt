export type DialogButton = {
    text: string,
    color: string,
    main: boolean,
    action: () => unknown | Promise<unknown>
}

export type DialogInfo = {
    id: string,
    type: "small",
    meowbalt: "error",
    title: string,
    bodyText: string,
    bodySubText: string,
    buttons: DialogButton[],
}
