import type { Readable } from "svelte/store";

// more readable version of recursive partial taken from stackoverflow:
// https://stackoverflow.com/a/51365037
export type RecursivePartial<Type> = {
    [Key in keyof Type]?:
    Type[Key] extends (infer ElementType)[] ? RecursivePartial<ElementType>[] :
    Type[Key] extends object | undefined ? RecursivePartial<Type[Key]> :
    Type[Key];
};

export type DefaultImport<T> = () => Promise<{ default: T }>;
export type Optional<T> = T | undefined;
export type Writeable<T> = { -readonly [P in keyof T]: T[P] };
export type FromReadable<T> = T extends Readable<infer U> ? U : never;
