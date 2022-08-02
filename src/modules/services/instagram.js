import "dotenv/config"
import { execSync } from "child_process";

import loc from "../../localization/manager.js";
import { genericUserAgent, maxVideoDuration } from "../config.js";

let login = false;

var fs = require('fs');
function move(oldPath, newPath, callback) {
    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            if (err.code === 'EXDEV') {
                copy();
            } else {
                callback(err);
            }
            return;
        }
        callback();
    });

    function copy() {
        var readStream = fs.createReadStream(oldPath);
        var writeStream = fs.createWriteStream(newPath);

        readStream.on('error', callback);
        writeStream.on('error', callback);

        readStream.on('close', function () {
            fs.unlink(oldPath, callback);
        });

        readStream.pipe(writeStream);
    }
}

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

