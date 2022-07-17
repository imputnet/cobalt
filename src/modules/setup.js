import { randomBytes } from "crypto";
import { existsSync, unlinkSync, appendFileSync } from "fs";
import { createInterface } from "readline";
import { Cyan, Bright, Green } from "./sub/consoleText.js";
import { execSync } from "child_process";

let envPath = './.env';
let q = `${Cyan('?')} \x1b[1m`;
let ob = { streamSalt: randomBytes(64).toString('hex') }
let rl = createInterface({ input: process.stdin,output: process.stdout });

console.log(
    `${Cyan("Welcome to cobalt!")}\n${Bright("We'll get you up and running in no time.\nLet's start by creating a ")}${Cyan(".env")}${Bright(" file. You can always change it later.")}`
)
console.log(
    Bright("\nWhat's the selfURL we'll be running on? (localhost)")
)

rl.question(q, r1 => {
    if (r1) {
        ob['selfURL'] = `https://${r1}/`
    } else {
        ob['selfURL'] = `http://localhost`
    }
    console.log(Bright("\nGreat! Now, what's the port we'll be running on? (9000)"))
    rl.question(q, r2 => {
        if (!r1 && !r2) {
            ob['selfURL'] = `http://localhost:9000/`
            ob['port'] = 9000
        } else if (!r1 && r2) {
            ob['selfURL'] = `http://localhost:${r2}/`
            ob['port'] = r2
        } else {
            ob['port'] = r2
        }
        final()
    });
})

let final = () => {
    if (existsSync(envPath)) {
        unlinkSync(envPath)
    }
    for (let i in ob) {
        appendFileSync(envPath, `${i}=${ob[i]}\n`)
    }
    console.log(Bright("\nI've created a .env file with selfURL, port, and stream salt."))
    console.log(`${Bright("Now I'll run")} ${Cyan("npm install")} ${Bright("to install all dependencies. It shouldn't take long.\n\n")}`)
    execSync('npm install',{stdio:[0,1,2]});
    console.log(`\n\n${Green("All done!\n")}`)
    console.log("You can re-run this script any time to update the configuration.")
    console.log("\nYou're now ready to start the main project.\nHave fun!")
    rl.close()
}