#!/usr/bin/env node

// Cookie验证工具 - 检查cookies.json的有效性
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cookiesPath = process.argv[2] || resolve(__dirname, '../cookies.json');

console.log(`======> [verify-cookies] Verifying cookies at: ${cookiesPath}`);

if (!existsSync(cookiesPath)) {
    console.log(`======> [verify-cookies] ❌ cookies.json not found at: ${cookiesPath}`);
    process.exit(1);
}

try {
    const cookies = JSON.parse(readFileSync(cookiesPath, 'utf8'));
    console.log(`======> [verify-cookies] ✅ cookies.json loaded successfully`);
    
    // 检查YouTube相关cookies
    const hasYouTubeOAuth = cookies.youtube_oauth && cookies.youtube_oauth.length > 0;
    const hasYouTubeRegular = cookies.youtube && cookies.youtube.length > 0;
    
    console.log(`======> [verify-cookies] YouTube OAuth cookies: ${hasYouTubeOAuth ? '✅ Found' : '❌ Missing'}`);
    console.log(`======> [verify-cookies] YouTube regular cookies: ${hasYouTubeRegular ? '✅ Found' : '❌ Missing'}`);
    
    if (hasYouTubeOAuth) {
        const oauthCookie = cookies.youtube_oauth[0];
        if (oauthCookie.includes('<your_oauth_token>')) {
            console.log(`======> [verify-cookies] ⚠️  YouTube OAuth contains placeholder values`);
            console.log(`======> [verify-cookies] Please run: npm run setup-youtube`);
        } else {
            console.log(`======> [verify-cookies] ✅ YouTube OAuth appears to be configured`);
        }
    }
    
    if (!hasYouTubeOAuth && !hasYouTubeRegular) {
        console.log(`======> [verify-cookies] ❌ No YouTube authentication found!`);
        console.log(`======> [verify-cookies] YouTube downloads will fail without authentication`);
        console.log(`======> [verify-cookies] Please run: npm run setup-youtube`);
        process.exit(1);
    }
    
    console.log(`======> [verify-cookies] ✅ Cookie verification completed`);
    
} catch (error) {
    console.log(`======> [verify-cookies] ❌ Error reading cookies.json: ${error.message}`);
    process.exit(1);
}
