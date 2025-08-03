# .

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Environment Configuration

Create a `.env.local` file in the web directory to configure the API server URL:

```bash
# API 服务器地址配置
VITE_DEFAULT_API=http://localhost:9000/
# 或者使用
WEB_DEFAULT_API=http://localhost:9000/

# 生产环境示例
# VITE_DEFAULT_API=https://your-api-domain.com/
# WEB_DEFAULT_API=https://your-api-domain.com/
```

If no environment variable is set, the application will default to `http://localhost:9000/`.

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
