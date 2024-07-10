import { error, json } from '@sveltejs/kit';
import { readFile }    from 'node:fs/promises';
import { join, parse } from 'node:path';
import { existsSync }  from 'node:fs';
import { cwd }         from 'node:process';

const findFile = (file: string) => {
    let dir = cwd();

    while (dir !== parse(dir).root) {
        if (existsSync(join(dir, file))) {
            return dir;
        }

        dir = join(dir, '../');
    }
}

const root = findFile('.git');
const pack = findFile('package.json');

export async function GET() {
    if (!root) {
        return error(500, 'no git repository root found');
    } else if (!pack) {
        return error(500, 'no package root found');
    }

    const readGit = (filename: string) => readFile(join(root, filename), 'utf8');

    const commit = (await readGit('.git/logs/HEAD'))
                    ?.split('\n')
                    ?.filter(String)
                    ?.pop()
                    ?.split(' ')[1];

    const branch = (await readGit('.git/HEAD'))
                    ?.replace(/^ref: refs\/heads\//, '')
                    ?.trim();

    let remote = (await readGit('.git/config'))
                    ?.split('\n')
                    ?.find(line => line.includes('url = ') && line.endsWith('.git'))
                    ?.split('url = ')[1];

    if (remote?.startsWith('git@')) {
        remote = remote.split(':')[1];
    } else if (remote?.startsWith('http')) {
        remote = new URL(remote).pathname.substring(1);
    }

    remote = remote?.replace(/\.git$/, '');

    const { version } = JSON.parse(
        await readFile(join(pack, 'package.json'), 'utf8')
    );

    if (!commit || !branch || !remote || !version) {
        return error(500, 'failed to extract project metadata');
    }

    return json({ commit, branch, remote, version });
}

export const prerender = true;