const friendlyNames = {
    bsky: "bluesky",
    twitch: "twitch clips"
}

export const friendlyServiceName = (service) => {
    if (service in friendlyNames) {
        return friendlyNames[service];
    }
    return service;
}
