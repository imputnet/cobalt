<template>
  <!-- 移除外层glass-container，改为更简单的布局 -->
  <div class="download-interface">
    <!-- URL 输入框和下载按钮 -->
    <div class="glass-container p-6 mt-6">
      <div class="flex items-center space-x-3">
        <!-- URL 输入框 -->
        <div class="flex-1 relative">
          <input
            v-model="urlInput"
            @input="validateUrl"
            @paste="handlePaste"
            @keydown.enter="handleDownload"
            :disabled="isProcessing"
            type="text"
            placeholder="粘贴视频链接..."
            class="glass-input w-full"
            :class="{
              'border-pink-500/50 bg-pink-500/10': urlStatus === 'invalid' && urlInput.length > 0,
              'border-green-500/50 bg-green-500/10': urlStatus === 'valid',
              'border-blue-500/50 animate-pulse': isProcessing
            }"
          />
          
          <div class="absolute right-4 top-1/2 transform -translate-y-1/2 flex items-center space-x-2 pointer-events-none">
            <!-- URL状态指示器 -->
            <div v-if="urlInput.length > 0" class="flex items-center">
              <CheckCircle v-if="urlStatus === 'valid'" class="w-5 h-5 text-green-400" />
              <XCircle v-if="urlStatus === 'invalid'" class="w-5 h-5 text-pink-400" />
              <Loader2 v-if="urlStatus === 'checking'" class="w-5 h-5 text-blue-400 animate-spin" />
            </div>
            
            <!-- 清除按钮 -->
            <button
              v-if="urlInput.length > 0 && !isProcessing"
              @click="clearInput"
              class="text-gray-400 hover:text-white transition-colors pointer-events-auto"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <!-- 下载按钮 -->
        <button
          @click="handleDownload"
          :disabled="!canDownload"
          :title="downloadButtonText"
          class="p-3 text-white rounded-xl
                  disabled:opacity-50 disabled:cursor-not-allowed
                  flex items-center justify-center w-12 h-12 relative group
                  bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700
                  shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50
                  transition-all duration-200 hover:scale-105"
        >
          <component :is="downloadButtonIcon" 
            :class="[
              'w-6 h-6',
              isProcessing ? 'animate-spin' : ''
            ]" 
          />
          
          <!-- Hover提示文字 -->
          <div
            v-if="!canDownload"
            class="absolute -top-12 left-1/2 transform -translate-x-1/2 
                   bg-slate-800 text-white text-sm px-3 py-1 rounded-lg
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200
                   pointer-events-none whitespace-nowrap z-10
                   after:content-[''] after:absolute after:top-full after:left-1/2 
                   after:transform after:-translate-x-1/2 after:border-4 
                   after:border-transparent after:border-t-slate-800"
          >
            {{ downloadButtonText }}
          </div>
        </button>
      </div>
    </div>

    <!-- 下载模式选择和高级设置 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
      <!-- 下载模式选择 -->
      <div class="flex flex-wrap items-center gap-2 sm:gap-1">
        <button
          v-for="mode in downloadModes"
          :key="mode.value"
          @click="setDownloadMode(mode.value)"
          :class="[
            'download-mode-btn-mobile',
            settings.save.downloadMode === mode.value ? 'active' : ''
          ]"
          :disabled="isProcessing"
        >
          <component :is="mode.icon" class="w-4 h-4 sm:w-5 sm:h-5" />
          <span class="text-sm sm:text-base">{{ mode.label }}</span>
        </button>
      </div>
      
      <!-- 高级设置按钮 -->
      <button
        @click="toggleAdvanced"
        class="glass-btn glass-btn-secondary flex items-center justify-center sm:justify-start space-x-2 w-full sm:w-auto py-3 sm:py-2"
        :disabled="isProcessing"
      >
        <Settings class="w-4 h-4 sm:w-5 sm:h-5" />
        <span class="text-sm sm:text-base">高级设置</span>
        <ChevronDown
          class="w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200"
          :class="{ 'rotate-180': showAdvanced }"
        />
      </button>
    </div>

    <!-- 高级设置面板 -->
    <div
      v-if="showAdvanced"
      class="mt-6 p-6 glass-panel space-y-4 animate-slide-down"
    >
      <!-- 视频质量 -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="setting-label">视频质量</label>
          <select v-model="settings.save.videoQuality" class="glass-select">
            <option value="max">最高</option>
            <option value="2160">4K (2160p)</option>
            <option value="1440">2K (1440p)</option>
            <option value="1080">1080p</option>
            <option value="720">720p</option>
            <option value="480">480p</option>
            <option value="360">360p</option>
          </select>
        </div>

        <div>
          <label class="setting-label">音频格式</label>
          <select v-model="settings.save.audioFormat" class="glass-select">
            <option value="best">最佳</option>
            <option value="mp3">MP3</option>
            <option value="ogg">OGG</option>
            <option value="wav">WAV</option>
            <option value="opus">OPUS</option>
          </select>
        </div>
      </div>

      <!-- 文件名样式 -->
      <div>
        <label class="setting-label">文件名样式</label>
        <select v-model="settings.save.filenameStyle" class="glass-select">
          <option value="classic">经典 (完整信息)</option>
          <option value="basic">简洁 (标题_质量)</option>
          <option value="pretty">美观 (仅标题)</option>
          <option value="nerdy">技术 (详细信息)</option>
        </select>
      </div>

      <!-- 其他选项 -->
      <div class="grid grid-cols-2 gap-4">
        <label class="setting-checkbox">
          <input
            v-model="settings.save.disableMetadata"
            type="checkbox"
            class="sr-only"
          />
          <div class="checkbox-custom"></div>
          <span>禁用元数据</span>
        </label>

        <label class="setting-checkbox">
          <input
            v-model="settings.save.convertGif"
            type="checkbox"
            class="sr-only"
          />
          <div class="checkbox-custom"></div>
          <span>转换GIF为MP4</span>
        </label>
      </div>
    </div>



    <!-- Picker选择模态框已移动到App.vue全局层级 -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { 
  Download, 
  Music, 
  VolumeX, 
  Settings, 
  ChevronDown, 
  CheckCircle,
  XCircle, 
  Loader2, 
  X,
  Sparkles,
  AlertCircle
} from 'lucide-vue-next'

