#!/usr/bin/env node

// 开发环境启动脚本 - 设置cookies.json路径
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cookiesPath = resolve(__dirname, '../cookies.json');

// 设置环境变量
process.env.COOKIE_PATH = cookiesPath;

console.log(`======> [dev-start] Setting COOKIE_PATH to: ${cookiesPath}`);
console.log(`======> [dev-start] YouTube authentication will be required for all downloads`);

// 导入并启动主应用
import('./src/cobalt.js').catch(err => {
    console.error('Failed to start application:', err);
    process.exit(1);
});
