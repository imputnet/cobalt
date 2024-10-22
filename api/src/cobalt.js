import "dotenv/config";

import express from "express";

import path from "path";
import { fileURLToPath } from "url";

import { env } from "./config.js"
import { Red } from "./misc/console-text.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename).slice(0, -4);

app.disable("x-powered-by");

if (env.apiURL) {
    const { runAPI } = await import("./core/api.js");
    runAPI(express, app, __dirname)
} else {
    console.log(
        Red("API_URL env variable is missing, cobalt api can't start.")
    )
}
