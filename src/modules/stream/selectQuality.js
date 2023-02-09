import { services, quality as mq } from "../config.js";

// TO-DO: remake entirety of this module to be more of how quality picking is done in vimeo module
function closest(goal, array) {
    return array.sort().reduce(function (prev, curr) {
        return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
    });
}

export default function(service, quality, maxQuality) {
    if (quality == "max") return maxQuality;

    quality = parseInt(mq[quality], 10)
    maxQuality = parseInt(maxQuality, 10)

    if (quality >= maxQuality || quality == maxQuality) return maxQuality;

    if (quality < maxQuality) {
        if (!services[service]["quality"][quality]) {
            let s = Object.keys(services[service]["quality_match"]).filter((q) => {
                if (q <= quality) {
                    return true
                }
            })
            return closest(quality, s)
        }
        return quality
    }
}
