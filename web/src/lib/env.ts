import { env } from "$env/dynamic/public";

const variables = {
    HOST: env.PUBLIC_HOST,
    PLAUSIBLE_HOST: env.PUBLIC_PLAUSIBLE_HOST,
    PLAUSIBLE_ENABLED: env.PUBLIC_HOST && env.PUBLIC_PLAUSIBLE_HOST,
}

const donate = {
    stripe: 'https://donate.stripe.com/3cs2cc6ew1Qda4wbII',
    liberapay: 'https://liberapay.com/imput/donate',
    crypto: {
        monero: '4B1SNB6s8Pq1hxjNeKPEe8Qa8EP3zdL16Sqsa7QDoJcUecKQzEj9BMxWnEnTGu12doKLJBKRDUqnn6V9qfSdXpXi3Nw5Uod',
        litecoin: 'ltc1qvp0xhrk2m7pa6p6z844qcslfyxv4p3vf95rhna',
        ethereum: '0x4B4cF23051c78c7A7E0eA09d39099621c46bc302',
        tron: 'TVbx7YT3rBfu931Gxko6pRfXtedYqbgnBB',
        bitcoin: 'bc1qlvcnlnyzfsgnuxyxsv3k0p0q0yln0azjpadyx4',
        'bitcoin (legacy)': '18PKf6N2cHrmSzz9ZzTSvDd2jAkqGC7SxA',
        ton: 'UQA3SO-hHZq1oCCT--u6or6ollB8fd2o52aD8mXiLk9iDZd3'
    }
};

export { donate };
export default variables;
