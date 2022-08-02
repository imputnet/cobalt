import "dotenv/config"
import { execSync } from "child_process";

import loc from "../../localization/manager.js";
import { genericUserAgent, maxVideoDuration } from "../config.js";

let login = false;

export default async function(obj) {
    try {
        if(!login){
            execSync(`src\\modules\\instagram\\instaloader --password ${process.env.instagramPassword} --login ${process.env.instagramUsername}`);
            login = true;
        }
        execSync(`src\\modules\\instagram\\instaloader --login ${process.env.instagramUsername} -- -${obj.id}`);

    } catch(err){
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}

