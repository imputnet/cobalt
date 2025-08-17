import { CobaltFileMetadataKeys, type CobaltFileMetadata } from "$lib/types/api";

export const formatFileSize = (size: number | undefined) => {
    size ||= 0;

    // gigabyte, megabyte, kilobyte, byte
    const units = ['G', 'M', 'K', ''];
    while (size >= 1024 && units.length > 1) {
        size /= 1024;
        units.pop();
    }

    const roundedSize = size.toFixed(2);
    const unit = units[units.length - 1] + "B";
    return `${roundedSize} ${unit}`;
}

export const ffmpegMetadataArgs = (metadata: CobaltFileMetadata) =>
    Object.entries(metadata).flatMap(([name, value]) => {
        if (CobaltFileMetadataKeys.includes(name) && typeof value === "string") {
            if (name === "sublanguage") {
                return [
                    '-metadata:s:s:0',
                    // eslint-disable-next-line no-control-regex
                    `language=${value.replace(/[\u0000-\u0009]/g, "")}`
                ]
            }
            return [
                '-metadata',
                // eslint-disable-next-line no-control-regex
                `${name}=${value.replace(/[\u0000-\u0009]/g, "")}`
            ]
        }
        return [];
    });

const digit = () => '0123456789abcdef'[Math.random() * 16 | 0];
export const uuid = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
        return crypto.randomUUID();
    }

    const digits = Array.from({length: 32}, digit);
    digits[12] = '4';
    digits[16] = '89ab'[Math.random() * 4 | 0];

    return digits
            .join('')
            .match(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/)!
            .slice(1)
            .join('-');
}
