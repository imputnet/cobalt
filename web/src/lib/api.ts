const apiURL = "https://api.cobalt.tools";

const request = async (url: string) => {
    const request = {
        url
    }

    const response = await fetch(`${apiURL}/api/json`, {
        method: "POST",
        body: JSON.stringify(request),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(r => r.json()).catch(() => {});

    return response;
}

const probeCobaltStream = async (url: string) => {
    const request = await fetch(`${url}&p=1`).catch(() => {});
    if (request?.status === 200) {
        return request?.status;
    }
    return 0;
}

export default {
    request,
    probeCobaltStream,
}
