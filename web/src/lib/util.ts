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
            return [
                '-metadata',
                // eslint-disable-next-line no-control-regex
                `${name}=${value.replace(/[\u0000-\u0009]/g, "")}`
            ]
        }
        return [];
    });
