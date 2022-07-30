import got from "got";
import loc from "../../localization/manager.js";
import { genericUserAgent } from "../config.js";
import { unicodeDecode } from "../sub/utils.js";

export default async function(obj) {
    try {
        if (!obj.postId) {
            let html = await got.get(`https://vt.tiktok.com/${obj.id}`, { headers: { "user-agent": genericUserAgent } });
            html.on('error', (err) => {
                return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', 'tiktok') };
            });
            html = html.body
            if (!html.includes('<!DOCTYPE html>')) {
                obj.postId = html.split('video/')[1].split('?')[0]
            } else {
                obj.postId = html.split('aweme/detail/')[1].split('?')[0]
            }
        }
        let html = await got.get(`https://tiktok.com/@video/video/${obj.postId}`, { headers: { "user-agent": genericUserAgent } });
        html.on('error', (err) => {
            return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', 'tiktok') };
        });
        html = html.body;
        if (html.includes(',"preloadList":[{"url":"')) {
            return { urls: unicodeDecode(html.split(',"preloadList":[{"url":"')[1].split('","id":"')[0].trim()), filename: `tiktok_${obj.postId}.mp4` };
        } else {
            return { error: loc(obj.lang, 'ErrorEmptyDownload') };
        }
    } catch (e) {
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}
