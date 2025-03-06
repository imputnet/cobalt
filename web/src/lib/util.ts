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
