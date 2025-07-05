# Cobalt 项目架构分析与二次开发方案

## 项目概述

Cobalt 是一个开源的视频下载工具，采用现代化的前后端分离架构，支持多个主流视频平台的内容下载。

## 技术栈分析

### 后端 API (api/)
- **运行时**: Node.js (>= 18)
- **框架**: Express.js 4.21.2
- **语言**: JavaScript ES6+ (ESM 模块)
- **核心依赖**:
  - `express-rate-limit`: API 限流
  - `ffmpeg-static`: 视频处理
  - `undici`: HTTP 客户端
  - `zod`: 数据验证
  - `cors`: 跨域处理
  - `redis`: 缓存存储 (可选)
  - `@imput/youtubei.js`: YouTube 专用处理库

### 前端 Web (web/)
- **框架**: SvelteKit (Svelte 5.0)
- **构建工具**: Vite 5.4.4
- **语言**: TypeScript 5.5
- **样式系统**: 原生 CSS (CSS Variables + 暗黑模式)
- **字体**: IBM Plex Mono (等宽字体)
- **图标**: Tabler Icons
- **国际化**: sveltekit-i18n 
- **适配器**: @sveltejs/adapter-static (静态构建)

### 包管理
- **工具**: pnpm (>= 9)
- **架构**: Monorepo (pnpm-workspace)

## 核心架构分析

### 1. 后端架构

#### 服务发现与路由机制
```
URL 输入 → service-patterns.js (URL 模式匹配) → match.js (服务分发) → 具体服务处理器
```