import { api } from '@/lib/api'
import { settings, loadSettings, getCurrentApiURL } from '@/stores/settings'
import type { CobaltApiRequest, CobaltResponse } from '@/types'

// 下载模式配置
const downloadModes = [
  { value: 'auto' as const, label: '自动', icon: Sparkles },
  { value: 'audio' as const, label: '音频', icon: Music },
  { value: 'mute' as const, label: '静音', icon: VolumeX }
]

// 响应式状态
const urlInput = ref('')
const urlStatus = ref<'idle' | 'checking' | 'valid' | 'invalid'>('idle')
const isProcessing = ref(false)
const showAdvanced = ref(false)
const videoError = ref(false)

// Emit事件，用于通知父组件显示Toast和预览
const emit = defineEmits<{
  showToast: [message: string, type: 'success' | 'error' | 'info']
  'open-preview': [data: any]
  'open-picker': [data: any]
  'add-to-queue': [data: { response: CobaltResponse; request: any }]
}>()

// 计算属性
const canDownload = computed(() => {
  return urlStatus.value === 'valid' && !isProcessing.value && urlInput.value.length > 0
})

const downloadButtonIcon = computed(() => {
  if (isProcessing.value) return Loader2
  if (!canDownload.value) return AlertCircle
  return Download
})

const downloadButtonText = computed(() => {
  if (isProcessing.value) return '处理中...'
  if (!canDownload.value) {
    if (urlInput.value.length === 0) return '请输入链接'
    if (urlStatus.value === 'invalid') return '链接无效'
    return '准备下载'
  }
  return '开始下载'
})

