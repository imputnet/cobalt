<template>
  <Transition
    enter-active-class="transition-all duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-[-20px] scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition-all duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 translate-y-[-20px] scale-95"
  >
    <div
      v-if="isVisible"
      :class="toastClasses"
      class="relative mb-3 left-1/2 transform -translate-x-1/2 
             flex items-center space-x-3 px-4 py-3 rounded-lg shadow-2xl
             backdrop-blur-md border border-white/10 min-w-[320px] max-w-[500px]"
    >
      <!-- 图标 -->
      <div class="flex-shrink-0">
        <component
          :is="iconComponent"
          :class="iconClasses"
          class="w-5 h-5"
        />
      </div>

      <!-- 消息内容 -->
      <div class="flex-1 text-sm font-medium text-white/90">
        {{ message }}
      </div>

      <!-- 关闭按钮 -->
      <button
        @click="close"
        class="flex-shrink-0 p-1 rounded-md hover:bg-white/10 transition-colors"
      >
        <X class="w-4 h-4 text-white/60 hover:text-white/80" />
      </button>

      <!-- 进度条 -->
      <div
        v-if="duration > 0"
        class="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full"
        :style="{ width: `${progress}%` }"
      ></div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { CheckCircle, XCircle, AlertCircle, Info, Loader2, X } from 'lucide-vue-next'

interface Props {
  message: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number // 毫秒，0表示不自动关闭
  persistent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  duration: 4000,
  persistent: false
})

const emit = defineEmits<{
  close: []
}>()

const isVisible = ref(false)
const progress = ref(100)
let timer: number | null = null
let progressTimer: number | null = null

// 计算属性
const iconComponent = computed(() => {
  switch (props.type) {
    case 'success':
      return CheckCircle
    case 'error':
      return XCircle
    case 'warning':
      return AlertCircle
    default:
      return Info
  }
})

const iconClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-400'
          case 'error':
        return 'text-pink-400'
    case 'warning':
      return 'text-yellow-400'
    default:
      return 'text-blue-400'
  }
})

const toastClasses = computed(() => {
  const baseClasses = 'glass-panel'
  
  switch (props.type) {
    case 'success':
      return `${baseClasses} bg-green-500/10 border-green-500/20`
          case 'error':
        return `${baseClasses} bg-pink-500/10 border-pink-500/20`
    case 'warning':
      return `${baseClasses} bg-yellow-500/10 border-yellow-500/20`
    default:
      return `${baseClasses} bg-blue-500/10 border-blue-500/20`
  }
})

// 方法
const show = () => {
  isVisible.value = true
  
  if (props.duration > 0 && !props.persistent) {
    // 设置自动关闭定时器
    timer = window.setTimeout(() => {
      close()
    }, props.duration)

    // 设置进度条动画
    progress.value = 100
    const interval = 50 // 50ms更新一次
    const step = (interval / props.duration) * 100
    
    progressTimer = window.setInterval(() => {
      progress.value -= step
      if (progress.value <= 0) {
        progress.value = 0
        if (progressTimer) {
          clearInterval(progressTimer)
          progressTimer = null
        }
      }
    }, interval)
  }
}

const close = () => {
  isVisible.value = false
  
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  
  if (progressTimer) {
    clearInterval(progressTimer)
    progressTimer = null
  }
  
  // 延迟emit事件，等待动画完成
  setTimeout(() => {
    emit('close')
  }, 200)
}

// 暴露方法给父组件
defineExpose({
  show,
  close
})

// 生命周期
onMounted(() => {
  show()
})

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer)
  }
  if (progressTimer) {
    clearInterval(progressTimer)
  }
})
</script>

<style scoped>
/* Toast样式已在Tailwind classes中定义 */
</style> 