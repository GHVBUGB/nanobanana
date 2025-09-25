import { APIResponse, GenerateResponse, TaskStatus } from '@/lib/types'

async function http<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30秒超时
  
  try {
    const res = await fetch(input, {
      ...init,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
    })
    
    clearTimeout(timeoutId)
    
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `HTTP ${res.status}`)
    }
    return (await res.json()) as T
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('请求超时，请重试')
    }
    throw error
  }
}

// 将图片文件转换为base64格式
async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // 移除data:image/...;base64,前缀，只保留base64数据
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 将图片URL转换为base64格式
async function urlToBase64(url: string): Promise<string> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15秒超时
    
    const response = await fetch(url, {
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        const base64 = result.split(',')[1]
        resolve(base64)
      }
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('图片加载超时，请重试')
    }
    throw new Error('无法转换图片URL为base64格式')
  }
}

export const ApiClient = {
  async generate(moduleType: string, payload: any) {
    // 处理参考图片，将其转换为base64格式
    let processedPayload = { ...payload }
    
    if (payload.referenceImage) {
      try {
        let base64Image: string
        
        // 检查是否是blob URL
        if (payload.referenceImage.startsWith('blob:')) {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时
          
          try {
            const response = await fetch(payload.referenceImage, {
              signal: controller.signal
            })
            clearTimeout(timeoutId)
            
            if (!response.ok) {
              throw new Error(`HTTP ${response.status}`)
            }
            
            const blob = await response.blob()
            const file = new File([blob], 'image.jpg', { type: blob.type })
            base64Image = await fileToBase64(file)
          } catch (error) {
            clearTimeout(timeoutId)
            if (error instanceof Error && error.name === 'AbortError') {
              throw new Error('图片加载超时，请重试')
            }
            throw error
          }
        } 
        // 检查是否是http URL
        else if (payload.referenceImage.startsWith('http')) {
          base64Image = await urlToBase64(payload.referenceImage)
        }
        // 检查是否已经是base64格式
        else if (payload.referenceImage.includes('base64,')) {
          base64Image = payload.referenceImage.split(',')[1]
        }
        // 假设已经是纯base64数据
        else {
          base64Image = payload.referenceImage
        }
        
        processedPayload.referenceImage = base64Image
        console.log('✅ 参考图片已转换为base64格式，长度:', base64Image.length)
      } catch (error) {
        console.error('❌ 转换参考图片失败:', error)
        throw new Error('图片处理失败，请重新上传')
      }
    }

    // 处理多个参考图片（用于图片融合等功能）
    if (payload.referenceImages && Array.isArray(payload.referenceImages)) {
      try {
        const processedImages = await Promise.all(
          payload.referenceImages.map(async (imageUrl: string) => {
            if (imageUrl.startsWith('blob:')) {
              const controller = new AbortController()
              const timeoutId = setTimeout(() => controller.abort(), 10000) // 10秒超时
              
              try {
                const response = await fetch(imageUrl, {
                  signal: controller.signal
                })
                clearTimeout(timeoutId)
                
                if (!response.ok) {
                  throw new Error(`HTTP ${response.status}`)
                }
                
                const blob = await response.blob()
                const file = new File([blob], 'image.jpg', { type: blob.type })
                return await fileToBase64(file)
              } catch (error) {
                clearTimeout(timeoutId)
                if (error instanceof Error && error.name === 'AbortError') {
                  throw new Error('图片加载超时，请重试')
                }
                throw error
              }
            } else if (imageUrl.startsWith('http')) {
              return await urlToBase64(imageUrl)
            } else if (imageUrl.includes('base64,')) {
              return imageUrl.split(',')[1]
            } else {
              return imageUrl
            }
          })
        )
        processedPayload.referenceImages = processedImages
        console.log('✅ 多个参考图片已转换为base64格式，数量:', processedImages.length)
      } catch (error) {
        console.error('❌ 转换多个参考图片失败:', error)
        throw new Error('图片处理失败，请重新上传')
      }
    }

    console.log('🚀 发送生成请求:', {
      moduleType,
      hasReferenceImage: !!processedPayload.referenceImage,
      hasReferenceImages: !!processedPayload.referenceImages,
      description: processedPayload.description
    })

    return http<APIResponse<GenerateResponse>>(`/api/generate/${moduleType}`, {
      method: 'POST',
      body: JSON.stringify(processedPayload),
    })
  },
  
  async getTaskStatus(taskId: string): Promise<APIResponse<TaskStatus>> {
    console.log(`🔍 查询任务状态: ${taskId}`)
    return http<APIResponse<TaskStatus>>(`/api/task/${taskId}/status`)
  },
}




