import { AutoModel, AutoProcessor, RawImage } from "@huggingface/transformers";

const models = {
    light: {
        id: "briaai/RMBG-1.4",
        input: "input",
    },
    heavy: {
        id: "onnx-community/BiRefNet_lite",
        input: "input_image",
    }
}

export const maskImage = (image: RawImage, mask: RawImage) => {
    const canvas = new OffscreenCanvas(image.width, image.height);
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    ctx.drawImage(image.toCanvas(), 0, 0);

    const pixelData = ctx.getImageData(0, 0, image.width, image.height);
    for (let i = 0; i < mask.data.length; ++i) {
        pixelData.data[4 * i + 3] = mask.data[i];
    }
    ctx.putImageData(pixelData, 0, 0);

    return canvas.transferToImageBitmap();
}

const removeImageBackground = async (file: File) => {
    const image = await RawImage.fromBlob(file);

    const model_type = "light";
    const model = await AutoModel.from_pretrained(models[model_type].id, {
        progress_callback: (progress) => {
            console.log(progress);
        },
        device: "wasm",
        dtype: "fp32",
    });

    console.log("we're past model loading!");

    const processor = await AutoProcessor.from_pretrained(models[model_type].id, {});

    console.log("now also past processor!");

    if (model && processor) {
        const { pixel_values } = await processor(image);
        console.log("got pixel values");
        const { output } = await model({ [models[model_type].input]: pixel_values });
        console.log("got output");
        const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(image.width, image.height);
        console.log("got the mask");

        self.postMessage({
            cobaltRemoveBgWorker: {
                result: maskImage(image, mask),
            }
        });
    }
}

self.onmessage = async (event: MessageEvent) => {
    if (event.data.cobaltRemoveBgWorker.file) {
        await removeImageBackground(event.data.cobaltRemoveBgWorker.file);
        self.close();
    }
}
