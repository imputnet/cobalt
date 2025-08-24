<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4"
    @click="closePanel"
  >
    <!-- 背景遮罩 -->
    <div class="absolute inset-0 backdrop-blur-sm" 
         :class="[
           'dark:bg-black/50',
           'bg-white/30'
         ]">
    </div>
    
    <!-- 设置面板 -->
    <div
      @click.stop
      class="relative w-full max-w-2xl max-h-[95vh] overflow-hidden glass-container animate-slide-up"
    >
      <!-- 标题栏 -->
      <div class="sticky top-0 backdrop-blur-sm border-b p-6"
           :class="[
             'dark:bg-slate-900/80 dark:border-white/10',
             'bg-white/80 border-slate-200/50'
           ]">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold flex items-center"
              :class="[
                'dark:text-white',
                'text-slate-800'
              ]">
            <Settings class="w-6 h-6 mr-3" />
            {{ t('settings.title') }}
          </h2>
          <button
            @click="closePanel"
            class="p-2 rounded-lg transition-colors"
            :class="[
              'dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10',
              'text-gray-600 hover:text-gray-800 hover:bg-slate-100'
            ]"
          >
            <X class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- 设置内容 -->
      <div class="overflow-y-auto max-h-[calc(95vh-160px)] p-4 md:p-6 space-y-6 md:space-y-8">
        
        <!-- 下载设置 -->
        <section>
          <h3 class="section-title">{{ t('settings.downloadSettings') }}</h3>
          <div class="space-y-6">
            
            <!-- 默认下载模式 -->
            <div>
              <label class="setting-label">{{ t('settings.defaultDownloadMode') }}</label>
              <div class="flex space-x-2 mt-2">
                <button
                  v-for="mode in downloadModes"
                  :key="mode.value"
                  @click="settings.save.downloadMode = mode.value"
                  :class="[
                    'download-mode-btn',
                    settings.save.downloadMode === mode.value ? 'active' : ''
                  ]"
                >
                  <component :is="mode.icon" class="w-5 h-5" />
                  <span>{{ t(`downloadModes.${mode.value}`) }}</span>
                </button>
              </div>
            </div>

            <!-- 视频质量和音频格式 -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="setting-label">{{ t('settings.defaultVideoQuality') }}</label>
                <select v-model="settings.save.videoQuality" class="glass-select">
                  <option value="max">{{ t('advancedSettings.qualities.max') }}</option>
                  <option value="2160">{{ t('advancedSettings.qualities.2160') }}</option>
                  <option value="1440">{{ t('advancedSettings.qualities.1440') }}</option>
                  <option value="1080">{{ t('advancedSettings.qualities.1080') }}</option>
                  <option value="720">{{ t('advancedSettings.qualities.720') }}</option>
                  <option value="480">{{ t('advancedSettings.qualities.480') }}</option>
                  <option value="360">{{ t('advancedSettings.qualities.360') }}</option>
                </select>
              </div>

              <div>
                <label class="setting-label">{{ t('settings.defaultAudioFormat') }}</label>
                <select v-model="settings.save.audioFormat" class="glass-select">
                  <option value="best">{{ t('advancedSettings.audioFormats.best') }}</option>
                  <option value="mp3">{{ t('advancedSettings.audioFormats.mp3') }}</option>
                  <option value="ogg">{{ t('advancedSettings.audioFormats.ogg') }}</option>
                  <option value="wav">{{ t('advancedSettings.audioFormats.wav') }}</option>
                  <option value="opus">{{ t('advancedSettings.audioFormats.opus') }}</option>
                </select>
              </div>
            </div>

            <!-- 文件名样式 -->
            <div>
              <label class="setting-label">{{ t('settings.defaultFilenameStyle') }}</label>
              <select v-model="settings.save.filenameStyle" class="glass-select">
                <option value="classic">{{ t('advancedSettings.filenameStyles.classic') }}</option>
                <option value="basic">{{ t('advancedSettings.filenameStyles.basic') }}</option>
                <option value="pretty">{{ t('advancedSettings.filenameStyles.pretty') }}</option>
                <option value="nerdy">{{ t('advancedSettings.filenameStyles.nerdy') }}</option>
              </select>
            </div>

            <!-- 媒体处理方式 -->
            <div>
              <label class="setting-label">{{ t('settings.mediaProcessingMode') }}</label>
              <select v-model="settings.save.localProcessing" class="glass-select">
                <option value="auto">{{ t('settings.processingModes.auto') }}</option>
                <option value="forced">{{ t('settings.processingModes.forced') }}</option>
                <option value="disabled">{{ t('settings.processingModes.disabled') }}</option>
                <option value="preferred">{{ t('settings.processingModes.preferred') }}</option>
              </select>
              <p class="text-sm text-gray-400 mt-1" v-html="t('settings.processingDescription')">
              </p>
            </div>

            <!-- 下载选项 -->
            <div class="grid grid-cols-2 gap-4">
              <label class="setting-checkbox">
                <input
                  v-model="settings.save.disableMetadata"
                  type="checkbox"
                  class="sr-only"
                />
                <div class="checkbox-custom"></div>
                <span>{{ t('advancedSettings.disableMetadata') }}</span>
              </label>

              <label class="setting-checkbox">
                <input
                  v-model="settings.save.convertGif"
                  type="checkbox"
                  class="sr-only"
                />
                <div class="checkbox-custom"></div>
                <span>{{ t('advancedSettings.convertGif') }}</span>
              </label>

              <label class="setting-checkbox" :title="'开启后，所有下载都会通过服务器代理，可以解决某些区域限制问题，但下载速度可能较慢'">
                <input
                  v-model="settings.save.alwaysProxy"
                  type="checkbox"
                  class="sr-only"
                />
                <div class="checkbox-custom"></div>
                <span>{{ t('settings.alwaysProxy') }}</span>
              </label>

              <label class="setting-checkbox">
                <input
                  v-model="settings.save.youtubeBetterAudio"
                  type="checkbox"
                  class="sr-only"
                />
                <div class="checkbox-custom"></div>
                <span>{{ t('settings.youtubeBetterAudio') }}</span>
              </label>
            </div>
            
            <!-- 代理设置说明 -->
            <div class="mt-3 p-3 bg-slate-800/50 rounded-lg">
              <p class="text-xs text-gray-400" v-html="t('settings.proxyDescription')">
              </p>
            </div>
          </div>
        </section>

        <!-- 界面设置 -->
        <section>
          <h3 class="section-title">{{ t('settings.interfaceSettings') }}</h3>
          <div class="space-y-6">
            
            <!-- 主题 -->
            <div>
              <label class="setting-label">{{ t('settings.theme') }}</label>
              <select v-model="settings.appearance.theme" class="glass-select">
                <option value="dark">{{ t('settings.themes.dark') }}</option>
                <option value="light">{{ t('settings.themes.light') }}</option>
                <option value="auto">{{ t('settings.themes.auto') }}</option>
              </select>
            </div>

            <!-- 霓虹强度 -->
            <div>
              <label class="setting-label">{{ t('settings.neonIntensity') }}: {{ settings.appearance.neonIntensity }}%</label>
              <input
                v-model.number="settings.appearance.neonIntensity"
                type="range"
                min="0"
                max="100"
                step="10"
                class="glass-slider"
                :style="{ '--slider-progress': `${settings.appearance.neonIntensity}%` }"
                @input="updateSliderProgress"
              />
            </div>

            <!-- 动画效果 -->
            <label class="setting-checkbox">
              <input
                v-model="settings.appearance.animations"
                type="checkbox"
                class="sr-only"
              />
              <div class="checkbox-custom"></div>
              <span>{{ t('settings.enableAnimations') }}</span>
            </label>
          </div>
        </section>

        <!-- API设置 -->
        <section>
          <h3 class="section-title">{{ t('settings.apiSettings') }}</h3>
          <div class="space-y-6">
            
            <!-- 自定义API -->
            <label class="setting-checkbox">
              <input
                v-model="settings.processing.enableCustomInstances"
                type="checkbox"
                class="sr-only"
              />
              <div class="checkbox-custom"></div>
              <span>{{ t('settings.useCustomApi') }}</span>
            </label>

            <!-- API服务器地址 -->
            <div v-if="settings.processing.enableCustomInstances">
              <label class="setting-label">{{ t('settings.apiServerUrl') }}</label>
              <input
                v-model="settings.processing.customInstanceURL"
                type="text"
                placeholder="http://localhost:9000/"
                class="glass-input"
              />
              <p class="text-sm text-gray-400 mt-1">
                {{ t('settings.apiServerDefault') }}
              </p>
            </div>

            <!-- 请求超时 -->
            <div>
              <label class="setting-label">{{ t('settings.requestTimeout') }}</label>
              <input
                v-model.number="settings.processing.requestTimeout"
                type="number"
                min="5"
                max="120"
                class="glass-input"
              />
            </div>
          </div>
        </section>

        <!-- 其他设置 -->
        <section>
          <h3 class="section-title">{{ t('settings.otherSettings') }}</h3>
          <div class="space-y-6">
            
            <label class="setting-checkbox">
              <input
                v-model="settings.other.autoDetectClipboard"
                type="checkbox"
                class="sr-only"
              />
              <div class="checkbox-custom"></div>
              <span>{{ t('settings.autoDetectClipboard') }}</span>
            </label>

            <label class="setting-checkbox">
              <input
                v-model="settings.other.showDevInfo"
                type="checkbox"
                class="sr-only"
              />
              <div class="checkbox-custom"></div>
              <span>{{ t('settings.showDevInfo') }}</span>
            </label>
          </div>
        </section>

        <!-- 操作按钮 -->
        <section>
          <h3 class="section-title">{{ t('settings.dataManagement') }}</h3>
          <div class="flex flex-wrap gap-3">
            <button @click="exportSettings" class="glass-btn glass-btn-secondary">
              <Download class="w-5 h-5" />
              <span>{{ t('settings.exportSettings') }}</span>
            </button>
            
            <button @click="importSettings" class="glass-btn glass-btn-secondary">
              <Upload class="w-5 h-5" />
              <span>{{ t('settings.importSettings') }}</span>
            </button>
            
            <button @click="resetToDefaults" class="glass-btn text-pink-400 border-pink-500/30 hover:bg-pink-500/10">
              <RotateCcw class="w-5 h-5" />
              <span>{{ t('settings.resetSettings') }}</span>
            </button>
          </div>
        </section>
      </div>

      <!-- 状态栏 -->
      <div
        v-if="saveStatus !== 'idle'"
        class="sticky bottom-0 backdrop-blur-sm border-t p-4"
        :class="[
          'dark:bg-slate-900/80 dark:border-white/10',
          'bg-white/80 border-slate-200/50'
        ]"
      >
        <div class="flex items-center justify-center space-x-2 text-sm">
          <component :is="statusIcon" class="w-4 h-4" />
          <span>{{ statusText }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  Settings, 
  X, 
  Download, 
  Upload, 
  RotateCcw,
  Save,
  Check,
  AlertCircle,
  Sparkles,
  Music,
  VolumeX
} from 'lucide-vue-next'

