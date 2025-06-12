# YouTube认证开发环境配置说明

## 概述
现在所有的YouTube下载都要求使用cookies.json中的认证信息。本指南将帮你在开发环境中配置YouTube OAuth认证。

## 快速开始

### 1. 设置YouTube OAuth认证
```powershell
cd d:\code\cobalt_bam\api
npm run setup-youtube
```

这个命令会：
- ✅ 创建cookies.json文件（如果不存在）
- ✅ 运行YouTube OAuth token生成器
- ✅ 提供详细的认证步骤

### 2. 验证认证配置
```powershell
npm run verify-cookies
```

这个命令会检查：
- ✅ cookies.json是否存在
- ✅ YouTube认证是否配置正确
- ✅ 认证信息是否有效

### 3. 启动开发服务器
```powershell
npm run dev
```

这个命令会：
- ✅ 自动设置COOKIE_PATH环境变量
- ✅ 强制所有YouTube下载使用认证
- ✅ 提供详细的认证日志

## 认证日志说明

所有关键的认证调用都会有特殊的日志标记，以`======>`开头：

```
======> [getCookie] Requesting cookie for service: youtube_oauth
======> [getCookie] Found 1 cookies for youtube_oauth, using index 0
======> [cloneInnertube] Starting Innertube creation, useSession: false
======> [cloneInnertube] Cookie available: true
======> [youtube] Starting YouTube video processing for URL: https://youtube.com/watch?v=...
======> [youtube] Cookie availability check - OAuth: true, Regular: false, Has any: true
======> [getHeaders] Getting headers for service: youtube
======> [getHeaders] YouTube service detected, checking for authentication cookies
======> [getHeaders] Added authentication cookie for YouTube: access_token=ya29...
```

## 故障排除

### 问题1: "No YouTube authentication cookies found!"
**解决方案:**
```powershell
npm run setup-youtube
# 按照提示完成OAuth认证
# 将生成的token添加到cookies.json
npm run verify-cookies
```

### 问题2: "youtube.auth_required"错误
这意味着没有找到有效的YouTube认证。检查：
1. cookies.json文件存在
2. youtube_oauth字段有有效的token
3. token没有过期

### 问题3: 403错误持续出现
可能的原因：
1. OAuth token已过期
2. Google账户被限制
3. 需要重新认证

**解决方案:**
```powershell
# 重新生成token
npm run setup-youtube
```

## 文件结构

```
d:\code\cobalt_bam\
├── cookies.json                 # 认证配置文件
├── api/
│   ├── dev-start.js            # 开发环境启动脚本
│   ├── setup-youtube-auth.js   # YouTube OAuth设置脚本
│   ├── verify-cookies.js       # Cookie验证脚本
│   └── src/
│       ├── cookies.json        # API目录下的cookies（生产用）
│       └── ...
```

## 安全注意事项

⚠️ **重要**: 
- 不要提交包含真实token的cookies.json到Git
- 不要在公共场所分享你的OAuth token
- 定期更新和轮换认证token
- 使用专门的测试Google账户，不要使用个人账户

## 生产环境部署

生产环境中，cookies.json的路径通过deployment配置管理，你不需要关心生产环境的配置。
