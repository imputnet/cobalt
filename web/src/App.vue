<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { Settings, X, Download, Loader2, ExternalLink, CheckCircle, XCircle } from 'lucide-vue-next'
import DownloadInterface from '@/components/DownloadInterface.vue'
import SettingsPanel from '@/components/SettingsPanel.vue'
import Toast from '@/components/Toast.vue'
import { loadSettings, initializeAPI } from '@/stores/settings'
import type { CobaltResponse, QueuedItem } from '@/types';
import { remux } from './lib/remuxer';
import { useSeo } from '@/composables/useSeo'

// SEO 和 Analytics 设置
const { trackEvent, trackPageView } = useSeo({
  title: 'SnapMedia - 跨平台媒体下载工具 | 支持YouTube、TikTok、Instagram等15+平台',
  description: 'SnapMedia是一款免费的跨平台媒体下载工具，支持YouTube、TikTok、Instagram、Twitter、Bilibili等15+热门平台的视频、音频下载。快速、安全、无水印。',
  canonical: 'https://www.snapmedia.app/'
})

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

// Function to process a single queue item（修复逻辑错误，支持 remux）
async function processQueueItem(item: QueuedItem) {
  try {
    item.status = 'processing';
    item.currentStep = '正在分析链接...';
    
    console.log('🚀 开始处理队列项目:', {
      service: (item.response as any).service,
      status: item.response.status,
      hasTunnel: !!(item.response as any).tunnel,
      tunnelLength: Array.isArray((item.response as any).tunnel) ? (item.response as any).tunnel.length : 'not-array'
    });
    
    // 检测需要remux合并的平台和条件
    const service = (item.response as any).service;
    const hasDualStreams = (item.response as any).tunnel && Array.isArray((item.response as any).tunnel) && (item.response as any).tunnel.length === 2;
    
    // 简化判断：有双流就合并（不限制平台）
    const shouldRemux = hasDualStreams;
    
    console.log('🔍 [processQueueItem] 前端合并检查:', {
      service,
      responseStatus: item.response.status,
      hasTunnel: !!(item.response as any).tunnel,
      tunnelLength: Array.isArray((item.response as any).tunnel) ? (item.response as any).tunnel.length : 'not-array',
      hasDualStreams,
      shouldRemux,
      filename: item.response.filename
    });
    
          // 前端智能合并：检测到双流就合并
      if (shouldRemux) {
      console.log(`🎬 检测到${service}双流，开始前端合并...`);
      item.currentStep = `检测到${service}分离流，准备前端合并...`;
      
      const tunnelArray = (item.response as any).tunnel;
      const [videoUrl, audioUrl] = tunnelArray;
      
      console.log('🔗 获取到流URL:', {
        service,
        tunnelCount: tunnelArray.length,
        videoUrl: videoUrl?.substring(0, 150) + '...',
        audioUrl: audioUrl?.substring(0, 150) + '...',
        hasValidUrls: !!(videoUrl && audioUrl)
      });
      
      if (!videoUrl || !audioUrl) {
        throw new Error('音视频流URL获取失败');
      }
      
      showToast('🚀 浏览器智能处理：正在下载音视频流...', 'info');
      
      item.currentStep = '正在下载视频流...';
      console.log('📥 开始下载视频流...', {
        url: videoUrl?.substring(0, 150) + '...',
        urlLength: videoUrl?.length
      });
      
      // 智能下载方式：检测URL类型并使用合适的下载方法
      console.log(`📺 [${service}] 开始下载流...`);
      
      // 检测是否为代理URL，使用不同的fetch选项
      const isProxyUrl = (url: string) => url && url.includes('/tunnel?');
      const videoIsProxy = isProxyUrl(videoUrl);
      const audioIsProxy = isProxyUrl(audioUrl);
      
      console.log('🔗 URL类型检测:', {
        videoIsProxy,
        audioIsProxy,
        videoUrl: videoUrl?.substring(0, 100) + '...',
        audioUrl: audioUrl?.substring(0, 100) + '...'
      });
      
      // 为代理URL设置特殊的fetch选项
      const fetchOptions: RequestInit = {
        mode: 'cors' as RequestMode,
        credentials: 'same-origin' as RequestCredentials,
        headers: {
          'Accept': '*/*',
        }
      };
      
      const videoResp = await fetch(videoUrl, videoIsProxy ? fetchOptions : undefined);
      
      item.currentStep = '正在下载音频流...';
      console.log('📥 开始下载音频流...');
      const audioResp = await fetch(audioUrl, audioIsProxy ? fetchOptions : undefined);
      
      console.log('📊 流下载响应状态:', {
        videoOk: videoResp.ok,
        videoStatus: videoResp.status,
        videoStatusText: videoResp.statusText,
        videoContentLength: videoResp.headers.get('content-length'),
        videoContentType: videoResp.headers.get('content-type'),
        audioOk: audioResp.ok,
        audioStatus: audioResp.status,
        audioStatusText: audioResp.statusText,
        audioContentLength: audioResp.headers.get('content-length'),
        audioContentType: audioResp.headers.get('content-type')
      });
      
      if (!videoResp.ok || !audioResp.ok) {
        console.error('❌ 流下载失败详情:', {
          videoError: !videoResp.ok ? {
            status: videoResp.status,
            statusText: videoResp.statusText,
            url: videoUrl?.substring(0, 100) + '...'
          } : null,
          audioError: !audioResp.ok ? {
            status: audioResp.status,
            statusText: audioResp.statusText,
            url: audioUrl?.substring(0, 100) + '...'
          } : null
        });
        throw new Error(`音视频流下载失败 - Video: ${videoResp.status}, Audio: ${audioResp.status}`);
      }
      
      item.currentStep = '正在处理视频数据...';
      console.log('📦 转换为Blob对象...');
      showToast('📦 浏览器智能处理：正在解析音视频数据...', 'info');
      
      // 分步处理，避免UI阻塞
      console.log('📦 处理视频流...');
      const videoBlob = await videoResp.blob();
      
      item.currentStep = '正在处理音频数据...';
      console.log('📦 处理音频流...');  
      const audioBlob = await audioResp.blob();
      
      item.currentStep = '数据处理完成，准备合并...';
      console.log('✅ 流数据处理完成');
      
      console.log('📊 Blob信息:', {
        videoSize: (videoBlob.size / 1024 / 1024).toFixed(2) + 'MB',
        audioSize: (audioBlob.size / 1024 / 1024).toFixed(2) + 'MB',
        videoType: videoBlob.type,
        audioType: audioBlob.type
      });
      
      console.log('📥 视频和音频流下载完成，开始合并...');
      showToast(`🎬 浏览器智能合并：正在处理${service}音视频...`, 'info');
      
      item.currentStep = '正在初始化视频处理引擎...';
      console.log('🔄 调用remux函数...');
      showToast('正在初始化视频处理引擎...', 'info');
      try {
        const mergedBlob = await remux(videoBlob, audioBlob, (step: string) => {
          item.currentStep = step; // remux函数中会传递步骤信息
        });
        
        item.currentStep = '合并完成，准备下载...';
        console.log('✅ remux合并完成，文件大小:', (mergedBlob.size / 1024 / 1024).toFixed(2) + 'MB');
        showToast('✨ 浏览器合并完成！准备下载...', 'success');
        
        const filename = item.response.filename || `${service}_merged.mp4`;
        
        item.currentStep = '正在启动下载...';
        console.log(`✅ ${service}视频合并完成，开始下载:`, filename);
        downloadFile(mergedBlob, filename);
        
        item.status = 'done';
        item.currentStep = '下载完成！';
        console.log(`🎉 ${service}视频处理完全完成！`);
      } catch (remuxError) {
        console.error('❌ 浏览器合并失败，启用降级方案:', remuxError);
        
        if (videoBlob.size > 0 && audioBlob.size > 0) {
          // 如果文件下载成功但合并失败，分别下载
          showToast('⚠️ 浏览器合并失败，将分别下载视频和音频', 'warning');
          
          item.currentStep = '合并失败，正在分别下载视频和音频...';
          console.log('🔄 启用降级方案：分别下载视频和音频文件');
          
          const baseFilename = item.response.filename?.replace(/\.[^/.]+$/, '') || `${service}_video`;
          
          // 下载视频文件
          item.currentStep = '正在下载视频文件...';
          downloadFile(videoBlob, `${baseFilename}_video.mp4`);
          
          // 下载音频文件  
          item.currentStep = '正在下载音频文件...';
          downloadFile(audioBlob, `${baseFilename}_audio.m4a`);
          
          item.status = 'done';
          item.currentStep = '已分别下载视频和音频文件';
          showToast('✅ 已分别下载视频和音频文件', 'success');
          console.log(`🎉 ${service}视频降级下载完成！`);
          
        } else {
          // 文件下载就失败了
          showToast('❌ 音视频文件下载失败', 'error');
          item.status = 'error';
          item.currentStep = '下载失败：无法获取音视频文件';
        }
      }
      
    } else if ((item.response as any).tunnel && Array.isArray((item.response as any).tunnel)) {
      // 处理其他多流情况（非双流的多个文件）
      console.log('🎵 检测到多流响应，分别下载所有流...');
      item.currentStep = '正在下载多个文件...';
      const tunnelUrls = (item.response as any).tunnel;
      
      for (let i = 0; i < tunnelUrls.length; i++) {
        item.currentStep = `正在下载第 ${i+1}/${tunnelUrls.length} 个文件...`;
        const url = tunnelUrls[i];
        const response = await fetch(url);
        if (!response.ok) throw new Error(`下载流 ${i+1} 失败`);
        const blob = await response.blob();
        const filename = `${item.response.filename || 'media'}_${i+1}.${i === 0 ? 'mp4' : 'mp3'}`;
        downloadFile(blob, filename);
      }
      
      item.status = 'done';
      item.currentStep = '所有文件下载完成！';
      
    } else if (item.response.url) {
      // 处理单文件下载
      console.log('📁 检测到单文件下载...');
      item.currentStep = '正在下载文件...';
      const response = await fetch(item.response.url);
      if (!response.ok) throw new Error('文件下载失败');
      
      item.currentStep = '正在处理文件数据...';
      const blob = await response.blob();
      const filename = item.response.filename || 'download';
      
      item.currentStep = '正在启动下载...';
      downloadFile(blob, filename);
      item.status = 'done';
      item.currentStep = '下载完成！';
      
    } else {
      throw new Error('无可用下载链接');
    }
    
    console.log('✅ 队列项目处理完成');
    
  } catch (error) {
    console.error('❌ 队列项目处理失败:', error);
    item.status = 'error';
    item.currentStep = '处理失败：' + (error instanceof Error ? error.message : '未知错误');
    showToast(error instanceof Error ? error.message : '队列处理失败', 'error');
  }
}

