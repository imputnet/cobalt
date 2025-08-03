// SnapMedia API 客户端
export interface CobaltApiResponse {
  status: 'error' | 'redirect' | 'tunnel' | 'picker' | 'local-processing'
  url?: string
  audio?: string
  picker?: Array<{
    type: string
    url: string
    thumb?: string
  }>
  tunnel?: string | string[]
  type?: string
  service?: string
  filename?: string
  urls?: string[]  // 添加urls字段，用于local-processing
  originalUrl?: string  // 添加原始URL字段，用于小红书等平台的直接预览
  filenameAttributes?: any
  fileMetadata?: any
  isHLS?: boolean
  originalRequest?: any
  error?: {
    code: string
    context?: any
  }
}

export interface CobaltApiRequest {
  url: string
  downloadMode?: 'auto' | 'audio' | 'mute'
  videoQuality?: string
  audioFormat?: string
  filenameStyle?: string
  disableMetadata?: boolean
  alwaysProxy?: boolean
  audioBitrate?: string
  tiktokFullAudio?: boolean
  youtubeDubLang?: string
  youtubeBetterAudio?: boolean
  youtubeVideoCodec?: string
  youtubeVideoContainer?: string
  youtubeHLS?: boolean
  allowH265?: boolean
  convertGif?: boolean
  subtitleLang?: string
}

export class CobaltAPI {
  private baseURL: string
  private timeout: number = 30000

  constructor() {
    // 调试环境变量读取
    console.log('环境变量调试:', {
      VITE_DEFAULT_API: import.meta.env.VITE_DEFAULT_API,
      WEB_DEFAULT_API: import.meta.env.WEB_DEFAULT_API,
      NODE_ENV: import.meta.env.NODE_ENV,
      MODE: import.meta.env.MODE
    })
    
    this.baseURL = import.meta.env.VITE_DEFAULT_API || import.meta.env.WEB_DEFAULT_API || 'http://localhost:9000/'
    console.log('最终使用的 baseURL:', this.baseURL)
  }

  setBaseURL(url: string) {
    // 确保URL以/结尾，参考原版web的实现
    this.baseURL = url.endsWith('/') ? url : url + '/'
  }

  setTimeout(timeout: number) {
    this.timeout = timeout
  }

  async request(requestData: any): Promise<CobaltApiResponse | null> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), this.timeout)

      console.log('发送API请求:', {
        url: this.baseURL,
        data: requestData
      })

      const response = await fetch(this.baseURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestData),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      console.log('API响应状态:', response.status)

      // SnapMedia API设计：成功=200，所有错误=400但包含有效JSON
      if (response.status === 200 || response.status === 400) {
        try {
          const result = await response.json()
          console.log('API响应数据:', result)
          return result
        } catch (jsonError) {
          console.error('JSON解析失败:', jsonError)
          return {
            status: 'error',
            error: {
              code: 'api.fetch.error',
              context: { message: 'Invalid JSON response' }
            }
          }
        }
      }

      // 其他HTTP状态码是真正的错误
      console.error('API请求失败:', response.status, response.statusText)
      return {
        status: 'error',
        error: {
          code: 'api.fetch.status',
          context: { status: response.status }
        }
      }

    } catch (error) {
      console.error('API请求异常:', error)
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            status: 'error',
            error: {
              code: 'api.fetch.timeout'
            }
          }
        }
        
        return {
          status: 'error',
          error: {
            code: 'api.fetch.error',
            context: { message: error.message }
          }
        }
      }

      return {
        status: 'error',
        error: {
          code: 'api.fetch.unknown'
        }
      }
    }
  }

  // 检查API服务器是否可用
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(this.baseURL, {
        method: 'GET',
        signal: controller.signal
      })

      clearTimeout(timeoutId)
      return response.ok
    } catch {
      return false
    }
  }

  // 获取支持的服务列表
  async getSupportedServices(): Promise<string[]> {
    try {
      const response = await fetch(this.baseURL, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })

      if (!response.ok) return []

      const data = await response.json()
      return data.cobalt?.services || []
    } catch {
      return []
    }
  }
}

// 创建API实例
export const api = new CobaltAPI()

// 下载文件的工具函数
export const downloadFile = (url: string, filename?: string) => {
  const a = document.createElement('a')
  a.href = url
  if (filename) {
    a.download = filename
  }
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

// URL验证函数
export const isValidURL = (string: string): boolean => {
  try {
    const url = new URL(string)
    return ['http:', 'https:'].includes(url.protocol)
  } catch {
    return false
  }
}

// 支持的平台检测
export const getSupportedPlatforms = () => [
  'YouTube', 'Twitter/X', 'TikTok', 'Instagram', 'Facebook',
  'Reddit', 'SoundCloud', 'Spotify', 'Vimeo', 'Dailymotion',
  'Bilibili', 'Xiaohongshu', 'Douyin', 'Twitch', 'Pinterest',
  'Tumblr', 'VK', 'OK.ru', 'Streamable', 'Loom', 'BlueSky'
]

// 错误消息映射
export const getErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    'error.api.unreachable': '无法连接到服务器，请检查网络连接',
    'error.api.timed_out': '请求超时，请稍后重试',
    'fetch.fail': '获取视频信息失败，请检查链接是否正确',
    'fetch.empty': '未找到可下载的内容',
    'link.unsupported': '不支持的链接格式',
    'content.too_long': '视频时长超过限制',
    'content.region': '该内容在您的地区不可用',
    'content.paid': '该内容需要付费观看',
    'error.tunnel.probe': '代理下载失败，请稍后重试',
  }
  
  return errorMessages[errorCode] || '未知错误，请稍后重试'
} 