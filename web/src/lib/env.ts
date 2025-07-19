import * as _env from "$env/static/public";

const getEnv = (_key: string) => {
    const env = _env as Record<string, string | undefined>;
    const key = `WEB_${_key}`;

    if (key in env) {
        return env[key];
    }
}

const getEnvBool = (key: string) => {
    const value = getEnv(key);
    return value && ['1', 'true'].includes(value.toLowerCase());
}

const variables = {
    HOST: getEnv('HOST'),
    PLAUSIBLE_HOST: getEnv('PLAUSIBLE_HOST'),
    PLAUSIBLE_ENABLED: getEnv('HOST') && getEnv('PLAUSIBLE_HOST'),
    DEFAULT_API: getEnv('DEFAULT_API'),
    ENABLE_WEBCODECS: getEnvBool('ENABLE_WEBCODECS'),
    ENABLE_DEPRECATED_YOUTUBE_HLS: getEnvBool('ENABLE_DEPRECATED_YOUTUBE_HLS'),
}

const contacts = {
    discord: "https://discord.gg/pQPt8HBUPu",
    twitter: "https://x.com/justusecobalt",
    github: "https://github.com/imputnet/cobalt",
    bluesky: "https://bsky.app/profile/cobalt.tools",
    telegram_ru: "https://t.me/justusecobalt_ru",
}

const partners = {
    royalehosting: "https://royalehosting.net/?partner=cobalt",
}

const donate = {
    stripe: "https://donate.stripe.com/3cs2cc6ew1Qda4wbII",
    liberapay: "https://liberapay.com/imput/donate",
    crypto: {
        ethereum: "0xDA47A671B2411468E8320916C3e57D2F60FE7197",
        monero: "463y93PsQDTYGVPAHUNcjiYDsxWjn7bL2FS9GYXjetEH5XEoNKB7kCHHQXsuoebbSv8RqGspo61pxhMQQrudDky2AfTGbs3",
        solana: "BWPQpPvSyfauUm1BwmV55qE1vJT56Pc6qHrNFzCmtmFJ",
        litecoin: "ltc1qfdemqtfsj7pgnfmtv7n5agtrh0yzwk2pzgr96y",
        bitcoin: "bc1qeqd27qknt3fwvuzpvv2ne730klggggwcqm43yq",
        ton: "UQBosUGIkvZcV8k02bdm-lRFLXrlr1A_sdO1FnXhAsUOLx1S",
    },
    other: {
        boosty: "https://boosty.to/wukko/donate",
    }
};

const siriShortcuts = {
    photos: "https://www.icloud.com/shortcuts/14e9aebf04b24156acc34ceccf7e6fcd",
    files: "https://www.icloud.com/shortcuts/2134cd9d4d6b41448b2201f933542b2e",
};

const docs = {
    instanceHosting: "https://github.com/imputnet/cobalt/blob/main/docs/run-an-instance.md",
    webLicense: "https://github.com/imputnet/cobalt/blob/main/web/LICENSE",
    apiLicense: "https://github.com/imputnet/cobalt/blob/main/api/LICENSE",
};

const officialApiURL = "https://api.cobalt.tools";

export { donate, officialApiURL, contacts, partners, siriShortcuts, docs };
export default variables;
