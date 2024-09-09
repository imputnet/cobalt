import * as _env from "$env/static/public";

const getEnv = (_key: string) => {
    const env = _env as Record<string, string | undefined>;
    const key = `WEB_${_key}`;

    if (key in env) {
        return env[key];
    }
}

const variables = {
    HOST: getEnv('HOST'),
    PLAUSIBLE_HOST: getEnv('PLAUSIBLE_HOST'),
    PLAUSIBLE_ENABLED: getEnv('HOST') && getEnv('PLAUSIBLE_HOST'),
    DEFAULT_API: getEnv('DEFAULT_API'),
    TURNSTILE_KEY: getEnv('TURNSTILE_KEY'),
}

const contacts = {
    discord: "https://discord.gg/pQPt8HBUPu",
    twitter: "https://x.com/justusecobalt",
    github: "https://github.com/imputnet/cobalt",
    email: "support@cobalt.tools",
    telegram_ru: "https://t.me/justusecobalt_ru",
}

const partners = {
    royalehosting: "https://royalehosting.net/?partner=cobalt",
}

const donate = {
    stripe: "https://donate.stripe.com/3cs2cc6ew1Qda4wbII",
    liberapay: "https://liberapay.com/imput/donate",
    crypto: {
        ethereum: "0x4B4cF23051c78c7A7E0eA09d39099621c46bc302",
        monero: "4B1SNB6s8Pq1hxjNeKPEe8Qa8EP3zdL16Sqsa7QDoJcUecKQzEj9BMxWnEnTGu12doKLJBKRDUqnn6V9qfSdXpXi3Nw5Uod",
        solana: "LJx4mxhvLJqDs65u4kxNgoKYGbZFfGCKGQjNApvfB7h",
        litecoin: "ltc1qvp0xhrk2m7pa6p6z844qcslfyxv4p3vf95rhna",
        bitcoin: "bc1qlvcnlnyzfsgnuxyxsv3k0p0q0yln0azjpadyx4",
        ton: "UQA3SO-hHZq1oCCT--u6or6ollB8fd2o52aD8mXiLk9iDZd3",
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

const apiURL = "https://api.cobalt.tools";

export { donate, apiURL, contacts, partners, siriShortcuts, docs };
export default variables;
