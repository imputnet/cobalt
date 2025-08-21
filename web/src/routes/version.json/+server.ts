import { json } from "@sveltejs/kit";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

async function getCommit(): Promise<string> {
    const { stdout } = await execAsync("git rev-parse HEAD");
    return stdout.trim();
}

async function getBranch(): Promise<string> {
    const { stdout } = await execAsync("git rev-parse --abbrev-ref HEAD");
    return stdout.trim();
}

async function getRemote(): Promise<string> {
    const { stdout } = await execAsync("git config --get remote.origin.url");
    return stdout.trim();
}

async function getVersion(): Promise<string> {
    const { stdout } = await execAsync("git describe --tags --always");
    return stdout.trim();
}

export async function GET() {
    return json({
        commit: await getCommit(),
        branch: await getBranch(),
        remote: await getRemote(),
        version: await getVersion()
    });
}

export const prerender = true;


