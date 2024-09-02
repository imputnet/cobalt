import "dotenv/config";

import { services } from "../processing/service-config.js";
import { extract } from "../processing/url.js";
import match from "../processing/match.js";
import { loadJSON } from "../misc/load-from-fs.js";
import { normalizeRequest } from "../processing/request.js";
import { env } from "../config.js";

env.apiURL = 'http://localhost:9000'
let tests = loadJSON('./src/util/tests.json');

let noTest = [];
let failed = [];
let success = 0;

function addToFail(service, testName, url, status, response) {
    failed.push({
        service: service,
        name: testName,
        url: url,
        status: status,
        response: response
    })
}
for (let i in services) {
    if (tests[i]) {
        console.log(`\nRunning tests for ${i}...\n`)
        for (let k = 0; k < tests[i].length; k++) {
            let test = tests[i][k];

            console.log(`Running test ${k+1}: ${test.name}`);
            console.log('params:');
            let params = {...{url: test.url}, ...test.params};
            console.log(params);

            let chck = await normalizeRequest(params);
            if (chck.success) {
                chck = chck.data;

                const parsed = extract(chck.url);
                if (parsed === null) {
                    throw `Invalid URL: ${chck.url}`
                }

                let j = await match({
                    host: parsed.host,
                    patternMatch: parsed.patternMatch,
                    params: chck,
                });
                console.log('\nReceived:');
                console.log(j)
                if (j.status === test.expected.code && j.body.status === test.expected.status) {
                    console.log("\n✅ Success.\n");
                    success++
                } else {
                    console.log(`\n❌ Fail. Expected: ${test.expected.code} & ${test.expected.status}, received: ${j.status} & ${j.body.status}\n`);
                    addToFail(i, test.name, test.url, j.body.status, j)
                }
            } else {
                console.log("\n❌ couldn't validate the request JSON.\n");
                addToFail(i, test.name, test.url, "unknown", {})
            }
        }
        console.log("\n\n")
    } else {
        console.warn(`No tests found for ${i}.`);
        noTest.push(i)
    }
}

console.log(`✅ ${success} tests succeeded.`);
console.log(`❌ ${failed.length} tests failed.`);
console.log(`❔ ${noTest.length} services weren't tested.`);

if (failed.length > 0) {
    console.log(`\nFailed tests:`);
    console.log(failed)
}

if (noTest.length > 0) {
    console.log(`\nMissing tests:`);
    console.log(noTest)
}
