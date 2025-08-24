import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh-CN.json'

// 获取浏览器语言
const getBrowserLanguage = (): string => {
  const lang = navigator.language.toLowerCase()
  
  // 中文相关的语言都返回中文
  if (lang.includes('zh')) {
    return 'zh-CN'
  }
  
  // 默认返回英文
  return 'en'
}

// 从 localStorage 获取保存的语言设置
const getSavedLanguage = (): string => {
  const saved = localStorage.getItem('snapmedia-language')
  if (saved && ['en', 'zh-CN'].includes(saved)) {
    return saved
  }
  
  // 如果没有保存的语言设置，根据需求默认使用英文
  return 'en'
}

// 创建 i18n 实例
export const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: getSavedLanguage(), // 默认语言使用英文
  fallbackLocale: 'en', // 回退语言
  messages: {
    en,
    'zh-CN': zh
  },
  silentTranslationWarn: true, // 在生产环境中禁用翻译警告
  missingWarn: false,
  fallbackWarn: false
})

// 切换语言的函数
export const switchLanguage = (lang: string) => {
  if (['en', 'zh-CN'].includes(lang)) {
    i18n.global.locale.value = lang as 'en' | 'zh-CN'
    localStorage.setItem('snapmedia-language', lang)
    
    // 更新 HTML 的 lang 属性
    document.documentElement.lang = lang
    
    // 更新页面元信息
    updatePageMeta(lang)
  }
}

// 获取当前语言
export const getCurrentLanguage = () => {
  return i18n.global.locale.value
}

// 更新页面元信息的函数
export const updatePageMeta = (lang: string) => {
  const { t } = i18n.global
  
  // 更新页面标题
  document.title = t('meta.title')
  
  // 更新 meta description
  const metaDescription = document.querySelector('meta[name="description"]')
  if (metaDescription) {
    metaDescription.setAttribute('content', t('meta.description'))
  }
  
  // 更新 meta keywords
  const metaKeywords = document.querySelector('meta[name="keywords"]')
  if (metaKeywords) {
    metaKeywords.setAttribute('content', t('meta.keywords'))
  }
  
  // 更新 Open Graph 标签
  const ogTitle = document.querySelector('meta[property="og:title"]')
  if (ogTitle) {
    ogTitle.setAttribute('content', t('meta.title'))
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]')
  if (ogDescription) {
    ogDescription.setAttribute('content', t('meta.description'))
  }
  
  // 更新 Twitter Card 标签
  const twitterTitle = document.querySelector('meta[name="twitter:title"]')
  if (twitterTitle) {
    twitterTitle.setAttribute('content', t('meta.title'))
  }
  
  const twitterDescription = document.querySelector('meta[name="twitter:description"]')
  if (twitterDescription) {
    twitterDescription.setAttribute('content', t('meta.description'))
  }
  
  // 更新结构化数据
  updateStructuredData(lang)
}

// 更新结构化数据
const updateStructuredData = (lang: string) => {
  const { t } = i18n.global
  
  const structuredDataScript = document.querySelector('script[type="application/ld+json"]')
  if (structuredDataScript) {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "SnapMedia",
      "description": t('meta.description'),
      "url": "https://www.snapmedia.app",
      "applicationCategory": "MultimediaApplication",
      "operatingSystem": "Web Browser",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      },
      "publisher": {
        "@type": "Organization",
        "name": "SnapMedia"
      },
      "featureList": t('meta.features', { returnObjects: true })
    }
    
    structuredDataScript.textContent = JSON.stringify(structuredData)
  }
}

export default i18n
