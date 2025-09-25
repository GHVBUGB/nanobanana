// 全局任务管理器
import { GenerateResponse } from '@/lib/types'
import fs from 'fs'
import path from 'path'

export interface TaskEntry {
  status: 'pending' | 'processing' | 'completed' | 'failed'
  progress: number
  result?: GenerateResponse
  error?: string
  logs?: string[]
}

// 任务存储目录
const TASKS_DIR = path.join(process.cwd(), '.tasks')

// 确保任务目录存在
if (!fs.existsSync(TASKS_DIR)) {
  fs.mkdirSync(TASKS_DIR, { recursive: true })
}

// 文件存储辅助函数
function getTaskFilePath(taskId: string): string {
  return path.join(TASKS_DIR, `${taskId}.json`)
}

function saveTask(taskId: string, task: TaskEntry): void {
  try {
    fs.writeFileSync(getTaskFilePath(taskId), JSON.stringify(task, null, 2))
  } catch (error) {
    console.error(`保存任务失败 ${taskId}:`, error)
  }
}

function loadTask(taskId: string): TaskEntry | null {
  try {
    const filePath = getTaskFilePath(taskId)
    if (!fs.existsSync(filePath)) {
      return null
    }
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(`加载任务失败 ${taskId}:`, error)
    return null
  }
}

// 兼容性：保留taskMap用于向后兼容
export const taskMap = new Map<string, TaskEntry>()

// 任务管理器工具函数
export const TaskManager = {
  // 创建任务
  createTask(taskId: string, initialData: Partial<TaskEntry>): void {
    const task: TaskEntry = {
      status: 'pending',
      progress: 0,
      logs: [], // 确保初始化为空数组
      ...initialData
    }
    
    console.log(`[TaskManager] 创建任务 ${taskId}:`, task)
    saveTask(taskId, task)
    taskMap.set(taskId, task)
  },

  // 更新任务状态
  updateTask(taskId: string, updates: Partial<TaskEntry>): void {
    const existing = loadTask(taskId)
    if (existing) {
      const updated = { ...existing, ...updates }
      saveTask(taskId, updated)
      taskMap.set(taskId, updated)
    }
  },

  // 获取任务
  getTask(taskId: string): TaskEntry | undefined {
    // 先从内存获取，如果没有则从文件加载
    let task = taskMap.get(taskId)
    if (!task) {
      const loaded = loadTask(taskId)
      if (loaded) {
        taskMap.set(taskId, loaded) // 缓存到内存
        task = loaded
      }
    }
    return task
  },

  // 添加日志
  addLog(taskId: string, log: string): void {
    const existing = this.getTask(taskId)
    if (existing) {
      // 确保logs是数组
      if (!existing.logs || !Array.isArray(existing.logs)) {
        existing.logs = []
      }
      existing.logs.push(`[${new Date().toISOString()}] ${log}`)
      saveTask(taskId, existing)
      taskMap.set(taskId, existing)
    }
  },

  // 完成任务
  async completeTask(taskId: string, result: GenerateResponse): Promise<void> {
    console.log(`[TaskManager] Task completed ${taskId}:`, {
      imageCount: result.images.length,
      images: result.images
    })
    
    this.updateTask(taskId, {
      status: 'completed',
      progress: 100,
      result
    })
    this.addLog(taskId, `Task completed - Generated ${result.images.length} images`)
    
    // 同步保存生成的图片到Supabase数据库
    try {
      console.log('🔄 Starting to sync images to database...')
      await this.saveGeneratedImagesAsync(taskId, result)
      console.log('✅ Images synced to database successfully')
    } catch (error) {
      console.error('❌ Failed to sync images to database:', error)
      // 即使数据库保存失败，任务仍然标记为完成，因为图片生成本身是成功的
    }
    
    // 验证任务是否正确保存
    const savedTask = this.getTask(taskId)
    console.log(`[TaskManager] Verify task save status:`, {
      taskId,
      status: savedTask?.status,
      progress: savedTask?.progress,
      hasResult: !!savedTask?.result,
      resultImageCount: savedTask?.result?.images?.length
    })
  },

  // 异步保存生成的图片到数据库
  async saveGeneratedImagesAsync(taskId: string, result: GenerateResponse): Promise<void> {
    try {
      // 动态导入以避免循环依赖
      const { saveGeneratedImages } = await import('./save-generated-images')
      
      console.log(`[TaskManager] Starting to save generated images to database - Task: ${taskId}`)
      this.addLog(taskId, 'Starting to save images to cloud database...')
      
      // 直接传递图片数组、提示词和任务ID
      await saveGeneratedImages(result.images || [], result.usedPrompt || '', taskId)
      
      console.log(`[TaskManager] Image saving process completed - Task: ${taskId}`)
      
    } catch (error) {
      console.error(`[TaskManager] Failed to save images to database - Task: ${taskId}`, error)
      this.addLog(taskId, `Failed to save images to database: ${error instanceof Error ? error.message : String(error)}`)
    }
  },

  // 失败任务
  failTask(taskId: string, error: string): void {
    this.updateTask(taskId, {
      status: 'failed',
      progress: 100,
      error
    })
    this.addLog(taskId, `Error: ${error}`)
  }
}