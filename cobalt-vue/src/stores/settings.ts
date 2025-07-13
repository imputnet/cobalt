import { ref, reactive, watch } from 'vue'
import { api } from '@/lib/api'

// 设置类型定义，参考原版web
export interface CobaltSettings {
  // 下载设置
  save: {
    downloadMode: 'auto' | 'audio' | 'mute'
    videoQuality: string
    audioFormat: string
    filenameStyle: string
    disableMetadata: boolean
    localProcessing: string
    alwaysProxy: boolean
    audioBitrate: string
    tiktokFullAudio: boolean
    youtubeDubLang: string
    youtubeBetterAudio: boolean
    youtubeVideoCodec: string
    youtubeVideoContainer: string
    youtubeHLS: boolean
    allowH265: boolean
    convertGif: boolean
    subtitleLang: string
    savingMethod: string
  }
  
  // 界面设置  
  appearance: {
    theme: 'dark' | 'light' | 'auto'
    neonIntensity: number
    animations: boolean
  }
  
  // API 设置
  processing: {
    customInstanceURL: string
    enableCustomInstances: boolean
    requestTimeout: number
  }
  
  // 其他设置
  other: {
    autoDetectClipboard: boolean
    showDevInfo: boolean
  }
}

// 默认设置，参考原版web的defaults
const defaultSettings: CobaltSettings = {
  save: {
    downloadMode: 'auto',
    videoQuality: '1080',
    audioFormat: 'mp3',
    filenameStyle: 'basic',
    disableMetadata: false,
    localProcessing: 'disabled',  // 修改为disabled，让API服务器处理合并
    alwaysProxy: false,
    audioBitrate: '128',
    tiktokFullAudio: false,
    youtubeDubLang: 'original',
    youtubeBetterAudio: false,
    youtubeVideoCodec: 'h264',
    youtubeVideoContainer: 'auto',
    youtubeHLS: false,
    allowH265: false,
    convertGif: true,
    subtitleLang: 'none',
    savingMethod: 'download'
  },
  appearance: {
    theme: 'dark',
    neonIntensity: 80,
    animations: true
  },
  processing: {
    customInstanceURL: '',
    enableCustomInstances: false,
    requestTimeout: 30
  },
  other: {
    autoDetectClipboard: true,
    showDevInfo: false
  }
}

// 创建响应式设置对象
export const settings = reactive<CobaltSettings>({ ...defaultSettings })

// 设置保存状态
export const saveStatus = ref<'idle' | 'saving' | 'saved' | 'error'>('idle')

// 保存设置到localStorage
const saveSettingsToStorage = async (settingsData: CobaltSettings) => {
  try {
    saveStatus.value = 'saving'
    localStorage.setItem('cobalt-vue-settings', JSON.stringify(settingsData))
    applySettings(settingsData)
    saveStatus.value = 'saved'
    
    // 2秒后重置状态
    setTimeout(() => {
      if (saveStatus.value === 'saved') {
        saveStatus.value = 'idle'
      }
    }, 2000)
  } catch (error) {
    console.error('保存设置失败:', error)
    saveStatus.value = 'error'
    
    setTimeout(() => {
      saveStatus.value = 'idle'
    }, 3000)
  }
}

// 应用设置到界面
const applySettings = (settingsData: CobaltSettings) => {
  // 应用主题
  const html = document.documentElement
  if (settingsData.appearance.theme === 'dark') {
    html.classList.add('dark')
  } else if (settingsData.appearance.theme === 'light') {
    html.classList.remove('dark')
  } else {
    // auto theme
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }
  
  // 应用霓虹效果强度
  const root = document.documentElement
  root.style.setProperty('--neon-intensity', `${settingsData.appearance.neonIntensity}%`)
  
  // 应用动画设置
  if (!settingsData.appearance.animations) {
    root.style.setProperty('--animation-duration', '0ms')
  } else {
    root.style.removeProperty('--animation-duration')
  }
  
  // 如果禁用动画，添加减少动画的类
  if (!settingsData.appearance.animations) {
    html.classList.add('reduce-motion')
  } else {
    html.classList.remove('reduce-motion')
  }
}

// 从localStorage加载设置
export const loadSettings = () => {
  try {
    const savedSettings = localStorage.getItem('cobalt-vue-settings')
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings)
      // 深度合并，确保新增的设置项有默认值
      const merged = mergeSettings(defaultSettings, parsed)
      Object.assign(settings, merged)
      applySettings(settings)
    } else {
      // 首次使用，应用默认设置
      applySettings(settings)
    }
  } catch (error) {
    console.error('加载设置失败:', error)
    // 如果加载失败，使用默认设置
    Object.assign(settings, defaultSettings)
    applySettings(settings)
  }
}

// 深度合并设置对象
const mergeSettings = (defaults: any, saved: any): any => {
  const result = { ...defaults }
  
  for (const key in saved) {
    if (saved[key] !== null && typeof saved[key] === 'object' && !Array.isArray(saved[key])) {
      result[key] = mergeSettings(defaults[key] || {}, saved[key])
    } else {
      result[key] = saved[key]
    }
  }
  
  return result
}

// 重置设置
export const resetSettings = () => {
  Object.assign(settings, defaultSettings)
  localStorage.removeItem('cobalt-vue-settings')
  applySettings(settings)
}

// 更新特定设置
export const updateSetting = (path: string[], value: any) => {
  let current = settings as any
  for (let i = 0; i < path.length - 1; i++) {
    current = current[path[i]]
  }
  current[path[path.length - 1]] = value
}

// 监听设置变化并自动保存
watch(settings, (newSettings) => {
  if (saveStatus.value !== 'saving') {
    saveSettingsToStorage(newSettings)
  }
}, { deep: true })

// 监听API设置变化，更新API客户端配置
watch(() => settings.processing.customInstanceURL, (newApiServer) => {
  const apiUrl = newApiServer.trim() || 'http://localhost:9000/'
  api.setBaseURL(apiUrl)
}, { immediate: true })

watch(() => settings.processing.requestTimeout, (newTimeout) => {
  api.setTimeout(newTimeout * 1000) // 转换为毫秒
}, { immediate: true })

// 获取当前API URL
export const getCurrentApiURL = () => {
  const customURL = settings.processing.customInstanceURL
  if (settings.processing.enableCustomInstances && customURL.length > 0) {
    return new URL(customURL).origin + '/'
  }
  return 'http://localhost:9000/'
}

// 导出设置getter，方便其他组件使用
export const getSettings = () => settings 

// 初始化API客户端配置
export const initializeAPI = () => {
  const apiUrl = getCurrentApiURL()
  api.setBaseURL(apiUrl)
  api.setTimeout(settings.processing.requestTimeout * 1000)
  
  console.log('API客户端已初始化:', {
    url: apiUrl,
    timeout: settings.processing.requestTimeout * 1000
  })
} 