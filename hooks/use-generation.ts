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
    clear()
    setLoading(true)
    setError(null)
    setImages([])
    setProgress(0)
    setLogs([])
    try {
      console.log('🚀 开始生成任务:', { moduleType, payload })
      const res = await ApiClient.generate(moduleType, payload)
      const data = res.data
      console.log('📋 任务创建成功:', data)
      setTaskId(data.taskId)
      // Poll
      poller.current = setInterval(async () => {
        try {
          if (!data.taskId) return
          const statusRes = await ApiClient.getTaskStatus(data.taskId)
          const s = statusRes.data
          console.log('📊 任务状态更新:', s)
          
          // 强制更新进度，确保显示最新状态
          setProgress(s.progress)
          
          // 更新日志
          if (s.logs && Array.isArray(s.logs)) {
            setLogs(s.logs)
          }
          
          // 检查任务完成状态
          if (s.status === 'completed') {
            console.log('✅ 任务完成，图片URLs:', s.result?.images)
            console.log('🔍 完整result对象:', s.result)
            
            // 立即更新进度到100%
            setProgress(100)
            
            // 处理结果图片
            if (s.result && s.result.images) {
              const resultImages = s.result.images || []
              console.log('📸 设置images状态前:', resultImages)
              console.log('📸 resultImages类型:', typeof resultImages, Array.isArray(resultImages))
              console.log('📸 resultImages长度:', resultImages.length)
              
              if (Array.isArray(resultImages) && resultImages.length > 0) {
                console.log('📸 正在设置images状态:', resultImages)
                setImages(resultImages)
                console.log('📸 images状态已设置')
              } else {
                console.warn('⚠️ resultImages为空或不是数组:', resultImages)
                // 即使没有图片也要停止loading
              }
            }
            
            // 停止loading和轮询
            setLoading(false)
            clear()
            return // 立即退出轮询
          }
          
          if (s.status === 'failed') {
            console.log('❌ 任务失败:', s.error)
            setError(s.error || '生成失败')
            setLoading(false)
            clear()
            return // 立即退出轮询
          }
        } catch (e: any) {
          console.error('🔄 轮询状态失败:', e)
          setError(e?.message || '网络错误')
          setLoading(false)
          clear()
        }
      }, 1000)
    } catch (e: any) {
      console.error('🚫 启动任务失败:', e)
      setError(e?.message || '请求失败')
      setLoading(false)
      clear()
    }
  }, [moduleType])

  return { taskId, progress, images, loading, error, logs, start, clearLogs }
}




