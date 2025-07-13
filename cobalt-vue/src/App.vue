<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Settings, X, Download, Loader2, ExternalLink, CheckCircle } from 'lucide-vue-next'
import DownloadInterface from '@/components/DownloadInterface.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import Toast from '@/components/Toast.vue'
import { loadSettings, initializeAPI } from '@/stores/settings'
import type { CobaltResponse, QueuedItem } from '@/types';
import { remux } from './lib/remuxer';

// 响应式状态
const showSettings = ref(false)
const showAllPlatforms = ref(false)

// 预览弹窗状态
const showPreview = ref(false)
const previewData = ref<any>(null)
const videoError = ref(false)
const isDownloading = ref(false)

// Picker弹窗状态
const showPicker = ref(false)
const pickerData = ref<any>(null)
const selectedItems = ref<Set<number>>(new Set())
const isPickerDownloading = ref(false)

// 处理队列状态
const processingQueue = ref<QueuedItem[]>([]);

// Toast消息管理
interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const toasts = ref<ToastMessage[]>([])

// Toast方法
const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration = 4000) => {
  const id = Date.now().toString() + Math.random().toString(36).substring(2)
  
  toasts.value.push({
    id,
    message,
    type,
    duration
  })
}

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// 预览弹窗方法
const openPreview = (result: any) => {
  console.log('🎬 打开预览，结果:', result);
  console.log('🔍 hasOriginalUrl:', !!result.originalUrl);
  console.log('🔍 originalUrl:', result.originalUrl ? result.originalUrl.substring(0, 50) + '...' : 'null');
  
  if (result.url) {
    previewData.value = result;
    showPreview.value = true;
  } else if (result.tunnel && Array.isArray(result.tunnel) && result.tunnel.length > 0) {
    // 处理tunnel数组的情况
    previewData.value = result;
    showPreview.value = true;
  }
};

const closePreview = () => {
  showPreview.value = false
  previewData.value = null
  videoError.value = false
  isDownloading.value = false
}

const handleVideoError = () => {
  videoError.value = true
}

  // 从预览弹窗下载文件
  const downloadFromPreview = async () => {
    if (!previewData.value) return;

    isDownloading.value = true;
    showToast('正在准备下载...', 'info');

    const urls = previewData.value.tunnel || [];
    if (urls.length === 0) {
      showToast('没有找到可下载的链接', 'error');
      isDownloading.value = false;
      return;
    }

    try {
      for (let i = 0; i < urls.length; i++) {
        const url = urls[i];
        const isTunnel = url.includes('/tunnel?');
        const fileType = i === 0 ? '视频' : '音频';
        const ext = i === 0 ? (previewData.value.filenameAttributes?.extension || 'mp4') : 'mp3';
        const title = previewData.value.filenameAttributes?.title || 'media';
        const filename = urls.length > 1 ? `${title}_${fileType}.${ext}` : `${title}.${ext}`;
        
        console.log(`🚀 开始下载文件 ${i+1}/${urls.length}:`, { url: url.substring(0, 80)+'...', filename, isTunnel });

        if (isTunnel) {
          // 对于服务器代理的链接，必须使用fetch+blob下载
          console.log(`Tunnel链接 detected, using fetch+blob for ${filename}`);
          const response = await fetch(url);
          if (!response.ok) throw new Error(`下载失败: ${response.status} ${response.statusText}`);
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(blobUrl);

        } else {
          // 对于直接链接，可以直接下载
          const link = document.createElement('a');
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        if (i < urls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 800)); // 多文件下载间隔
        }
      }

      showToast(`✅ 下载已启动，共 ${urls.length} 个文件`, 'success');
      closePreview();

    } catch (error) {
      console.error('❌ 下载失败:', error);
      showToast(error instanceof Error ? error.message : '下载过程中发生未知错误', 'error');
    } finally {
      isDownloading.value = false;
    }
  };

// 新标签页打开视频（备用方案）
const openInNewTab = () => {
  if (!previewData.value?.tunnel?.[0]) return
  
  const url = previewData.value.tunnel[0]
  console.log('🔗 在新标签页打开视频:', url)
  
  window.open(url, '_blank', 'noopener,noreferrer')
  
  showToast('已在新标签页打开视频', 'info')
}