// 方法
const validateUrl = () => {
  if (!urlInput.value.trim()) {
    urlStatus.value = 'idle'
    return
  }

  urlStatus.value = 'checking'
  
  // 简单的URL验证
  try {
    const url = new URL(urlInput.value.trim())
    const supportedDomains = [
      // YouTube
      'youtube.com', 'youtu.be', 'm.youtube.com',
      // Twitter/X
      'twitter.com', 'x.com', 'mobile.twitter.com',
      // TikTok
      'tiktok.com', 'vm.tiktok.com', 'vt.tiktok.com',
      // Instagram
      'instagram.com', 'instagr.am',
      // Facebook
      'facebook.com', 'fb.watch', 'm.facebook.com',
      // Bilibili
      'bilibili.com', 'b23.tv',
      // SoundCloud
      'soundcloud.com', 'on.soundcloud.com',
      // Vimeo
      'vimeo.com', 'player.vimeo.com',
      // Reddit
      'reddit.com', 'v.redd.it', 'i.redd.it',
      // Tumblr
      'tumblr.com',
      // Pinterest
      'pinterest.com', 'pin.it',
      // Twitch
      'twitch.tv', 'clips.twitch.tv',
      // Dailymotion
      'dailymotion.com', 'dai.ly',
      // VK
      'vk.com', 'vk.ru',
      // Ok.ru
      'ok.ru', 'odnoklassniki.ru',
      // Bluesky
      'bsky.app',
      // 小红书
      'xiaohongshu.com', 'xhslink.com'
    ]
    
    const isSupported = supportedDomains.some(domain => 
      url.hostname === domain || url.hostname.endsWith('.' + domain)
    )
    
    setTimeout(() => {
      urlStatus.value = isSupported ? 'valid' : 'invalid'
    }, 500)
  } catch {
    setTimeout(() => {
      urlStatus.value = 'invalid'
    }, 500)
  }
}

const setDownloadMode = (mode: 'auto' | 'audio' | 'mute') => {
  settings.save.downloadMode = mode
}

const toggleAdvanced = () => {
  showAdvanced.value = !showAdvanced.value
}

const clearInput = () => {
  urlInput.value = ''
  urlStatus.value = 'idle'
}

const handleVideoError = () => {
  videoError.value = true
  console.log('视频预览加载失败，但下载功能仍然可用')
}

const handlePaste = async (event: ClipboardEvent) => {
  // 等待粘贴完成后验证
  setTimeout(() => {
    validateUrl()
  }, 100)
}

// Picker相关函数已移动到App.vue全局管理
// 保留接口方便后续扩展

// 显示视频预览 - 通过事件传递给父组件
const showVideoPreview = (response: any) => {
  emit('open-preview', response)
}

// 显示Picker选择界面
const showPickerSelection = (response: any) => {
  emit('open-picker', response)
}

// 智能选择处理方式的函数
const getProcessingMode = (url: string, userSetting: string) => {
  // 检测平台类型
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be')
  const isBilibili = url.includes('bilibili.com') || url.includes('b23.tv')
  
  // 如果用户选择了明确的处理方式（非auto），优先使用用户设置
  if (userSetting && ['forced', 'disabled', 'preferred'].includes(userSetting)) {
    console.log(`🎯 使用用户设置的处理方式: ${userSetting}`)
    return userSetting as 'disabled' | 'preferred' | 'forced'
  }
  
  // auto 或空值时使用平台默认策略
  if (isYouTube || isBilibili) {
    console.log(`🎬 检测到 ${isYouTube ? 'YouTube' : 'Bilibili'}，默认使用浏览器合并`)
    return 'forced'  // YouTube 和 Bilibili 默认前端合并
  } else {
    console.log('🌐 其他平台，默认使用服务器合并')
    return 'disabled' // 其他平台默认服务器合并
  }
}

