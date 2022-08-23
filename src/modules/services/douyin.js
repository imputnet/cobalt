import got from "got";
import loc from "../../localization/manager.js";
import { genericUserAgent } from "../config.js";

export default async function(obj) {
    try {
        if (!obj.postId) {
            let html = await got.get(`https://v.douyin.com/${obj.id}/`, { headers: { "user-agent": genericUserAgent } });
            html.on('error', (err) => {
                return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', 'tiktok') };
            });
            if (html.body.includes('<html><head><meta charset="UTF-8" />')) {
                obj.postId = html.url.split('video/')[1].split('?')[0]
            } else {
                obj.postId = html.body.split('video/')[1].split('/?')[0]
            }
        }
        let iteminfo = await got.get(`https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${obj.postId}`, {
            headers: {
                'authority': 'www.iesdouyin.com',
                'user-agent': genericUserAgent,
                'content-type': 'application/x-www-form-urlencoded',
                'accept': '*/*',
                'referer': `https://www.iesdouyin.com/share/video/${obj.postId}/?region=CN&u_code=15b9142gf&titleType=title&utm_source=copy_link&utm_campaign=client_share&utm_medium=android&app=aweme`,
                'accept-language': 'zh-CN,zh;q=0.9,en-GB;q=0.8,en;q=0.7'
            }
        });
        iteminfo.on('error', (err) => {
            return { error: loc(obj.lang, 'ErrorCantConnectToServiceAPI', 'douyin') };
        });
        iteminfo = JSON.parse(iteminfo.body);
        let video = iteminfo['item_list'][0]['video']['play_addr']['url_list'][0];
        let audio = obj.isAudioOnly ? iteminfo['item_list'][0]["music"]["play_url"]["url_list"][0] : false;
        if (audio && obj.fullAudio) {
            return {
                urls: audio,
                audioFilename: `douyin_${obj.postId}_audio_full`,
                isAudio: true
            }
        } else if (audio && audio.slice(-4) == ".mp3") {
            return {
                urls: audio,
                audioFilename: `douyin_${obj.postId}_audio`,
                isAudio: true,
                isMp3: true,
            };
        } else if (video) {
            if (!obj.noWatermark) {
                return {
                    urls: video,
                    audioFilename: `douyin_${obj.postId}_audio`, 
                    filename: `douyin_${obj.postId}.mp4`
                };
            } else {
                return {
                    urls: video.replace("playwm", "play"),
                    audioFilename: `douyin_${obj.postId}_audio`,
                    filename: `douyin_${obj.postId}_nw.mp4`
                };
            }
        } else {
            return { error: loc(obj.lang, 'ErrorEmptyDownload') };
        }
    } catch (e) {
        return { error: loc(obj.lang, 'ErrorBadFetch') };
    }
}