// Picker弹窗管理
const openPicker = (data: any) => {
  console.log('📋 打开picker选择器，数据:', data);
  pickerData.value = data
  selectedItems.value = new Set() // 重置选择
  showPicker.value = true
}

const closePicker = () => {
  showPicker.value = false
  pickerData.value = null
  selectedItems.value = new Set()
  isPickerDownloading.value = false
}

// 切换项目选择状态
const toggleItemSelection = (index: number) => {
  const newSelection = new Set(selectedItems.value)
  if (newSelection.has(index)) {
    newSelection.delete(index)
  } else {
    newSelection.add(index)
  }
  selectedItems.value = newSelection
}

// 全选/取消全选
const toggleSelectAll = () => {
  if (selectedItems.value.size === pickerData.value?.picker?.length) {
    selectedItems.value = new Set()
  } else {
    selectedItems.value = new Set(Array.from({ length: pickerData.value?.picker?.length || 0 }, (_, i) => i))
  }
}

// 下载picker选中的项目
  const downloadSelectedItems = async () => {
    if (!pickerData.value?.picker || selectedItems.value.size === 0) return
    
    isPickerDownloading.value = true
    const selectedIndexes = Array.from(selectedItems.value);
    const selectedItemsData = selectedIndexes.map(index => pickerData.value.picker[index]);

    try {
      showToast(`开始批量下载，共${selectedItemsData.length}个文件`, 'info')
      
      for (let i = 0; i < selectedItemsData.length; i++) {
        const item = selectedItemsData[i]
        const url = item.url;
        
        try {
          const filename = `${item.type}_${Date.now()}_${i + 1}.${item.type === 'video' ? 'mp4' : 'jpg'}`
          
          // 智能下载策略，用于处理防盗链
          const hasAntiHotlink = url.includes('xhscdn.com') || url.includes('xiaohongshu.com') || 
                                url.includes('instagram.com') || url.includes('cdninstagram.com') ||
                                url.includes('twimg.com');

          console.log('🎯 Picker批量下载分析:', {
            fileIndex: i + 1,
            totalFiles: selectedItemsData.length,
            url: url.substring(0, 80) + '...',
            filename,
            type: item.type,
            strategy: hasAntiHotlink ? 'fetch+blob' : 'direct-download'
          });

          if (hasAntiHotlink) {
            // 对于防盗链平台，使用fetch+blob确保下载成功
            console.log(`检测到防盗链平台，使用fetch+blob下载: ${filename}`);
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(blobUrl); // 释放内存

          } else {
            // 稳定平台：让浏览器直接下载
            const link = document.createElement('a')
            link.href = url
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
          }
          
          console.log(`✅ 文件 ${i + 1}/${selectedItemsData.length} 下载已启动: ${filename}`)
          
          // 文件间隔
          if (selectedItemsData.length > 1 && i < selectedItemsData.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 800))
          }
          
        } catch (error) {
          console.error(`❌ 下载文件 ${i + 1} 失败:`, error)
          const errorMessage = error instanceof Error ? error.message : '下载失败'
          showToast(`下载文件 ${i + 1} 失败: ${errorMessage}`, 'error')
        }
      }
      
      showToast(`✅ 批量下载任务已全部启动`, 'success')
      closePicker()
      
    } catch (error) {
      console.error('❌ 批量下载过程出错:', error)
      const errorMessage = error instanceof Error ? error.message : '下载失败'
      showToast(`下载失败: ${errorMessage}`, 'error')
    } finally {
      isPickerDownloading.value = false
    }
  }

