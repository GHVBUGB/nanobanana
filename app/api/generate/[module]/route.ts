import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { APIResponse, GenerateResponse, TaskStatus } from '@/lib/types'
import { generateImages } from '@/lib/nano-banana-api'
import { TaskManager } from '@/lib/task-manager'

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
  
  logWithTimestamp(taskId, '开始处理生成请求')

  // 获取用户输入 - 确保正确处理中文
  let userPrompt = body?.description || body?.prompt || '生成一张图片'
  
  // 修复中文编码问题
  try {
    if (typeof userPrompt === 'string') {
      // 确保字符串正确编码
      userPrompt = decodeURIComponent(escape(userPrompt))
    }
  } catch (e) {
    // 如果解码失败，使用原始字符串
    console.log('📝 使用原始提示词')
  }
  
  const referenceImage = body?.referenceImage
  
  console.log('📝 用户输入:', userPrompt)
  console.log('📝 用户输入类型:', typeof userPrompt)
  console.log('📝 用户输入长度:', userPrompt.length)
  console.log('🖼️ 参考图片:', referenceImage ? '已提供' : '未提供')
  
  // 创建任务
  const response: GenerateResponse = {
    taskId,
    estimatedTime: 5,
    images: [],
    usedPrompt: userPrompt,
    parameters: {
      prompt: userPrompt,
      num_inference_steps: 30,
      guidance_scale: 7.5
    }
  }

  // 初始化任务状态
  TaskManager.createTask(taskId, {
    status: 'pending',
    progress: 0,
    logs: [],
    result: response
  })

  logWithTimestamp(taskId, '任务已创建', { 
    userPrompt: userPrompt,
    hasReferenceImage: !!referenceImage,
    moduleType
  })

  // 启动后台生成任务
  console.log('🚀 启动 Nano Banana API 生成任务')
  
  // 添加重试机制
  const maxRetries = 2;
  let retryCount = 0;
  
  const attemptGeneration = async (): Promise<void> => {
    try {
      const result = await generateImages(userPrompt, {
        prompt: userPrompt,
        count: 4,
        referenceImage: referenceImage,
        taskId: taskId
      });
      
      if (result.success && result.images && result.images.length > 0) {
        console.log('✅ 图片生成成功:', result.images.length, '张')
        const finalResponse: GenerateResponse = {
          ...response,
          images: result.images
        }
        TaskManager.completeTask(taskId, finalResponse)
      } else {
        console.error('❌ 图片生成失败:', result.error)
        
        // 如果还有重试次数，进行重试
        if (retryCount < maxRetries) {
          retryCount++;
          console.log(`🔄 重试第 ${retryCount} 次...`);
          setTimeout(attemptGeneration, 2000); // 2秒后重试
        } else {
          TaskManager.failTask(taskId, result.error || '生成失败')
        }
      }
    } catch (error) {
      console.error('❌ 生成任务异常:', error)
      
      // 如果还有重试次数，进行重试
      if (retryCount < maxRetries) {
        retryCount++;
        console.log(`🔄 重试第 ${retryCount} 次...`);
        setTimeout(attemptGeneration, 2000); // 2秒后重试
      } else {
        TaskManager.failTask(taskId, error instanceof Error ? error.message : '生成异常')
      }
    }
  };
  
  // 开始生成
  attemptGeneration();

  // 启动进度模拟器 - 改进版本
  let progress = 10
  const progressTimer = setInterval(() => {
    const task = TaskManager.getTask(taskId)
    if (!task || task.status === 'completed' || task.status === 'failed') {
      clearInterval(progressTimer)
      return
    }
    
    // 更智能的进度增长
    if (progress < 30) {
      progress += Math.random() * 8 + 5  // 初期快速增长 5-13%
    } else if (progress < 70) {
      progress += Math.random() * 5 + 3  // 中期稳定增长 3-8%
    } else if (progress < 90) {
      progress += Math.random() * 3 + 1  // 后期缓慢增长 1-4%
    } else {
      progress += Math.random() * 2      // 接近完成时很慢 0-2%
    }
    
    progress = Math.min(95, progress) // 最多到95%，等待真实完成
    
    TaskManager.updateTask(taskId, { 
      status: 'processing', 
      progress: Math.round(progress) 
    })
  }, 1500) // 每1.5秒更新一次

  logWithTimestamp(taskId, '返回初始响应给客户端')
  
  return ok<GenerateResponse>(response)
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