const handleDownload = async () => {
  if (!canDownload.value) return

  isProcessing.value = true
  emit('showToast', '正在处理请求...', 'info')

  try {
    // 调试settings状态
    console.log('Settings状态检查:', {
      settings: settings,
      save: settings?.save,
      downloadMode: settings?.save?.downloadMode,
      videoQuality: settings.save?.videoQuality
    })
    
    // 智能选择处理方式
    const processingMode = getProcessingMode(
      urlInput.value.trim(), 
      settings.save?.localProcessing
    )
    
    // 构建API请求，完全按照官方API schema的格式
    const requestData: CobaltApiRequest = {
      url: urlInput.value.trim(),
      // 使用智能选择的处理方式
      localProcessing: processingMode,
      // 使用用户设置的代理选项
      alwaysProxy: settings.save?.alwaysProxy || false,
      // 修复：downloadMode只支持 ["auto", "audio", "mute"]，将 "video" 转换为 "auto"
      downloadMode: (['audio', 'mute'].includes(settings.save?.downloadMode)
        ? settings.save?.downloadMode
        : 'auto') as 'auto' | 'audio' | 'mute',
      disableMetadata: settings.save?.disableMetadata || false,
      // 修复：字段名应该是 videoQuality，不是 vQuality
      videoQuality: (settings.save?.videoQuality as 'max' | '1080' | '720' | '480' | '360' | '240' | '144') || '1080',
      // 修复：字段名应该是 filenameStyle，不是 filenamePattern
      filenameStyle: (settings.save?.filenameStyle as 'classic' | 'pretty' | 'basic' | 'nerdy') || 'basic',
      audioFormat: settings.save?.audioFormat || 'mp3',
      subtitleLang: settings.save?.subtitleLang || 'none',
      audioBitrate: settings.save?.audioBitrate || '128',
      tiktokFullAudio: settings.save?.tiktokFullAudio || false,
      youtubeDubLang: settings.save?.youtubeDubLang || 'original',
      youtubeBetterAudio: settings.save?.youtubeBetterAudio || false,
      youtubeVideoCodec: settings.save?.youtubeVideoCodec || 'h264',
      youtubeVideoContainer: settings.save?.youtubeVideoContainer || 'auto',
      youtubeHLS: settings.save?.youtubeHLS || false,
      allowH265: settings.save?.allowH265 || false,
      convertGif: settings.save?.convertGif ?? true
    }
    
    console.log('🚀 [DownloadInterface] 发送到API的请求数据:', {
      url: requestData.url,
      localProcessing: requestData.localProcessing,
      downloadMode: requestData.downloadMode,
      videoQuality: requestData.videoQuality
    })
    console.log('✨ 前端智能处理 - localProcessing:', requestData.localProcessing, '(音视频将在浏览器合并，减轻服务器压力)')

    console.log('开始下载，使用设置:', {
      apiUrl: getCurrentApiURL(),
      requestData
    })

    const response = await api.request(requestData)

    if (!response) {
      throw new Error('API服务器无响应')
    }

    console.log('收到API响应:', response)
    
    // 🔍 详细分析响应结构 - 用于诊断小红书等平台的响应格式
    console.log('📊 响应详细分析:', {
      status: response.status,
      hasUrl: !!response.url,
      hasUrls: !!response.urls,
      hasTunnel: !!response.tunnel,
      hasPicker: !!response.picker,
      hasOriginalUrl: !!response.originalUrl,
      filename: response.filename,
      type: response.type,
      originalUrl: response.originalUrl ? response.originalUrl.substring(0, 80) + '...' : null,
      allKeys: Object.keys(response),
      fullResponse: JSON.stringify(response, null, 2)
    })

    // 处理不同类型的响应
    if (response.status === 'local-processing') {
      console.log('🎬 [DownloadInterface] 检测到local-processing响应，准备添加到队列');
      console.log('🔍 [DownloadInterface] 响应详情:', {
        service: response.service,
        type: response.type,
        hasTunnel: !!response.tunnel,
        tunnelLength: Array.isArray(response.tunnel) ? response.tunnel.length : 'not-array',
        hasPicker: !!response.picker,
        isPickerArray: Array.isArray(response.picker)
      });
      
      if (Array.isArray(response.picker)) {
        console.log('📋 [DownloadInterface] 检测到picker数组，转换格式后添加到队列');
        const patchedResponse = {
          ...response,
          picker: {
            type: 'default',
            options: response.picker
          } as { type: string; options: any[] }
        };
        emit('add-to-queue', { response: patchedResponse, request: {} });
      } else {
        console.log('🎯 [DownloadInterface] 直接添加到处理队列');
        emit('add-to-queue', { response, request: {} });
      }
      
      emit('showToast', '已添加到处理队列，正在准备下载...', 'info');
      console.log('✅ [DownloadInterface] add-to-queue事件已发送');
    } else if (response.status === 'redirect' && response.url) {
      emit('showToast', '检测到直接链接，显示预览', 'info')
      
      // 将redirect响应转换为预览格式
      const previewResponse = {
        ...response,
        tunnel: [response.url], // 包装成数组以兼容预览组件
        type: 'redirect', // 标记为重定向
        filenameAttributes: {
          title: response.filename || 'media',
          extension: response.filename ? response.filename.split('.').pop() : 'mp4',
          ...response.filenameAttributes
        }
      }
      
      // 显示预览界面
      showVideoPreview(previewResponse)
      
      console.log('Redirect预览已启动:', {
        url: response.url,
        filename: response.filename || 'download'
      })
      
    } else if (response.status === 'tunnel' && response.url) {
      emit('showToast', '检测到单文件下载，显示预览', 'info')
      
      // 将tunnel响应转换为预览格式
      const previewResponse = {
        ...response,
        tunnel: [response.url], // 包装成数组以兼容预览组件
        originalUrl: response.originalUrl, // 保留原始URL供预览尝试
        type: 'single', // 标记为单文件
        filenameAttributes: {
          title: response.filename || 'video',
          extension: response.filename ? response.filename.split('.').pop() : 'mp4',
          ...response.filenameAttributes
        }
      }
      
      // 显示预览界面
      showVideoPreview(previewResponse)
      
      console.log('Tunnel预览已启动:', {
        url: response.url,
        filename: response.filename || 'download'
      })
      
    } else if (response.status === 'picker' && response.picker) {
      emit('showToast', '发现多个文件，请选择下载', 'info')
      
      // 显示picker选择界面
      showPickerSelection(response)
      
    } else if (response.status === 'error' && response.error) {
      console.error('API返回错误:', response.error)
      
      const errorMessages: Record<string, string> = {
        'link.invalid': '链接无效或不支持',
        'link.unsupported': '不支持的平台',
        'content.too_long': '视频时长超过限制',
        'content.unavailable': '内容不可用或已被删除',
        'rate_limit': '请求过于频繁，请稍后再试',
        'api.fetch.timeout': '请求超时，请检查网络连接',
        'api.fetch.error': '网络错误，请稍后再试',
        'api.fetch.fail': '该平台暂时被阻止访问，请稍后再试',
        'api.fetch.status': 'API服务器错误',
        'error.api.header.accept': 'API请求格式错误',
        'error.api.fetch.short_link': 'Facebook短链接暂不支持，请使用完整的Facebook链接'
      }
      
      const errorMessage = errorMessages[response.error.code] || `API错误: ${response.error.code || 'unknown'} - ${response.error.context || '获取视频信息失败，请检查链接是否正确'}`
      throw new Error(errorMessage)
    } else {
      // 🔍 通用处理逻辑 - 尝试从任何可能的字段中提取下载URL
      console.warn('⚠️ 收到未知响应格式，尝试通用解析...')
      
      let extractedUrls: string[] = []
      let extractedFilename = 'download'
      
      // 尝试从各种可能的字段中提取URL
      if (response.url && typeof response.url === 'string') {
        extractedUrls = [response.url]
      } else if (response.urls) {
        if (Array.isArray(response.urls)) {
          extractedUrls = response.urls
        } else if (typeof response.urls === 'string') {
          extractedUrls = [response.urls]
        }
      } else if (response.tunnel) {
        extractedUrls = Array.isArray(response.tunnel) ? response.tunnel : [response.tunnel]
      }
      
      // 尝试提取文件名
      if (response.filename && typeof response.filename === 'string') {
        extractedFilename = response.filename
      }
      
      if (extractedUrls.length > 0) {
        console.log('✅ 通用解析成功，提取到URL:', extractedUrls)
        
        emit('showToast', '检测到媒体文件，显示预览', 'info')
        
        const previewResponse = {
          ...response,
          tunnel: extractedUrls,
          type: 'unknown', // 标记为未知类型
          filenameAttributes: {
            title: extractedFilename.replace(/\.[^/.]+$/, "") || 'media', // 去掉扩展名
            extension: extractedFilename.split('.').pop() || 'mp4',
            ...response.filenameAttributes
          }
        }
        
        showVideoPreview(previewResponse)
        
        console.log('通用预览已启动:', {
          urls: extractedUrls,
          filename: extractedFilename,
          responseType: response.status
        })
      } else {
        throw new Error(`未知的响应格式: ${JSON.stringify(response)}`)
      }
    }

  } catch (error) {
    console.error('下载失败:', error)
    
    // 输出更详细的错误信息用于调试
    if (error instanceof Error) {
      console.error('错误详情:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      })
    }
    
    const errorMessage = error instanceof Error ? error.message : '下载失败，请重试'
    emit('showToast', errorMessage, 'error')
  } finally {
    isProcessing.value = false
  }
}

// 从剪贴板自动检测链接
const checkClipboard = async () => {
  if (!settings.other.autoDetectClipboard) return
  
  try {
    const text = await navigator.clipboard.readText()
    if (text && text.startsWith('http') && !urlInput.value) {
      // 简单验证是否为支持的链接
      const supportedPatterns = [
        /youtube\.com\/watch/,
        /youtu\.be\//,
        /twitter\.com\//,
        /x\.com\//,
        /tiktok\.com\//,
        /instagram\.com\//,
        /bilibili\.com\//
      ]
      
      if (supportedPatterns.some(pattern => pattern.test(text))) {
        urlInput.value = text
        validateUrl()
      }
    }
  } catch {
    // 忽略剪贴板权限错误
  }
}

// 生命周期
onMounted(() => {
  loadSettings()
  checkClipboard()
})

// 监听URL变化
watch(urlInput, (newValue) => {
  if (newValue.trim()) {
    validateUrl()
  } else {
    urlStatus.value = 'idle'
  }
})
</script>

<style scoped>
.download-interface {
  width: 100%;
}

/* 输入框样式增强 */
input:focus {
  outline: none;
}

/* 选择框样式 */
select {
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23ffffff60' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3E%3C/svg%3E");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;
  padding-right: 40px;
  appearance: none;
}

/* Picker界面样式 */
input[type="checkbox"]:indeterminate {
  background-color: rgb(236 72 153);
  border-color: rgb(236 72 153);
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 16 16'%3e%3cpath stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M4 8h8'/%3e%3c/svg%3e");
}

/* Picker缩略图样式 */
.picker-item-thumb {
  transition: transform 0.2s ease;
}

.picker-item-thumb:hover {
  transform: scale(1.02);
}

/* 移动端优化 */
@media (max-width: 640px) {
  .download-interface {
    padding: 0;
  }
  
  .glass-container {
    margin: 0 -1rem;
    border-radius: 1rem;
  }
  
  /* 移动端picker优化 */
  .picker-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 