import { settings, saveStatus, resetSettings } from '@/stores/settings'

// i18n 设置
const { t } = useI18n()

// Props
interface Props {
  isOpen: boolean
}

defineProps<Props>()

// Emits
const emit = defineEmits<{
  close: []
}>()

// 下载模式配置
const downloadModes = [
  { value: 'auto' as const, label: '自动', icon: Sparkles },
  { value: 'audio' as const, label: '音频', icon: Music },
  { value: 'mute' as const, label: '静音', icon: VolumeX }
]

// 计算属性
const statusIcon = computed(() => {
  switch (saveStatus.value) {
    case 'saving': return Save
    case 'saved': return Check
    case 'error': return AlertCircle
    default: return Save
  }
})

const statusText = computed(() => {
  switch (saveStatus.value) {
    case 'saving': return t('settings.saving')
    case 'saved': return t('settings.saved')
    case 'error': return t('settings.saveError')
    default: return ''
  }
})

// 方法
const closePanel = () => {
  emit('close')
}

const updateSliderProgress = (event: Event) => {
  const target = event.target as HTMLInputElement
  const value = parseInt(target.value)
  target.style.setProperty('--slider-progress', `${value}%`)
}

const exportSettings = () => {
  try {
    const dataStr = JSON.stringify(settings, null, 2)
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
          link.download = `snapmedia-settings-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('导出设置失败:', error)
  }
}

const importSettings = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string)
        Object.assign(settings, importedSettings)
      } catch (error) {
        console.error('导入设置失败:', error)
        alert(t('settings.importError'))
      }
    }
    reader.readAsText(file)
  }
  
  input.click()
}

const resetToDefaults = () => {
  if (confirm(t('settings.confirmReset'))) {
    resetSettings()
  }
}
</script>

<style scoped>
/* 保持现有样式不变 */
</style> 