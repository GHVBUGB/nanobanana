"use client"

import { useCallback, useEffect, useRef, useState } from 'react'
import { ApiClient } from '@/lib/api'
import { APIResponse, GenerateResponse, TaskStatus } from '@/lib/types'

export function useGeneration(moduleType: string) {
  const [taskId, setTaskId] = useState<string | null>(null)
  const [progress, setProgress] = useState<number>(0)
  const [images, setImages] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const poller = useRef<NodeJS.Timeout | null>(null)

  const clear = () => {
    if (poller.current) {
      clearInterval(poller.current)
      poller.current = null
    }
  }

  const clearLogs = () => {
    setLogs([])
  }

  useEffect(() => clear, [])

  const start = useCallback(async (payload: unknown) => {
    console.log('🚀 开始新的生成任务')
    
    // 重置所有状态
    clear()
    setLoading(true)
    setError(null)
    setImages([])
    setProgress(0)
    setLogs([])
    setTaskId(null)
    
    try {
      // 调用生成API
      const res = await ApiClient.generate(moduleType, payload)
      const data = res.data
      
      console.log('✅ API调用成功:', data)
      setTaskId(data.taskId)
      setProgress(5) // 显示初始进度
      
      // 开始轮询任务状态
      poller.current = setInterval(async () => {
        try {
          if (!data.taskId) return
          
          const statusRes = await ApiClient.getTaskStatus(data.taskId)
          const status = statusRes.data
          
          console.log('📊 状态更新:', status)
          
          // 更新进度
          if (typeof status.progress === 'number') {
            setProgress(status.progress)
          }
          
          // 更新日志
          if (status.logs && Array.isArray(status.logs)) {
            setLogs(status.logs)
          }
          
          // 检查完成状态
          if (status.status === 'completed') {
            console.log('🎉 任务完成!')
            setProgress(100)
            
            // 处理生成的图片
            if (status.result?.images && Array.isArray(status.result.images)) {
              const imageUrls = status.result.images.filter(url => 
                url && typeof url === 'string' && url.trim() !== ''
              )
              
              console.log('📸 获得图片:', imageUrls)
              setImages(imageUrls)
            } else {
              console.warn('⚠️ 没有获得图片结果')
              setError('没有生成图片')
            }
            
            setLoading(false)
            clear()
            return
          }
          
          // 检查失败状态
          if (status.status === 'failed') {
            console.error('❌ 任务失败:', status.error)
            setError(status.error || '生成失败')
            setLoading(false)
            clear()
            return
          }
          
        } catch (pollError) {
          console.error('轮询错误:', pollError)
          // 继续轮询，不要因为单次失败就停止
        }
      }, 2000)
      
    } catch (error) {
      console.error('❌ 启动任务失败:', error)
      setError(error instanceof Error ? error.message : '启动失败')
      setLoading(false)
    }
  }, [moduleType])

  return {
    taskId,
    progress,
    images,
    loading,
    error,
    logs,
    start,
    clearLogs
  }
}




