const friendlyNames = {
    bsky: "bluesky",
}
const friendlyKeys = Object.keys(friendlyNames);

export const friendlyServiceName = (service) => {
    if (service in friendlyKeys) {
        return friendlyNames[service];
    }
    return service;
}
