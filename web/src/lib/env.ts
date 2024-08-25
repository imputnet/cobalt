import { env } from "$env/dynamic/public";

const variables = {
    HOST: env.PUBLIC_HOST,
    PLAUSIBLE_HOST: env.PUBLIC_PLAUSIBLE_HOST,
    PLAUSIBLE_ENABLED: env.PUBLIC_HOST && env.PUBLIC_PLAUSIBLE_HOST,
    DEFAULT_API: env.PUBLIC_DEFAULT_API,
    TURNSTILE_KEY: env.PUBLIC_TURNSTILE_KEY,
}

const contacts = {
    github: "https://github.com/imputnet/cobalt",
    twitter: "https://x.com/justusecobalt",
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
    }
};

const apiURL = "https://api.cobalt.tools";

export { donate, apiURL, contacts };
export default variables;