// Function to download a Blob
function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Function to process a single queue item（恢复并重写，支持 remux）
async function processQueueItem(item: QueuedItem) {
  try {
    item.status = 'processing';
    item.progress = 50;
    // 仅针对 B 站且 tunnel 返回两个流时 remux
    const isBilibili = ((item.response as any).service === 'bilibili' || (item.response.filename && item.response.filename.startsWith('bilibili_')));
    if (isBilibili && (item.response as any).tunnel && Array.isArray((item.response as any).tunnel) && (item.response as any).tunnel.length === 2) {
      const [videoUrl, audioUrl] = (item.response as any).tunnel;
      const videoResp = await fetch(videoUrl);
      const audioResp = await fetch(audioUrl);
      if (!videoResp.ok || !audioResp.ok) throw new Error('音视频流下载失败');
      const videoBlob = await videoResp.blob();
      const audioBlob = await audioResp.blob();
      showToast('正在合并B站音视频...', 'info');
      const mergedBlob = await remux(videoBlob, audioBlob);
      const filename = item.response.filename || 'bilibili_merge.mp4';
      downloadFile(mergedBlob, filename);
      item.status = 'done';
      item.progress = 100;
    } else {
      // 其它平台/单流，保持原有逻辑
      if (item.response.url) {
        const response = await fetch(item.response.url);
        if (!response.ok) throw new Error('文件下载失败');
        const blob = await response.blob();
        const filename = item.response.filename || 'download';
        downloadFile(blob, filename);
        item.status = 'done';
        item.progress = 100;
      } else {
        throw new Error('无可用下载链接');
      }
    }
  } catch (error) {
    console.error('Error processing queue item:', error);
    item.status = 'error';
    item.progress = 0;
    showToast(error instanceof Error ? error.message : '队列处理失败', 'error');
  }
}

// 监听队列，自动处理新任务
watch(processingQueue, (newQueue, oldQueue) => {
  const addedItems = newQueue.filter((newItem: QueuedItem) => !oldQueue.some((oldItem: QueuedItem) => oldItem.id === newItem.id));
  addedItems.forEach((item: QueuedItem) => {
    if (item.status === 'queued') {
      processQueueItem(item);
    }
  });
}, { deep: true });

// 支持的平台列表
const supportedPlatforms = [
  'YouTube', 'TikTok', 'Instagram', 'Twitter/X', 'Bilibili',
  'SoundCloud', 'Vimeo', 'Facebook', 'Reddit', 'Tumblr',
  'Pinterest', 'Twitch', 'Dailymotion', 'VK', 'Ok.ru'
]

// 生命周期
onMounted(() => {
  // 初始化设置系统
  loadSettings()
  initializeAPI()
  
  console.log('Cobalt Vue 应用已启动')
})
</script>

