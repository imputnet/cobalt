import path from "node:path";

import { env } from "../config.js";
import { runTest } from "../misc/run-test.js";
import { loadJSON } from "../misc/load-from-fs.js";
import { Red, Bright } from "../misc/console-text.js";
import { setGlobalDispatcher, EnvHttpProxyAgent, ProxyAgent } from "undici";
import { randomizeCiphers } from "../misc/randomize-ciphers.js";

import { services } from "../processing/service-config.js";

const getTestPath = service => path.join('./src/util/tests/', `./${service}.json`);
const getTests = (service) => loadJSON(getTestPath(service));

// services that are known to frequently fail due to external
// factors (e.g. rate limiting)
const finnicky = new Set(
    process.env.TEST_IGNORE_SERVICES
    ? process.env.TEST_IGNORE_SERVICES.split(',')
    : ['bilibili', 'instagram', 'facebook', 'youtube', 'vk', 'twitter', 'reddit']
);

const runTestsFor = async (service) => {
    const tests = getTests(service);
    let softFails = 0, fails = 0;

    if (!tests) {
        throw "no such service: " + service;
    }

    for (const test of tests) {
        const { name, url, params, expected } = test;
        const canFail = test.canFail || finnicky.has(service);

        try {
            await runTest(url, params, expected);
            console.log(`${service}/${name}: ok`);

        } catch (e) {
            softFails += !canFail;
            fails++;

            let failText = canFail ? `${Red('FAIL')} (ignored)` : Bright(Red('FAIL'));
            if (canFail && process.env.GITHUB_ACTION) {
                console.log(`::warning title=${service}/${name.replace(/,/g, ';')}::failed and was ignored`);
            }

            console.error(`${service}/${name}: ${failText}`);
            const errorString = e.toString().split('\n');
            let c = '┃';
            errorString.forEach((line, index) => {
                line = line.replace('!=', Red('!='));

                if (index === errorString.length - 1) {
                    c = '┗';
                }

                console.error(`   ${c}`, line);
            });
        }
    }

    return { fails, softFails };
}

const printHeader = (service, padLen) => {
    const padding = padLen - service.length;
    service = service.padEnd(1 + service.length + padding, ' ');
    console.log(service + '='.repeat(50));
}

// TODO: remove env.externalProxy in a future version
setGlobalDispatcher(
    new EnvHttpProxyAgent({ httpProxy: env.externalProxy || undefined })
);

env.streamLifespan = 10000;
env.apiURL = 'http://x/';
randomizeCiphers();

const action = process.argv[2];
switch (action) {
    case "get-services":
        const fromConfig = Object.keys(services);

        const missingTests = fromConfig.filter(
            service => {
                const tests = getTests(service);
                return !tests || tests.length === 0
            }
        );

        if (missingTests.length) {
            console.error('services have no tests:', missingTests);
            process.exitCode = 1;
            break;
        }

        console.log(JSON.stringify(fromConfig));
        break;

    case "run-tests-for":

        try {
            const { softFails } = await runTestsFor(process.argv[3]);
            process.exitCode = Number(!!softFails);
        } catch (e) {
            console.error(e);
            process.exitCode = 1;
            break;
        }

        break;
    default:
        const maxHeaderLen = Object.keys(services).reduce((n, v) => v.length > n ? v.length : n, 0);
        const failCounters = {};

        for (const service in services) {
            printHeader(service, maxHeaderLen);
            const { fails, softFails } = await runTestsFor(service);
            failCounters[service] = fails;
            console.log();

            if (!process.exitCode && softFails)
                process.exitCode = 1;
        }

        console.log('='.repeat(50 + maxHeaderLen));
        console.log(
            Bright('total fails:'),
            Object.values(failCounters).reduce((a, b) => a + b)
        );
        for (const [ service, fails ] of Object.entries(failCounters)) {
            if (fails) console.log(`${Bright(service)} fails: ${fails}`);
        }
}
