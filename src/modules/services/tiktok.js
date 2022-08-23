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
        if (!obj.noWatermark && !obj.isAudioOnly) {
            let html = await got.get(`https://tiktok.com/@video/video/${obj.postId}`, { headers: { "user-agent": genericUserAgent } });
            html.on('error', (err) => {
                return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', 'tiktok') };
            });
            html = html.body;
            if (html.includes(',"preloadList":[{"url":"')) {
                return {
                    urls: unicodeDecode(html.split(',"preloadList":[{"url":"')[1].split('","id":"')[0].trim()),
                    audioFilename: `tiktok_${obj.postId}_audio`,
                    filename: `tiktok_${obj.postId}.mp4`
                };
            } else {
                return { error: loc(obj.lang, 'ErrorEmptyDownload') };
            }
        } else {
            let detail = await got.get(`https://api.tiktokv.com/aweme/v1/aweme/detail/?aweme_id=${obj.postId}`);
            detail.on('error', (err) => {
                return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', 'tiktok') };
            });
            detail = JSON.parse(detail.body);
            let video = detail["aweme_detail"]["video"]["play_addr"]["url_list"][0];
            let audio = obj.isAudioOnly ? detail["aweme_detail"]["music"]["play_url"]["url_list"][0] : false;
            if (audio && obj.fullAudio) {
                return {
                    urls: audio,
                    audioFilename: `tiktok_${obj.postId}_audio_full`,
                    isAudio: true
                }
            } else if (audio && audio.slice(-4) == ".mp3") {
                return {
                    urls: audio,
                    audioFilename: `tiktok_${obj.postId}_audio`,
                    isAudio: true,
                    isMp3: true,
                };
            } else if (video) {
                return {
                    urls: video,
                    audioFilename: `tiktok_${obj.postId}_audio`,
                    filename: `tiktok_${obj.postId}_nw.mp4`
                };
            } else {
                return { error: loc(obj.lang, 'ErrorEmptyDownload') };
            }
        }
    } catch (e) {
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}
