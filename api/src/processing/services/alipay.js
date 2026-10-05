import { genericUserAgent } from "../../config.js";
import { getRedirectingURL } from "../../misc/utils.js";

const gateway = "https://webgw-internet.alipay.com/contentservice/com.alipay.sofa.function.SOFAFunction/apply/myjf.yuyan.contentservice.default.ContentWebGWController.list";
const contentIdRegex = /contentId(?:%253D|%3D|=)([A-Za-z0-9]+)/;
const clarities = ["1080P_h265_EH", "1080P_h265", "720P_h265", "720P_h264", "540P_h264"];

const headers = {
    "user-agent": genericUserAgent,
    "content-type": "application/json",
    "x-webgw-appid": "180020010001266490",
    "x-webgw-version": "2.0"
};

async function getContent(contentId) {
    const json = await fetch(gateway, {
        method: "POST",
        headers,
        body: JSON.stringify({ contentId })
    }).then(r => r.json()).catch(() => {});

    if (!json?.success) return;
    return json.resultObj?.data?.[0];
}

async function pickStream(vid) {
    const [base, token] = vid.split("?t=");
    if (!token) return vid;

    const prefix = base.slice(0, base.lastIndexOf("/"));

    for (const clarity of clarities) {
        const url = `${prefix}/${clarity}?t=${token}`;
        const status = await fetch(url, {
            headers: { "user-agent": genericUserAgent, range: "bytes=0-1" }
        }).then(r => r.status).catch(() => 0);

        if (status === 200 || status === 206) return url;
    }

    return vid;
}

export default async function({ contentId, shortLink }) {
    let id = contentId;

    if (!id && shortLink) {
        const location = await getRedirectingURL(`https://ur.lepudding.com/${shortLink}`);
        id = location?.match(contentIdRegex)?.[1];
    }

    if (!id) return { error: "fetch.short_link" };

    const content = await getContent(id);
    if (!content) return { error: "fetch.fail" };

    if (!content.video?.vid) return { error: "fetch.empty" };

    const url = await pickStream(content.video.vid);

    const fileMetadata = {
        title: content.title,
        artist: content.author?.nickName
    };

    return {
        urls: url,
        filename: `alipay_${id}.mp4`,
        audioFilename: `alipay_${id}_audio`,
        fileMetadata
    };
}
