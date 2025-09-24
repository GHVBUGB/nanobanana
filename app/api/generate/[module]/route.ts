import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { PromptTransformService } from '@/lib/prompt-transform'
import { APIResponse, GenerateResponse, TaskStatus } from '@/lib/types'
import { generateImages } from '@/lib/gemini'
import { TaskManager, taskMap } from '@/lib/task-manager'

// 日志记录函数
function logWithTimestamp(taskId: string, message: string, data?: any) {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [Task: ${taskId}] ${message}`
  console.log(logMessage)
  if (data) {
    console.log(`[${timestamp}] [Task: ${taskId}] Data:`, JSON.stringify(data, null, 2))
  }
}

function ok<T>(data: T): NextResponse<APIResponse<T>> {
  return NextResponse.json({
    code: 200,
    message: 'OK',
    data,
    timestamp: Date.now(),
    requestId: randomUUID(),
  })
}

export async function POST(req: NextRequest, { params }: { params: { module: string } }) {
  const moduleType = params.module
  const taskId = randomUUID()
  
  logWithTimestamp(taskId, `开始处理图片生成请求 - 模块类型: ${moduleType}`)
  
  let body: any = {}
  try {
    body = await req.json()
    logWithTimestamp(taskId, '成功解析请求体', { bodyKeys: Object.keys(body) })
  } catch (error) {
    logWithTimestamp(taskId, '解析请求体失败', { error: error instanceof Error ? error.message : String(error) })
    body = {}
  }
  
  const transformer = new PromptTransformService()
  logWithTimestamp(taskId, '创建提示词转换服务')

  let promptParams: Record<string, unknown> = {}
  try {
    switch (moduleType) {
      case 'figurine':
        promptParams = transformer.buildFigurineParams(body)
        break
      case 'multi-pose':
        promptParams = transformer.buildMultiPoseParams(body)
        break
      case 'sketch-control':
        promptParams = transformer.buildSketchControlParams(body)
        break
      case 'image-fusion':
        promptParams = transformer.buildImageFusionParams(body)
        break
      case 'object-replace':
        promptParams = transformer.buildObjectReplaceParams(body)
        break
      case 'id-photos':
        promptParams = transformer.buildIdPhotosParams(body)
        break
      case 'group-photo':
        promptParams = transformer.buildGroupPhotoParams(body)
        break
      case 'multi-camera':
        promptParams = transformer.buildMultiCameraParams(body)
        break
      case 'social-cover':
        promptParams = transformer.buildSocialCoverParams(body)
        break
      case 'standard':
        promptParams = transformer.buildStandardParams(body)
        break
      default:
        promptParams = { prompt: body?.description || 'ai image', num_inference_steps: 30, guidance_scale: 7.5 }
    }
    logWithTimestamp(taskId, '成功构建提示词参数', { 
      prompt: promptParams['prompt'],
      paramKeys: Object.keys(promptParams)
    })
  } catch (error) {
    logWithTimestamp(taskId, '构建提示词参数失败', { error: error instanceof Error ? error.message : String(error) })
    promptParams = { prompt: body?.description || 'ai image', num_inference_steps: 30, guidance_scale: 7.5 }
  }

  const estimatedTime = 4 + Math.floor(Math.random() * 4)
  const usedPrompt = String(promptParams['prompt'] || '')

  logWithTimestamp(taskId, '初始化任务状态', { 
    estimatedTime, 
    usedPrompt: usedPrompt.substring(0, 100) + (usedPrompt.length > 100 ? '...' : '')
  })
  
  TaskManager.createTask(taskId, [`任务创建 - 模块: ${moduleType}`])

  // Kick off OpenRouter call in background
  ;(async () => {
    try {
      logWithTimestamp(taskId, '开始调用 Gemini API', { prompt: usedPrompt.substring(0, 100) + '...' })
      
      // 更新任务状态为处理中
      TaskManager.updateTask(taskId, { status: 'processing', progress: 10 })
      TaskManager.addLog(taskId, '开始调用 Gemini API')
      
      const result = await generateImages(usedPrompt, { 
        count: promptParams['num_images_per_prompt'] as number || 4,
        referenceImage: (promptParams as any).referenceImage
      })
      
      // 添加调试日志
      logWithTimestamp(taskId, '传递给generateImages的参数', {
        prompt: usedPrompt,
        count: promptParams['num_images_per_prompt'] as number || 4,
        hasReferenceImage: !!(promptParams as any).referenceImage,
        referenceImageType: (promptParams as any).referenceImage ? typeof (promptParams as any).referenceImage : 'undefined'
      })
      const urls = result.success && result.images ? result.images : []
      
      logWithTimestamp(taskId, 'Gemini API 调用完成', { 
        urlCount: urls.length,
        urls: urls.map(url => url.substring(0, 50) + '...')
      })
      
      const images = urls.length > 0 ? urls.slice(0, 4) : [
        '/placeholder.svg?height=512&width=512&text=Result+1',
        '/placeholder.svg?height=512&width=512&text=Result+2',
      ]
      
      logWithTimestamp(taskId, '最终images数组', { 
        images,
        imagesLength: images.length,
        imagesType: typeof images,
        isArray: Array.isArray(images)
      })
      
      if (urls.length === 0) {
        logWithTimestamp(taskId, '警告: Gemini 未返回图片，使用占位符图片')
        TaskManager.addLog(taskId, '警告: Gemini 未返回图片，使用占位符')
      }
      
      const response: GenerateResponse = {
        taskId,
        estimatedTime,
        images,
        usedPrompt,
        parameters: promptParams,
      }
      
      logWithTimestamp(taskId, '任务完成', { 
        imageCount: images.length,
        finalImages: images,
        responseObject: response
      })
      
      TaskManager.completeTask(taskId, response)
      
      // 验证任务是否正确设置
      const updatedEntry = TaskManager.getTask(taskId)
      logWithTimestamp(taskId, '验证任务状态设置', {
        updatedStatus: updatedEntry?.status,
        updatedProgress: updatedEntry?.progress,
        hasResult: !!updatedEntry?.result,
        resultImages: updatedEntry?.result?.images
      })
    } catch (e: any) {
      logWithTimestamp(taskId, 'Gemini 调用失败', { 
        error: e?.message || 'Unknown error',
        stack: e?.stack
      })
      
      TaskManager.failTask(taskId, e?.message || 'Gemini 调用失败')
    }
  })()

  // Progress simulator
  let p = 10 // 从10%开始，因为任务已经创建
  const timer = setInterval(() => {
    const entry = TaskManager.getTask(taskId)
    if (!entry) {
      logWithTimestamp(taskId, '进度更新器: 任务不存在，停止进度更新')
      clearInterval(timer)
      return
    }
    if (entry.status === 'completed' || entry.status === 'failed') {
      logWithTimestamp(taskId, `进度更新器: 任务已${entry.status === 'completed' ? '完成' : '失败'}，停止进度更新`)
      clearInterval(timer)
      return
    }
    
    // 增加进度，但不超过95%
    p = Math.min(95, p + 10)
    logWithTimestamp(taskId, `进度更新: ${p}%`)
    TaskManager.updateTask(taskId, { status: 'processing', progress: p })
    TaskManager.addLog(taskId, `进度更新: ${p}%`)
  }, 800)

  logWithTimestamp(taskId, '返回初始响应给客户端')
  
  return ok<GenerateResponse>({
    taskId,
    estimatedTime,
    images: [],
    usedPrompt,
    parameters: promptParams,
  })
}

// 添加任务状态查询
export async function GET(req: NextRequest, { params }: { params: { module: string } }) {
  const url = new URL(req.url)
  const taskId = url.searchParams.get('taskId')
  
  if (!taskId) {
    console.log('[GET] 缺少 taskId 参数')
    return NextResponse.json({ code: 400, message: 'Missing taskId parameter', data: null, timestamp: Date.now(), requestId: randomUUID() }, { status: 400 })
  }
  
  console.log(`[GET] 查询任务状态: ${taskId}`)
  
  const entry = TaskManager.getTask(taskId)
  if (!entry) {
    console.log(`[GET] 任务不存在: ${taskId}`)
    return NextResponse.json({ code: 404, message: 'Task not found', data: null, timestamp: Date.now(), requestId: randomUUID() }, { status: 404 })
  }
  
  console.log(`[GET] 任务 ${taskId} 状态: ${entry.status}, 进度: ${entry.progress}%`)
  
  const status: TaskStatus = {
    taskId,
    status: entry.status,
    progress: entry.progress,
    result: entry.result,
    error: entry.error,
    logs: entry.logs,
  }
  
  return ok(status)
}