// 监听队列，自动处理新任务
watch(processingQueue, (newQueue, oldQueue) => {
  console.log('👀 [App] 队列监听器触发');
  console.log('📈 [App] 队列变化:', {
    oldLength: oldQueue.length,
    newLength: newQueue.length,
    change: newQueue.length - oldQueue.length
  });
  
  const addedItems = newQueue.filter((newItem: QueuedItem) => !oldQueue.some((oldItem: QueuedItem) => oldItem.id === newItem.id));
  
  console.log('🆕 [App] 检测到新增项目数量:', addedItems.length);
  
  if (addedItems.length > 0) {
    addedItems.forEach((item: QueuedItem, index: number) => {
      console.log(`🎯 [App] 处理新增项目 ${index + 1}/${addedItems.length}:`, {
        id: item.id,
        status: item.status,
        service: (item.response as any).service,
        type: (item.response as any).type
      });
      
      if (item.status === 'queued') {
        console.log(`🚀 [App] 启动处理队列项目 ID: ${item.id}`);
        processQueueItem(item);
      } else {
        console.log(`⏸️ [App] 跳过非queued状态的项目 ID: ${item.id}, 状态: ${item.status}`);
      }
    });
  } else {
    console.log('🤔 [App] 没有检测到新增项目，可能是状态更新');
  }
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
  
  console.log('SnapMedia Vue 应用已启动')
})

