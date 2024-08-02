import type { DefaultImport } from '$lib/types/generic';

type LanguageCode = string;
type KeyPath = string;

export type GenericImport = DefaultImport<unknown>;
export type LocalizationContent = Record<string, string>;
export type StructuredLocfileInfo = Record<
    LanguageCode,
    Record<KeyPath, GenericImport>
>;
