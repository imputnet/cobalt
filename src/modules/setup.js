import { randomBytes } from "crypto";
import { existsSync, unlinkSync, appendFileSync } from "fs";
import { createInterface } from "readline";
import { Cyan, Bright, Green , Red} from "./sub/consoleText.js";
import { execSync } from "child_process";

let ip = false
let envPath = './.env';
let q = `${Cyan('?')} \x1b[1m`;
let ob = { streamSalt: randomBytes(64).toString('hex') }
let rl = createInterface({ input: process.stdin, output: process.stdout });

const badInputError = "\nNext time enter valid input, ok?"
const unknownError = "\nUnknown error. Please report: https://github.com/wukko/cobalt/issues or can try againg."

const validNumericPortRegex = "([1-9][0-9]{0,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5])";
const validIPAddressRegex = "(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
const validHostnameRegex = "(((?!\-))(xn\-\-)?[a-z0-9\-_]{0,61}[a-z0-9]{1,1}\.)*(xn\-\-)?([a-z0-9\-]{1,61}|[a-z0-9\-]{1,30})\.[a-z]{2,}";

function fullMatchRegexp(s, r) {
    var sum_length = 0
    var found = s.match(r)

    if (found !== null) {
        sum_length += found[0].length
    }

    if (sum_length == s.length) {
        return true
    } else {
        return false
    }
}

let final = () => {
    if (existsSync(envPath)) {
        unlinkSync(envPath)
    }
    for (let i in ob) {
        appendFileSync(envPath, `${i}=${ob[i]}\n`)
    }
    console.log(Bright("\nI've created a .env file with selfURL, port, and stream salt."))
    console.log(`${Bright("Now I'll run")} ${Cyan("npm install")} ${Bright("to install all dependencies. It shouldn't take long.\n\n")}`)
    execSync('npm install', { stdio: [0, 1, 2] });
    console.log(`\n\n${Green("All done!\n")}`)
    console.log("You can re-run this script any time to update the configuration.")
    console.log("\nYou're now ready to start the main project.\nHave fun!")
}

console.log(
    `${Cyan("Welcome to cobalt!")}\n${Bright("We'll get you up and running in no time.\nLet's start by creating a ")}${Cyan(".env")}${Bright(" file. You can always change it later.")}`
)

console.log(
    Bright("\nDo you prefer:\n 1) 'http'\n 2) 'https'\n\nFor 'https' on '127.0.0.1', 'localhost', you must turn off 'HTTPS-Only Mode' in your browser.")
)

rl.question(q, r1 => {
    if (r1.length == 1){
        if (r1 == 1) { // HTTP
            ob['selfURL'] = 'http://'
        } else if (r1 == 2){ // HTTP(S)
            ob['selfURL'] = 'https://'
        } else {
            console.error(Red(badInputError))
            process.exit(1)
        }
    } else {
        console.error(Red(badInputError))
        process.exit(1)
    }
    
    console.log("\nDo you prefer to specify:\n 1) 'IP'\n 2) 'Domain'")
    rl.question(q, r2 => {
        if (r2.length == 1) {
            if (r2 == 1) { // IP
                ip = true
            } else if (r2 == 2) { // Domain
                ip = false
            } else {
                console.error(Red(badInputError))
                process.exit(1)
            }
        } else {
            console.error(Red(badInputError))
            process.exit(1)
        }
        
        console.log(Bright("\nOn which domain name (Latin alphabet only) or IP address will it run? (For local network usage: '127.0.0.1', 'localhost')"))
        rl.question(q, r3 => {
            if (ip) { // IP
                if (r3 === "127.0.0.1") { // '127.0.0.1'
                    ob['selfURL'] += "127.0.0.1"
                } else if (fullMatchRegexp(r3, validIPAddressRegex) && !fullMatchRegexp(r3, validHostnameRegex)) {
                    ob['selfURL'] += `${r3}`
                } else {
                    console.error(Red("In your input wrong IP-address. If you need to use a domain name, select the correct item. In case of an unknown error, report: https://github.com/wukko/cobalt/issues."))
                    process.exit(1)
                }
            } else if (!ip) { // Domain
                if (r3 === 'localhost') { // 'localhost' is not the same as '127.0.0.1' is 'local domain'
                    ob['selfURL'] += "localhost"
                } else if (!fullMatchRegexp(r3, validIPAddressRegex) && fullMatchRegexp(r3, validHostnameRegex)) {
                    ob['selfURL'] += `${r3}`
                } else {
                    console.error(Red("In your input wrong domain name. If you need to use a IP-address, select the correct item. In case of an unknown error, report: https://github.com/wukko/cobalt/issues."))
                    process.exit(1)
                }
            } else {
                console.error(Red(unknownError))
                process.exit(1)
            }
            
            console.log(Bright("\nGreat! Now, what's the port we'll be running on?"))
            rl.question(q, r4 => {
                if (!r4.includes(".")){
                    if (r4.length <= 5) {
                        if (fullMatchRegexp(r4, validNumericPortRegex) && parseInt(r4, 10) <= 65535 && parseInt(r4, 10) > 0) {
                            ob['selfURL'] += `:${r4}/`
                            ob['port'] = `${r4}`
                            final()
                            console.log(Bright("\nGreat! You did it! After start you can access and use the application at only this URL:\n"), ob['selfURL'])
                        } else {
                            console.error(Red(badInputError))
                            process.exit(1)
                        }
                    } else {
                        console.error(Red(badInputError))
                        process.exit(1)
                    }
                } else {
                    console.error(Red(badInputError))
                    process.exit(1)
                }
                rl.close()
            });
        });
    });
})