function addToQueue({ response, request }: { response: any, request: any }) {
  console.log('📥 [App] addToQueue函数被调用');
  console.log('📊 [App] 接收到的响应数据:', {
    status: response.status,
    service: response.service,
    type: response.type,
    hasTunnel: !!response.tunnel,
    tunnelLength: Array.isArray(response.tunnel) ? response.tunnel.length : 'not-array'
  });
  
  // 智能文件名提取逻辑
  let enhancedFilename = response.filename;
  
  if (!enhancedFilename || enhancedFilename.trim() === '') {
    // 尝试从原始URL提取文件名
    try {
      const url = new URL(request.url);
      const pathname = url.pathname;
      const segments = pathname.split('/').filter(Boolean);
      
      if (segments.length > 0) {
        // 获取路径的最后一段作为基础名称
        let urlBaseName = segments[segments.length - 1];
        
        // 移除常见的查询参数标识符
        urlBaseName = urlBaseName.replace(/[?&].*$/, '');
        
        if (urlBaseName && urlBaseName.length > 0) {
          enhancedFilename = urlBaseName;
        }
      }
    } catch (error) {
      console.log('URL 解析失败，使用服务名称生成文件名');
    }
    
    // 如果仍然没有文件名，使用服务名称和时间戳
    if (!enhancedFilename || enhancedFilename.trim() === '') {
      const service = response.service || '媒体';
      const timestamp = new Date().toISOString().slice(0, 16).replace(/[-:]/g, '');
      enhancedFilename = `${service}_${timestamp}`;
    }
  }
  
  // 确保文件名不会太长（限制在50个字符以内）
  if (enhancedFilename.length > 50) {
    const extension = enhancedFilename.split('.').pop();
    const baseName = enhancedFilename.replace(/\.[^/.]+$/, '');
    if (extension && baseName.length > 47) {
      enhancedFilename = baseName.slice(0, 47) + '...' + (extension ? `.${extension}` : '');
    }
  }
  
  console.log('📝 [App] 文件名处理:', {
    原始: response.filename,
    增强后: enhancedFilename,
    原始URL: request.url
  });
  
  // 生成唯一 id（number 类型）
  const id = Date.now();
  const queueItem = {
    id,
    response: {
      ...response,
      filename: enhancedFilename  // 使用增强的文件名
    },
    status: 'queued' as const,
    progress: 0
  };
  
  console.log('🆔 [App] 生成队列项目ID:', id);
  console.log('📋 [App] 当前队列长度:', processingQueue.value.length);
  
  processingQueue.value.push(queueItem);
  
  console.log('✅ [App] 队列项目已添加，新队列长度:', processingQueue.value.length);
  
  // Google Analytics 事件追踪 - 下载开始
  trackEvent('download_started', {
    platform: response.service || 'unknown',
    file_type: response.type || 'unknown',
    processing_type: response.status,
    has_filename: !!response.filename,
    enhanced_filename: !!enhancedFilename,
    url_domain: (() => {
      try {
        return new URL(request.url).hostname;
      } catch {
        return 'unknown';
      }
    })()
  });
  
  // 🔥 修复：直接在这里启动处理，避免watch监听器的时机问题
  console.log('🚀 [App] 直接启动队列项目处理，避免监听器延迟');
  processQueueItem(queueItem);
}
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
            <!-- SnapMedia Logo - 使用 logo.png -->
            <img 
              src="@/assets/logo.png" 
              alt="SnapMedia Logo" 
              class="w-12 h-12 object-contain"
            />
            <!-- 霓虹光环 -->
            <div class="absolute inset-0 w-12 h-12 bg-pink-500/40 rounded-xl blur-md -z-10 animate-pulse"></div>
          </div>
          <!-- 仅在中等屏幕及以上显示文字 -->
          <div class="hidden md:block">
            <h2 class="text-xl font-bold bg-gradient-to-r from-white via-pink-200 to-pink-300 bg-clip-text text-transparent">
              SnapMedia
            </h2>
          </div>
        </div>

        <!-- 设置按钮 - 右上角 -->
        <button
          @click="showSettings = !showSettings"
          class="absolute top-6 right-6 flex items-center space-x-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg bg-slate-800/50 border border-white/10 
                 hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white z-20"
        >
          <Settings class="w-4 h-4 sm:w-5 sm:h-5" />
          <span class="hidden sm:inline text-sm sm:text-base">设置</span>
        </button>
        
        <!-- 主标题区域 - 居中，增加顶部间距 -->
        <div class="max-w-4xl mx-auto pt-24 text-center px-4">
          <!-- 主标题 -->
          <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-white via-pink-200 to-pink-300 bg-clip-text text-transparent">
            跨平台媒体下载工具
          </h1>

          <!-- 副口号 -->
          <p class="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mt-6">
            一键获取你喜爱的内容
            <br>
            <span class="text-sm sm:text-base text-slate-400 font-medium">快速 • 安全 • 多平台支持</span>
          </p>
        </div>
      </header>

      <!-- 主要内容 -->
      <main class="flex-1 pb-8 space-y-6">
        <!-- 下载界面 - 居中显示 -->
        <div class="px-4 sm:px-6">
          <div class="max-w-4xl mx-auto">
            <div class="bg-slate-900/40 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-8 shadow-2xl">
              <DownloadInterface
                @show-toast="showToast"
                @open-preview="openPreview"
                @open-picker="openPicker"
                @add-to-queue="addToQueue"
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
          <!-- 文件名 -->
          <div class="flex items-center justify-between mb-2">
            <p 
              class="text-sm text-white truncate font-medium flex-1 cursor-help" 
              :title="item.response.filename || `来源：${(item.response as any).service || '未知平台'}`"
              :class="{ 'text-gray-400': !item.response.filename }"
            >
              {{ item.response.filename || `${(item.response as any).service || '未知平台'} 媒体文件` }}
            </p>
            <!-- 状态图标 -->
            <div class="flex-shrink-0 ml-2">
              <Loader2 v-if="item.status === 'processing'" class="w-4 h-4 text-blue-400 animate-spin" />
              <CheckCircle v-else-if="item.status === 'done'" class="w-4 h-4 text-green-400" />
              <XCircle v-else-if="item.status === 'error'" class="w-4 h-4 text-red-400" />
              <div v-else class="w-4 h-4 rounded-full bg-slate-600"></div>
            </div>
          </div>
          
          <!-- 当前步骤描述 -->
          <div class="flex items-center space-x-2">
            <!-- 状态点动画 -->
            <div v-if="item.status === 'processing'" class="flex space-x-1">
              <div class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></div>
              <div class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.2s"></div>
              <div class="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style="animation-delay: 0.4s"></div>
            </div>
            <div v-else-if="item.status === 'done'" class="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            <div v-else-if="item.status === 'error'" class="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
            <div v-else class="w-1.5 h-1.5 bg-slate-500 rounded-full"></div>
            
            <!-- 步骤文字 -->
            <p class="text-xs flex-1" :class="{
              'text-blue-300': item.status === 'processing',
              'text-green-300': item.status === 'done', 
              'text-red-300': item.status === 'error',
              'text-slate-400': item.status === 'queued'
            }">
              {{ item.currentStep || (item.status === 'queued' ? '等待处理...' : item.status + '...') }}
            </p>
          </div>
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
                  <span v-if="previewData.tunnel[0].includes('/tunnel?')">SnapMedia代理可能需要特殊处理</span>
                  <span v-else>某些平台视频需要直接下载</span>
                </p>
                <p class="text-xs text-pink-300 mt-2">点击下方按钮直接下载</p>
              </div>
            </div>
            
            <!-- 视频加载中的提示 -->
            <div v-if="!videoError" class="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              <span v-if="previewData.tunnel[0].includes('/tunnel?')">
                🔄 通过SnapMedia代理加载...
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
