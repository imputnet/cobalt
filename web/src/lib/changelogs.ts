import { compareVersions } from 'compare-versions';

export function getVersionFromPath(path: string) {
    return path.split('/').pop()?.split('.md').shift()!;
}

export function getAllChangelogs() {
    const changelogImports = import.meta.glob("/changelogs/*.md");

    const sortedVersions = Object.keys(changelogImports)
                                 .map(path => [path, getVersionFromPath(path)])
                                 .sort(([, a], [, b]) => compareVersions(a, b));

    const sortedChangelogs = sortedVersions.reduce(
        (obj, [path, version]) => ({
            [version]: changelogImports[path],
            ...obj
        }), {} as typeof changelogImports
    );

    return sortedChangelogs;
}