<template>
  <div id="app" class="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
    <!-- 背景霓虹光效 -->
    <div class="absolute inset-0">
      <!-- 主要光源 -->
      <div 
        class="absolute top-1/4 left-1/3 w-96 h-96 rounded-full blur-[100px] animate-pulse"
        style="animation-duration: 4s; background: rgba(244, 114, 182, 0.2);"
      ></div>
      <div 
        class="absolute bottom-1/3 right-1/4 w-80 h-80 bg-blue-500/15 rounded-full blur-[80px] animate-pulse"
        style="animation-duration: 6s; animation-delay: 2s;"
      ></div>
      <!-- 额外光点 -->
      <div 
        class="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-[60px] animate-pulse"
        style="animation-duration: 8s; animation-delay: 1s;"
      ></div>
    </div>

    <!-- 主要内容区域 -->
    <div class="relative z-10 flex flex-col min-h-screen pb-safe">
      <!-- 头部 -->
      <header class="px-6 py-6 relative">
        <!-- Logo - 左上角 -->
        <div class="absolute top-6 left-6 flex items-center space-x-3 z-20">
          <div class="relative">
            <div class="w-12 h-12 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-pink-500/30">
              <!-- SnapMedia Logo - 简约下载图标 -->
              <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <!-- 简约下载箭头 -->
                <path d="M12 2C13.1 2 14 2.9 14 4V12L17.5 8.5C18.3 7.7 19.7 7.7 20.5 8.5C21.3 9.3 21.3 10.7 20.5 11.5L13.1 18.9C12.5 19.5 11.5 19.5 10.9 18.9L3.5 11.5C2.7 10.7 2.7 9.3 3.5 8.5C4.3 7.7 5.7 7.7 6.5 8.5L10 12V4C10 2.9 10.9 2 12 2Z"/>
                <!-- 底部基线 -->
                <path d="M4 20C4 19.4 4.4 19 5 19H19C19.6 19 20 19.4 20 20C20 20.6 19.6 21 19 21H5C4.4 21 4 20.6 4 20Z"/>
              </svg>
            </div>
            <!-- 霓虹光环 -->
            <div class="absolute inset-0 w-12 h-12 bg-pink-500/40 rounded-xl blur-md -z-10 animate-pulse"></div>
          </div>
          <div>
            <h2 class="text-xl font-bold bg-gradient-to-r from-white via-pink-200 to-pink-300 bg-clip-text text-transparent">
              SnapMedia
            </h2>
          </div>
        </div>

        <!-- 设置按钮 - 右上角 -->
        <button
          @click="showSettings = !showSettings"
          class="absolute top-6 right-6 flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-white/10 
                 hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white z-20"
        >
          <Settings class="w-5 h-5" />
          <span class="hidden sm:inline">设置</span>
        </button>
        
        <!-- 主标题区域 - 居中，增加顶部间距 -->
        <div class="max-w-4xl mx-auto pt-24 text-center">
          <div class="space-y-6 mb-8">
            <!-- 主标题 -->
            <h1 class="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-pink-200 to-pink-300 bg-clip-text text-transparent">
              跨平台媒体下载工具
            </h1>

            <!-- 副口号 -->
            <p class="text-slate-300 text-lg max-w-2xl mx-auto leading-relaxed">
              一键获取你喜爱的内容
              <br>
              <span class="text-base text-slate-400 font-medium">快速 • 安全 • 多平台支持</span>
            </p>
          </div>
        </div>
      </header>

      <!-- 主要内容 -->
      <main class="flex-1 pb-8 space-y-6">
        <!-- 下载界面 - 居中显示 -->
        <div class="px-6">
          <div class="max-w-4xl mx-auto">
            <div class="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
              <DownloadInterface
                @show-toast="showToast"
                @open-preview="openPreview"
                @open-picker="openPicker"
              />
            </div>
          </div>
        </div>
        
        <!-- 支持的平台 - 居中显示 -->
        <div class="px-6">
          <div class="flex justify-center">
            <div 
              class="relative group cursor-pointer"
              @mouseenter="showAllPlatforms = true"
              @mouseleave="showAllPlatforms = false"
            >
              <!-- 默认显示的标签 -->
              <div class="flex items-center space-x-2 px-4 py-2 bg-slate-800/50 border border-white/10 rounded-full 
                          hover:bg-slate-700/50 transition-all duration-300 group-hover:border-pink-400/30">
                <span class="text-sm text-slate-300 group-hover:text-white">支持的平台</span>
                <span class="text-xs text-pink-400 font-medium">{{ supportedPlatforms.length }}+</span>
                <svg class="w-4 h-4 text-slate-400 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
              
              <!-- Hover 时显示的完整平台列表 -->
              <div 
                v-show="showAllPlatforms"
                class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-80 
                       bg-slate-900/95 backdrop-blur-xl border border-white/20 rounded-2xl p-4 shadow-2xl z-20
                       animate-fade-in"
              >
                <div class="text-center mb-3">
                  <h4 class="text-white font-semibold text-sm">支持的平台</h4>
                </div>
                <div class="flex flex-wrap gap-2 justify-center">
                  <span 
                    v-for="platform in supportedPlatforms" 
                    :key="platform"
                    class="px-3 py-1 bg-pink-500/20 text-pink-300 text-xs rounded-lg border border-pink-500/30
                           hover:bg-pink-500/30 hover:text-pink-200 transition-colors"
                  >
                    {{ platform }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 页脚 -->
      <footer class="px-6 py-6 text-center">
        <div class="max-w-4xl mx-auto">
          <!-- 版本信息 -->
          <div class="text-sm text-slate-400 space-y-1">
            <div>
              <span class="text-white font-medium">SnapMedia</span> 
              <span> - Media in a Snap!</span>
            </div>
            <div>
              <span>基于开源项目 </span>
              <a 
                href="https://github.com/imputnet/cobalt" 
                target="_blank" 
                rel="noopener noreferrer"
                class="text-pink-400 hover:text-pink-300 transition-colors"
              >
                Cobalt
              </a>
              <span> 构建</span>
            </div>
          </div>
        </div>
      </footer>
    </div>

    <!-- 设置面板 -->
    <SettingsPanel 
      :is-open="showSettings"
      @close="showSettings = false"
    />

    <!-- Toast消息 -->
    <div class="toast-container">
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :message="toast.message"
        :type="toast.type"
        :duration="toast.duration"
        @close="removeToast(toast.id)"
      />
    </div>

    <!-- 全局处理队列 -->
    <div
      v-if="processingQueue.length > 0"
      class="fixed bottom-4 right-4 bg-slate-800/80 backdrop-blur-lg border border-slate-700 rounded-2xl shadow-2xl w-full max-w-sm p-4 z-[9998]"
    >
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold text-white">
          处理队列 <span class="text-xs align-top bg-blue-500/80 text-white px-1.5 py-0.5 rounded-full">BETA</span>
        </h3>
        <button
          @click="processingQueue = []"
          class="text-red-400 hover:text-red-300 transition-colors text-sm flex items-center gap-1"
        >
          <X class="w-4 h-4" /> 清除
        </button>
      </div>
      <div class="space-y-3 max-h-64 overflow-y-auto pr-2">
        <div v-for="item in processingQueue" :key="item.id" class="bg-slate-900/70 p-3 rounded-lg">
          <p class="text-sm text-white truncate mb-2 font-medium" :title="item.response.filename">{{ item.response.filename }}</p>
          <div class="w-full bg-slate-700 rounded-full h-2.5">
            <div class="bg-blue-600 h-2.5 rounded-full" :style="{ width: item.progress + '%' }"></div>
          </div>
          <p class="text-xs text-slate-400 mt-1 text-right">{{ item.status }}...</p>
        </div>
      </div>
    </div>

    <!-- 全局预览弹窗 -->
    <div
      v-if="showPreview"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
      @click.self="closePreview"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 m-4">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-xl font-bold text-white">视频预览</h3>
          <button
            @click="closePreview"
            class="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-6">
          <!-- 视频信息 -->
          <div v-if="previewData" class="text-center">
            <h4 class="text-lg font-semibold text-white mb-2">
              {{ previewData.filenameAttributes?.title || '未知标题' }}
            </h4>
            <p class="text-gray-400 text-sm">
              {{ previewData.filenameAttributes?.author || '未知作者' }}
            </p>
            <p class="text-gray-400 text-sm mt-2">
              质量: {{ previewData.filenameAttributes?.qualityLabel || '未知' }} | 
              格式: {{ previewData.filenameAttributes?.youtubeFormat || '未知' }}
            </p>
          </div>

          <!-- 视频预览（如果有视频链接） -->
          <div v-if="previewData?.tunnel?.[0]" class="aspect-video bg-black rounded-lg overflow-hidden relative">
            <!-- 尝试播放视频 - 优先使用原始URL，回退到tunnel URL -->
            <video
              v-if="!videoError"
              :src="previewData.tunnel[0]"
              class="w-full h-full"
              controls
              preload="metadata"
              @error="handleVideoError"
            >
              您的浏览器不支持视频播放
            </video>
            
            <!-- 视频加载失败时显示的占位符 -->
            <div v-if="videoError" class="w-full h-full flex items-center justify-center bg-slate-800/50">
              <div class="text-center text-gray-400">
                <div class="text-4xl mb-2">📹</div>
                <p class="text-sm text-white font-medium">
                  <span v-if="previewData.tunnel[0].includes('/tunnel?')">代理视频预览失败</span>
                  <span v-else>视频预览不可用</span>
                </p>
                <p class="text-xs mt-1 text-gray-300">
                  <span v-if="previewData.tunnel[0].includes('/tunnel?')">Cobalt代理可能需要特殊处理</span>
                  <span v-else>某些平台视频需要直接下载</span>
                </p>
                <p class="text-xs text-pink-300 mt-2">点击下方按钮直接下载</p>
              </div>
            </div>
            
            <!-- 视频加载中的提示 -->
            <div v-if="!videoError" class="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              <span v-if="previewData.tunnel[0].includes('/tunnel?')">
                🔄 通过Cobalt代理加载...
              </span>
              <span v-else>
                🎬 视频加载中...
              </span>
            </div>
          </div>

          <!-- 说明文本 -->
          <div class="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <h5 class="text-yellow-400 font-semibold mb-2">📁 文件信息</h5>
            
            <!-- 合并类型说明 -->
            <div v-if="previewData.type === 'merge'" class="text-gray-300 text-sm mb-3">
              <p class="mb-2">YouTube视频下载包含两个分离的文件：</p>
              <ul class="list-disc list-inside ml-2 space-y-1">
                <li><strong>视频文件</strong>（无音频） - 用于上方预览</li>
                <li><strong>音频文件</strong>（无视频）</li>
              </ul>
              <p class="mt-2 text-yellow-300">您需要使用视频编辑软件将这两个文件合并。</p>
            </div>
            
            <!-- 单文件说明 -->
            <div v-else-if="previewData.type === 'single' || previewData.type === 'redirect'" class="text-gray-300 text-sm mb-3">
              <p>✅ 检测到单个媒体文件，点击下载即可保存。</p>
              <p class="text-green-300 text-xs mt-1">这是一个完整的媒体文件，无需额外处理。</p>
            </div>
            
            <!-- 多文件说明 -->
            <div v-else class="text-gray-300 text-sm mb-3">
              <p>📦 检测到多个文件，将分别下载。</p>
              <p class="text-blue-300 text-xs mt-1">文件数量: {{ previewData.tunnel?.length || 0 }}</p>
            </div>
          </div>

          <!-- 下载按钮区域 -->
          <div class="flex flex-col sm:flex-row justify-center gap-3">
            <!-- 主下载按钮 -->
            <button
              @click="downloadFromPreview"
              :disabled="isDownloading"
              class="px-8 py-3 text-white rounded-lg
                     bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700
                     shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50
                     transition-all duration-200 font-medium hover:scale-105
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]"
            >
              <Loader2 v-if="isDownloading" class="w-5 h-5 animate-spin" />
              <Download v-else class="w-5 h-5" />
              <span v-if="isDownloading">正在下载...</span>
              <span v-else-if="previewData.type === 'merge'">下载分离文件 (视频 + 音频)</span>
              <span v-else-if="previewData.type === 'single' || previewData.type === 'redirect'">下载文件</span>
              <span v-else>下载所有文件 ({{ previewData.tunnel?.length || 0 }}个)</span>
            </button>
            
            <!-- 新标签页打开按钮（备用选项） -->
            <button
              v-if="previewData?.tunnel?.[0] && !previewData.tunnel[0].includes('/tunnel?')"
              @click="openInNewTab"
              class="px-6 py-3 text-gray-300 rounded-lg
                     bg-slate-700 hover:bg-slate-600 border border-slate-600 hover:border-slate-500
                     transition-all duration-200 font-medium hover:scale-105
                     flex items-center justify-center gap-2 min-w-[160px]"
            >
              <ExternalLink class="w-4 h-4" />
              <span>新标签页打开</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 全局Picker选择器弹窗 -->
    <div
      v-if="showPicker"
      class="fixed inset-0 bg-black/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
      @click.self="closePicker"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8 m-4">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h3 class="text-xl font-bold text-white">选择要下载的文件</h3>
            <p class="text-gray-400 text-sm mt-1">找到 {{ pickerData?.picker?.length || 0 }} 个文件</p>
          </div>
          <button
            @click="closePicker"
            class="p-2 rounded-lg hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          >
            <X class="w-6 h-6" />
          </button>
        </div>

        <div class="space-y-4">
          <!-- 全选控制 -->
          <div class="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-600">
            <div class="flex items-center space-x-3">
              <input
                type="checkbox"
                :checked="selectedItems.size === pickerData?.picker?.length && selectedItems.size > 0"
                :indeterminate="selectedItems.size > 0 && selectedItems.size < (pickerData?.picker?.length || 0)"
                @change="toggleSelectAll"
                class="w-4 h-4 text-pink-500 rounded border-gray-300 focus:ring-pink-500"
              />
              <span class="text-white font-medium">
                {{ selectedItems.size === pickerData?.picker?.length ? '取消全选' : '全选' }}
              </span>
            </div>
            <span class="text-gray-400 text-sm">
              已选择 {{ selectedItems.size }} / {{ pickerData?.picker?.length || 0 }} 个文件
            </span>
          </div>

          <!-- 文件列表 -->
          <div class="picker-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              v-for="(item, index) in pickerData?.picker"
              :key="index"
              class="relative group"
            >
              <div
                @click="toggleItemSelection(index)"
                :class="[
                  'cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200',
                  selectedItems.has(index) 
                    ? 'border-pink-500 bg-pink-500/10' 
                    : 'border-slate-600 hover:border-slate-500'
                ]"
              >
                <!-- 缩略图 -->
                <div class="picker-item-thumb aspect-video bg-slate-800 relative">
                  <img
                    v-if="item.thumb"
                    :src="item.thumb"
                    :alt="`${item.type} ${index + 1}`"
                    class="w-full h-full object-cover"
                    @error="() => {}"
                  />
                  <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
                    <div class="text-center">
                      <div class="text-3xl mb-2">
                        {{ item.type === 'video' ? '🎥' : '📷' }}
                      </div>
                      <p class="text-sm">{{ item.type === 'video' ? '视频' : '图片' }}</p>
                    </div>
                  </div>
                  
                  <!-- 选择状态指示器 -->
                  <div class="absolute top-2 right-2">
                    <div
                      :class="[
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                        selectedItems.has(index)
                          ? 'bg-pink-500 border-pink-500 text-white'
                          : 'bg-black/50 border-white/50 text-white/70'
                      ]"
                    >
                      <CheckCircle v-if="selectedItems.has(index)" class="w-4 h-4" />
                      <span v-else class="text-xs font-bold">{{ index + 1 }}</span>
                    </div>
                  </div>

                  <!-- 文件类型标签 -->
                  <div class="absolute bottom-2 left-2">
                    <span
                      :class="[
                        'px-2 py-1 rounded text-xs font-medium',
                        item.type === 'video' 
                          ? 'bg-blue-500/80 text-white' 
                          : 'bg-green-500/80 text-white'
                      ]"
                    >
                      {{ item.type === 'video' ? 'VIDEO' : 'IMAGE' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 下载按钮 -->
          <div class="flex justify-center pt-4">
            <button
              @click="downloadSelectedItems"
              :disabled="selectedItems.size === 0 || isPickerDownloading"
              class="px-8 py-3 text-white rounded-lg
                     bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700
                     shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50
                     transition-all duration-200 font-medium hover:scale-105
                     disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[200px]"
            >
              <Loader2 v-if="isPickerDownloading" class="w-5 h-5 animate-spin" />
              <Download v-else class="w-5 h-5" />
              <span v-if="isPickerDownloading">正在下载...</span>
              <span v-else>批量下载选中文件 ({{ selectedItems.size }})</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 全局样式由 main.css 处理 */

/* 确保页面可以正常滚动 */
html, body {
  overflow-x: hidden;
  overflow-y: auto;
  scroll-behavior: smooth;
}

#app {
  min-height: 100vh;
  overflow-x: hidden;
}

/* 确保主要内容区域可以滚动 */
main {
  overflow: visible;
}

/* Toast容器样式 */
.toast-container {
  position: fixed;
  top: 24px;
  left: 16px;
  right: 16px;
  z-index: 40;
  pointer-events: none;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.toast-container > * {
  pointer-events: auto;
}

/* 平台展示动画 */
.animate-fade-in {
  animation: fadeInUp 0.2s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.processing-queue {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 300px;
  background-color: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  color: white;
  z-index: 1000;
}

.processing-queue h3 {
  margin-top: 0;
  font-size: 1.1rem;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
  margin-bottom: 0.5rem;
}

.processing-queue ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.processing-queue li {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #333;
}

.processing-queue li:last-child {
  border-bottom: none;
}

.queue-item-processing {
  color: #f0ad4e; /* Orange */
}

.queue-item-done {
  color: #5cb85c; /* Green */
  text-decoration: line-through;
}

.queue-item-error {
  color: #d9534f; /* Red */
}
</style>
