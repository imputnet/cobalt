#!/usr/bin/env node

// 生成YouTube OAuth token并自动添加到cookies.json
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cookiesPath = resolve(__dirname, '../cookies.json');

console.log(`======> [setup-youtube-auth] Starting YouTube OAuth setup`);
console.log(`======> [setup-youtube-auth] Cookies file: ${cookiesPath}`);

// 检查cookies.json是否存在
if (!existsSync(cookiesPath)) {
    console.log(`======> [setup-youtube-auth] Creating new cookies.json file`);
    const defaultCookies = {
        "instagram": ["mid=<replace>; ig_did=<with>; csrftoken=<your>; ds_user_id=<own>; sessionid=<cookies>"],
        "instagram_bearer": ["token=<token_with_no_bearer_in_front>", "token=IGT:2:<looks_like_this>"],
        "reddit": ["client_id=<replace_this>; client_secret=<replace_this>; refresh_token=<replace_this>"],
        "twitter": ["auth_token=<replace_this>; ct0=<replace_this>"],
        "youtube_oauth": ["access_token=<your_oauth_token>; refresh_token=<your_refresh_token>; expires_in=<expiry>"]
    };
    writeFileSync(cookiesPath, JSON.stringify(defaultCookies, null, 2));
}

console.log(`======> [setup-youtube-auth] Running YouTube token generator...`);
console.log(`======> [setup-youtube-auth] IMPORTANT: Please follow the authentication instructions carefully`);

// 导入并运行YouTube token生成器
import('./src/util/generate-youtube-tokens.js').then(() => {
    console.log(`======> [setup-youtube-auth] OAuth token generation completed`);
    console.log(`======> [setup-youtube-auth] Please copy the generated token to ${cookiesPath}`);
    console.log(`======> [setup-youtube-auth] Replace the youtube_oauth array content with the generated token`);
}).catch(err => {
    console.error(`======> [setup-youtube-auth] Failed to generate token:`, err);
    process.exit(1);
});
