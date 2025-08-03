# SEO 和 Google Analytics 配置指南

## ✅ 已完成配置

### 1. Google Analytics 4 测量 ID
- ✅ 已配置测量 ID: `G-3HF8RF4RZ9`
- ✅ 已在 `web/index.html` 和 `web/src/composables/useSeo.ts` 中正确设置

### 2. 域名配置  
- ✅ 已将所有域名引用更新为: `https://www.snapmedia.app`
- ✅ 包括：Open Graph、Twitter Card、结构化数据、sitemap 等

### 3. Sitemap 优化
- ✅ 已简化为单页应用，只包含主页
- ✅ URL: `https://www.snapmedia.app/sitemap.xml`

## 📸 待添加图片文件

在 `web/public/` 目录下添加以下图片文件：

```
web/public/
├── favicon.ico (已存在)
├── apple-touch-icon.png (180x180)
├── favicon-16x16.png (16x16)  
├── favicon-32x32.png (32x32)
├── android-chrome-192x192.png (192x192)
├── android-chrome-512x512.png (512x512)
└── og-image.png (1200x630) - 用于社交分享 ⭐ 重要
```

### 生成图标文件
建议使用在线工具生成这些图标：
- [Favicon Generator](https://realfavicongenerator.net/) - 上传你的 logo，一键生成所有尺寸
- [Real Favicon Generator](https://realfavicongenerator.net/) - 最佳的 favicon 生成工具

## 📊 Analytics 事件追踪

已配置的事件：
- `download_started` - 下载开始时自动触发，包含平台、文件类型等信息
- `page_view` - 页面浏览自动追踪

## 🔧 高级功能

### 动态 SEO 管理
使用 `useSeo` composable 在不同场景设置不同的 SEO 信息：

```typescript
import { useSeo } from '@/composables/useSeo'

const { setSeo, trackEvent } = useSeo()

// 自定义页面 SEO
setSeo({
  title: '自定义标题 - SnapMedia',
  description: '自定义描述...',
})

// 自定义事件追踪
trackEvent('custom_event', {
  category: 'user_interaction',
  value: 1
})
```

## 🚀 部署检查清单

- [x] Google Analytics ID 配置完成
- [x] 域名配置完成  
- [x] Sitemap 优化完成
- [ ] 添加所有图标文件
- [ ] 创建 og-image.png (1200x630)
- [ ] 验证网站在 Google Search Console
- [ ] 测试社交分享效果

## 📈 监控工具

- [Google Analytics](https://analytics.google.com/) - 访问数据分析
- [Google Search Console](https://search.google.com/search-console) - 搜索表现
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) - 验证 Open Graph
- [Twitter Card Validator](https://cards-dev.twitter.com/validator) - 验证 Twitter 卡片

---

✨ 大部分配置已完成！现在只需要添加图片文件就可以部署了。 