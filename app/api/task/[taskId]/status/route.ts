import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { APIResponse, TaskStatus } from '@/lib/types'
import { TaskManager } from '@/lib/task-manager'

function ok<T>(data: T): NextResponse<APIResponse<T>> {
  return NextResponse.json({
    code: 200,
    message: 'OK',
    data,
    timestamp: Date.now(),
    requestId: randomUUID(),
  })
}

export async function GET(_req: NextRequest, { params }: { params: { taskId: string } }) {
  console.log(`[TaskStatus] 查询任务状态: ${params.taskId}`)
  
  const entry = TaskManager.getTask(params.taskId)
  if (!entry) {
    console.log(`[TaskStatus] 任务不存在: ${params.taskId}`)
    return NextResponse.json({ 
      code: 404, 
      message: 'Task not found', 
      data: null, 
      timestamp: Date.now(), 
      requestId: randomUUID() 
    }, { status: 404 })
  }
  
  console.log(`[TaskStatus] 任务 ${params.taskId} 状态: ${entry.status}, 进度: ${entry.progress}%`)
  
  const status: TaskStatus = {
    taskId: params.taskId,
    status: entry.status,
    progress: entry.progress,
    result: entry.result,
    error: entry.error,
    logs: entry.logs,
  }
  return ok(status)
}




