import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

interface SeoConfig {
  title?: string
  description?: string
  keywords?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  canonical?: string
}

const defaultSeo: SeoConfig = {
  title: 'SnapMedia - 跨平台媒体下载工具',
  description: 'SnapMedia是一款免费的跨平台媒体下载工具，支持YouTube、TikTok、Instagram、Twitter、Bilibili等15+热门平台的视频、音频下载。快速、安全、无水印。',
  keywords: '视频下载,音频下载,YouTube下载,TikTok下载,Instagram下载,Twitter下载,Bilibili下载,跨平台下载工具,免费下载,无水印下载',
  ogTitle: 'SnapMedia - 跨平台媒体下载工具',
  ogDescription: '免费的跨平台媒体下载工具，支持YouTube、TikTok、Instagram等15+平台的视频、音频下载。快速、安全、无水印。',
  ogImage: 'https://www.snapmedia.app/og-image.png'
}

export function useSeo(config?: SeoConfig) {
  const route = useRoute()
  const currentSeo = ref<SeoConfig>({ ...defaultSeo, ...config })

  const updateTitle = (title: string) => {
    document.title = title
    currentSeo.value.title = title
  }

  const updateMetaTag = (name: string, content: string) => {
    let element = document.querySelector(`meta[name="${name}"]`) as HTMLMetaElement
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute('name', name)
      document.head.appendChild(element)
    }
    element.setAttribute('content', content)
  }

  const updateOgTag = (property: string, content: string) => {
    let element = document.querySelector(`meta[property="${property}"]`) as HTMLMetaElement
    if (!element) {
      element = document.createElement('meta')
      element.setAttribute('property', property)
      document.head.appendChild(element)
    }
    element.setAttribute('content', content)
  }

  const updateCanonical = (url: string) => {
    let element = document.querySelector('link[rel="canonical"]') as HTMLLinkElement
    if (!element) {
      element = document.createElement('link')
      element.setAttribute('rel', 'canonical')
      document.head.appendChild(element)
    }
    element.setAttribute('href', url)
  }

  const setSeo = (newConfig: SeoConfig) => {
    currentSeo.value = { ...currentSeo.value, ...newConfig }
    
    if (newConfig.title) {
      updateTitle(newConfig.title)
    }
    
    if (newConfig.description) {
      updateMetaTag('description', newConfig.description)
    }
    
    if (newConfig.keywords) {
      updateMetaTag('keywords', newConfig.keywords)
    }
    
    if (newConfig.ogTitle) {
      updateOgTag('og:title', newConfig.ogTitle)
    }
    
    if (newConfig.ogDescription) {
      updateOgTag('og:description', newConfig.ogDescription)
    }
    
    if (newConfig.ogImage) {
      updateOgTag('og:image', newConfig.ogImage)
    }
    
    if (newConfig.canonical) {
      updateCanonical(newConfig.canonical)
    }

    // 更新Twitter卡片
    if (newConfig.ogTitle) {
      updateMetaTag('twitter:title', newConfig.ogTitle)
    }
    if (newConfig.ogDescription) {
      updateMetaTag('twitter:description', newConfig.ogDescription)
    }
    if (newConfig.ogImage) {
      updateMetaTag('twitter:image', newConfig.ogImage)
    }
  }

  // Google Analytics 事件追踪
  const trackEvent = (eventName: string, parameters?: any) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', eventName, parameters)
    }
  }

  // 页面浏览追踪
  const trackPageView = (pagePath?: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'G-3HF8RF4RZ9', {
        page_path: pagePath || route.path
      })
    }
  }

  // 初始化SEO设置
  onMounted(() => {
    setSeo(currentSeo.value)
  })

  // 监听路由变化，自动更新页面浏览追踪
  watch(() => route.path, (newPath) => {
    trackPageView(newPath)
  })

  return {
    currentSeo,
    setSeo,
    updateTitle,
    trackEvent,
    trackPageView
  }
} 