- **service-patterns.js**: 定义各平台的 URL 匹配规则
- **match.js**: 核心分发器，根据匹配结果调用对应的服务处理器
- **services/**: 各平台的具体实现

#### 服务处理器标准结构
以 `xiaohongshu.js` 为例：
```javascript
export default async function ({ id, token, shareId, h265, isAudioOnly, dispatcher }) {
    // 1. URL 解析和重定向处理
    // 2. 获取页面内容
    // 3. 解析 JSON 数据
    // 4. 提取媒体链接
    // 5. 返回标准响应格式
}
```

#### 流处理架构
- **stream/**: 处理媒体流的代理、转换、管理
- **processing/**: 处理下载请求的核心逻辑
- **security/**: JWT、API密钥、验证码等安全处理

### 2. 前端架构

#### 组件化结构
```
src/components/
├── save/           # 核心下载功能组件
├── sidebar/        # 侧边栏导航
├── dialog/         # 弹窗组件
├── settings/       # 设置页面组件
├── misc/          # 通用组件
└── icons/         # 图标组件
```

#### 状态管理
- 使用 Svelte 的响应式系统
- `lib/state/`: 全局状态管理
- `lib/settings/`: 用户设置管理
- `lib/storage/`: 本地存储抽象

#### 样式系统特点
- 基于 CSS Variables 的主题系统
- 支持明暗模式切换
- 响应式设计
- 可访问性友好

## 已支持的平台

目前已支持 **21个** 视频平台：
- YouTube, TikTok, Instagram, Twitter/X
- Bilibili, 小红书 (已支持!)
- Reddit, Vimeo, SoundCloud
- Facebook, Pinterest, Tumblr
- Twitch, Snapchat, VK, OK.ru
- Dailymotion, Rutube, Loom
- Streamable, Bluesky

## 二次开发方案

### 1. 新增平台支持 (以微信视频号为例)

#### 步骤1: 添加 URL 模式匹配
在 `api/src/processing/service-patterns.js` 中添加：
```javascript
"wechat-channels": pattern =>
    pattern.channelId?.length <= 32 && pattern.videoId?.length <= 64
    || pattern.shortLink?.length <= 32,
```

#### 步骤2: 创建服务处理器
创建 `api/src/processing/services/wechat-channels.js`：
```javascript
export default async function ({ channelId, videoId, shortLink, dispatcher }) {
    // 实现微信视频号的解析逻辑
    // 1. 处理短链接重定向
    // 2. 获取视频页面
    // 3. 解析视频数据
    // 4. 返回标准格式
}
```

#### 步骤3: 注册服务
在 `api/src/processing/match.js` 中：
```javascript
import wechatChannels from "./services/wechat-channels.js";

// 在 switch 语句中添加
case "wechat-channels":
    r = await wechatChannels({
        ...patternMatch,
        dispatcher,
    });
    break;
```

### 2. 样式系统重构方案

#### 方案A: 渐进式引入 Tailwind CSS

1. **安装依赖**:
```bash
pnpm add -D tailwindcss @tailwindcss/forms @tailwindcss/typography autoprefixer
```

2. **配置 Tailwind**:
```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
      },
      colors: {
        // 复用现有的 CSS Variables
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        // ... 更多颜色
      }
    }
  }
}
```

3. **保持兼容性**:
   - 保留现有的 CSS Variables 系统
   - 逐步替换组件样式
   - 新组件使用 Tailwind

#### 方案B: 引入 shadcn/ui (推荐)

1. **创建设计系统基础**:
```bash
# 安装 shadcn/ui 兼容的依赖
pnpm add class-variance-authority clsx tailwind-merge
pnpm add -D @tailwindcss/forms @tailwindcss/typography
```

2. **创建 Svelte 版本的 shadcn 组件**:
```
src/lib/components/ui/
├── button/
├── input/
├── dialog/
├── card/
└── ...
```

3. **样式变量映射**:
```css
/* 将现有的设计令牌映射到 shadcn 的语义化变量 */
:root {
  --background: var(--primary);
  --foreground: var(--secondary);
  --muted: var(--button);
  --border: var(--content-border);
  /* ... */
}
```

### 3. 现代化改进建议

#### UI/UX 优化
1. **引入现代设计语言**:
   - 使用更大的边框半径 (16px+)
   - 添加微妙的阴影和渐变
   - 引入玻璃态效果 (glassmorphism)

2. **增强交互体验**:
   - 添加微动画和过渡效果
   - 优化触摸交互和手势
   - 改进加载状态显示

3. **布局优化**:
   - 响应式网格系统
   - 更好的移动端适配
   - 改进的导航结构

#### 功能扩展
1. **批量下载功能**
2. **下载队列管理**
3. **用户偏好记忆**
4. **下载历史记录**
5. **云同步设置**

### 4. 开发工作流建议

#### 项目结构调整
```
cobalt-custom/
├── api/              # 保持现有结构
├── web/              
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/
│   │   │   │   ├── ui/        # 新的设计系统组件
│   │   │   │   └── custom/    # 自定义业务组件
│   │   │   └── styles/
│   │   │       ├── globals.css # Tailwind base
│   │   │       └── components.css # 组件样式
│   │   └── routes/
└── packages/
    └── design-system/  # 可选：独立的设计系统包
```

#### 开发步骤
1. **阶段1**: 基础样式重构 (2-3周)
   - 引入 Tailwind + shadcn
   - 重构核心组件
   - 建立新的设计规范

2. **阶段2**: 新平台支持 (2-4周)
   - 微信视频号支持
   - 其他平台扩展
   - 测试和优化

3. **阶段3**: 功能增强 (3-4周)
   - 高级功能开发
   - 用户体验优化
   - 性能调优

### 5. 技术考虑

#### 保持核心优势
- 保留 SvelteKit 的性能优势
- 维持现有的 API 架构
- 保持无后端状态的设计

#### 扩展性设计
- 服务插件化架构
- 主题系统可扩展
- 配置驱动的功能开关

#### 部署和分发
- 静态站点部署
- Docker 容器化
- CDN 优化

## 总结

Cobalt 项目有着清晰的架构和良好的扩展性基础。您的二次开发计划完全可行：

1. **平台扩展**: 架构已支持快速添加新平台
2. **样式重构**: 可以在保持功能的同时全面改造UI
3. **现代化升级**: Tailwind + shadcn 的组合将带来更好的开发体验

建议从样式系统重构开始，并行进行新平台支持的开发，这样可以快速看到成果并保持开发动力。