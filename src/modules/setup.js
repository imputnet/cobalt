import { existsSync, unlinkSync, appendFileSync } from "fs";
import { createInterface } from "readline";
import { Cyan, Bright } from "./sub/consoleText.js";
import { execSync } from "child_process";

let envPath = './.env';
let q = `${Cyan('?')} \x1b[1m`;
let ob = {}
let rl = createInterface({ input: process.stdin, output: process.stdout });

let final = () => {
    if (existsSync(envPath)) {
        unlinkSync(envPath)
    }
    for (let i in ob) {
        appendFileSync(envPath, `${i}=${ob[i]}\n`)
    }
    console.log(Bright("\nAwesome! I've created a fresh .env file for you."))
    console.log(`${Bright("Now I'll run")} ${Cyan("npm install")} ${Bright("to install all dependencies. It shouldn't take long.\n\n")}`)
    execSync('npm install', { stdio: [0, 1, 2] });
    console.log(`\n\n${Cyan("All done!\n")}`)
    console.log(Bright("You can re-run this script at any time to update the configuration."))
    console.log(Bright("\nYou're now ready to start cobalt. Simply run ") + Cyan("npm start") + Bright('!\nHave fun :)')) 
    rl.close()
}

console.log(
    `${Cyan("Welcome to cobalt!")}\n${Bright("Let's start by creating a new ")}${Cyan(".env")}${Bright(" file. You can always change it later.")}`
)
console.log(
    Bright("\nWhat's the domain this instance will be running on? (localhost)\nExample: co.wukko.me")
)

rl.question(q, r1 => {
    ob['selfURL'] = `http://localhost:9000/`
    ob['port'] = 9000
    if (r1) ob['selfURL'] = `https://${r1}/`

    console.log(Bright("\nGreat! Now, what's the port it'll be running on? (9000)"))

    rl.question(q, r2 => {
        if (r2) ob['port'] = r2
        if (!r1 && r2) ob['selfURL'] = `http://localhost:${r2}/`

        console.log(Bright("\nWould you like to enable CORS? It allows other websites and extensions to use your instance's API.\ny/n (n)"))

        rl.question(q, r3 => {
            if (r3.toLowerCase() !== 'y') ob['cors'] = '0'
            final()
        })
    });
})
