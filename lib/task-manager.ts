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
  createTask(taskId: string, initialLogs?: string[]): void {
    const task: TaskEntry = {
      status: 'pending',
      progress: 0,
      logs: initialLogs || []
    }
    saveTask(taskId, task)
    taskMap.set(taskId, task) // 同时保存到内存以提高性能
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
      existing.logs = existing.logs || []
      existing.logs.push(`[${new Date().toISOString()}] ${log}`)
      saveTask(taskId, existing)
      taskMap.set(taskId, existing)
    }
  },

  // 完成任务
  completeTask(taskId: string, result: GenerateResponse): void {
    this.updateTask(taskId, {
      status: 'completed',
      progress: 100,
      result
    })
    this.addLog(taskId, `任务完成 - 生成 ${result.images.length} 张图片`)
  },

  // 失败任务
  failTask(taskId: string, error: string): void {
    this.updateTask(taskId, {
      status: 'failed',
      progress: 100,
      error
    })
    this.addLog(taskId, `错误: ${error}`)
  }
}