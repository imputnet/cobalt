import { env } from "../config.js";
import { runTest } from "../misc/run-test.js";
import { loadJSON } from "../misc/load-from-fs.js";
import { Red, Bright } from "../misc/console-text.js";
import { randomizeCiphers } from "../misc/randomize-ciphers.js";

import { services } from "../processing/service-config.js";

const tests = loadJSON('./src/util/tests.json');

// services that are known to frequently fail due to external
// factors (e.g. rate limiting)
const finnicky = new Set(['bilibili', 'instagram', 'facebook', 'youtube'])

const action = process.argv[2];
switch (action) {
    case "get-services":
        const fromConfig = Object.keys(services);

        const missingTests = fromConfig.filter(
            service => !tests[service] || tests[service].length === 0
        );

        if (missingTests.length) {
            console.error('services have no tests:', missingTests);
            console.log('[]');
            process.exitCode = 1;
            break;
        }

        console.log(JSON.stringify(fromConfig));
        break;

    case "run-tests-for":
        const service = process.argv[3];
        let failed = false;

        if (!tests[service]) {
            console.error('no such service:', service);
        }

        env.streamLifespan = 10000;
        env.apiURL = 'http://x';
        randomizeCiphers();

        for (const test of tests[service]) {
            const { name, url, params, expected } = test;
            const canFail = test.canFail || finnicky.has(service);

            try {
                await runTest(url, params, expected);
                console.log(`${service}/${name}: ok`);

            } catch(e) {
                failed = !canFail;

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

        process.exitCode = Number(failed);
        break;
    default:
        console.error('invalid action:', action);
        process.exitCode = 1;
}
