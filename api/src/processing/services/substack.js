import { createStream } from "../../stream/manage.js";


export default async function({url}) {
    try {
        const m = url.href.match(/\/c-(\d+)(?=\b|$|[?\/#])/);
        const id = m ? m[1] : null;
        const response = await fetch("https://substack.com/api/v1/reader/comment/" + id);

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        const imageAttachments = (data.item?.comment?.attachments || []).filter(att => att.type === "image");

        const picker = imageAttachments.map((att, i) => {
            const imgUrl = att.imageUrl;
            const imageId = att.imageUrl.split("/").pop(); // extract image id for thumbnail url
            const thumbUrl = `https://substackcdn.com/image/fetch/$s_!xQMH!,w_200,c_limit,f_webp,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F${imageId}`;

            return {
                type: "photo",
                url: imgUrl,
                thumb: createStream({
                    service: "substack",
                    type: "proxy",
                    url: thumbUrl,
                    filename: `substack_${i + 1}.jpg`
                })
            };
        });

        return {
            picker
        };
        
    } catch (error) {
        return {
            picker: [],
            error: error.message
        };
    }
}