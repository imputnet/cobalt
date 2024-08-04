import { json } from "@sveltejs/kit";
import { getCommit, getBranch, getRemote, getVersion } from "@imput/version-info";

export async function GET() {
    return json({
        commit: await getCommit(),
        branch: await getBranch(),
        remote: await getRemote(),
        version: await getVersion()
    });
}

export const prerender = true;
