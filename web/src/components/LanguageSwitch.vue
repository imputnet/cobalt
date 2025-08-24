<template>
  <div class="language-switch">
    <button
      @click="toggleLanguage"
      :title="getCurrentLanguageTitle"
      class="flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-800/50 border border-white/10 
             hover:bg-slate-700/50 transition-colors text-slate-300 hover:text-white"
    >
      <!-- 语言图标 -->
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
              d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/>
      </svg>
      
      <!-- 当前语言文本 -->
      <span class="text-sm font-medium">
        {{ getCurrentLanguageLabel }}
      </span>
      
      <!-- 切换指示器 -->
      <svg class="w-3 h-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7l4-4m0 0l4 4m-4-4v18"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { switchLanguage, getCurrentLanguage, updatePageMeta } from '@/i18n'

// i18n 设置
const { t, locale } = useI18n()

// 语言配置
const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'zh-CN', label: '中文', flag: '🇨🇳' }
]

// 计算属性
const getCurrentLanguageLabel = computed(() => {
  const current = languages.find(lang => lang.code === getCurrentLanguage())
  return current ? `${current.flag} ${current.label}` : 'English'
})

const getCurrentLanguageTitle = computed(() => {
  const current = getCurrentLanguage()
  const next = current === 'en' ? 'zh-CN' : 'en'
  const nextLang = languages.find(lang => lang.code === next)
  
  if (current === 'en') {
    return `Switch to ${nextLang?.label || 'Chinese'}`
  } else {
    return `切换到 ${nextLang?.label || 'English'}`
  }
})

// 切换语言
const toggleLanguage = () => {
  const current = getCurrentLanguage()
  const newLanguage = current === 'en' ? 'zh-CN' : 'en'
  
  console.log(`语言切换: ${current} → ${newLanguage}`)
  
  // 切换语言
  switchLanguage(newLanguage)
  
  // 更新页面元信息
  setTimeout(() => {
    updatePageMeta(newLanguage)
  }, 100)
}
</script>

<style scoped>
.language-switch {
  position: relative;
}

/* 添加一个小动画效果 */
button {
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(244, 114, 182, 0.3);
}
</style>
