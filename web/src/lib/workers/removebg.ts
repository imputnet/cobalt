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

export const removeImageBackground = async (file: File) => {
    const image = await RawImage.fromBlob(new Blob([file]));

    const model_type = "light";
    const model = await AutoModel.from_pretrained(models[model_type].id, {
        device: "wasm",
        dtype: "fp32",
    });

    const processor = await AutoProcessor.from_pretrained(models[model_type].id, {});

    if (model && processor) {
        const { pixel_values } = await processor(image);

        const { output } = await model({ [models[model_type].input]: pixel_values });

        const mask = await RawImage.fromTensor(output[0].mul(255).to('uint8')).resize(image.width, image.height);

        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        ctx.drawImage(image.toCanvas(), 0, 0);

        const pixelData = ctx.getImageData(0, 0, image.width, image.height);
        for (let i = 0; i < mask.data.length; ++i) {
            pixelData.data[4 * i + 3] = mask.data[i];
        }
        ctx.putImageData(pixelData, 0, 0);

        return canvas;
    }
}
