'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp, Trash2, Download } from 'lucide-react'

interface LogEntry {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
  data?: any
}

interface DebugLogsProps {
  taskId?: string
  className?: string
}

export function DebugLogs({ taskId, className }: DebugLogsProps) {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [autoScroll, setAutoScroll] = useState(true)

  // 模拟日志数据（实际项目中应该从API获取）
  useEffect(() => {
    if (!taskId) return

    // 添加一些示例日志
    const sampleLogs: LogEntry[] = [
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: `开始处理任务 ${taskId}`,
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '解析请求参数',
        data: { module: 'figurine', description: '可爱的机器人猫' }
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '构建提示词参数',
        data: { prompt: 'cute robot cat, digital art style...' }
      },
      {
        timestamp: new Date().toISOString(),
        level: 'info',
        message: '调用 OpenRouter API',
      },
    ]

    setLogs(sampleLogs)

    // 模拟实时日志更新
    const interval = setInterval(() => {
      const newLog: LogEntry = {
        timestamp: new Date().toISOString(),
        level: Math.random() > 0.8 ? 'warn' : 'info',
        message: `处理进度更新 ${Math.floor(Math.random() * 100)}%`,
      }
      
      setLogs(prev => [...prev, newLog])
    }, 2000)

    return () => clearInterval(interval)
  }, [taskId])

  const clearLogs = () => {
    setLogs([])
  }

  const downloadLogs = () => {
    const logText = logs.map(log => 
      `[${log.timestamp}] [${log.level.toUpperCase()}] ${log.message}${
        log.data ? '\n' + JSON.stringify(log.data, null, 2) : ''
      }`
    ).join('\n\n')
    
    const blob = new Blob([logText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `debug-logs-${taskId || 'unknown'}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getLevelColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'error': return 'destructive'
      case 'warn': return 'secondary'
      case 'info': return 'default'
      default: return 'default'
    }
  }

  return (
    <Card className={className}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">
                调试日志 {taskId && `(${taskId.substring(0, 8)}...)`}
                {logs.length > 0 && (
                  <Badge variant="outline" className="ml-2">
                    {logs.length} 条
                  </Badge>
                )}
              </CardTitle>
              <div className="flex items-center gap-2">
                {logs.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        downloadLogs()
                      }}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        clearLogs()
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
                {isOpen ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-0">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                暂无日志记录
              </div>
            ) : (
              <ScrollArea className="h-64 w-full">
                <div className="space-y-2">
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-3 text-sm font-mono"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getLevelColor(log.level)} className="text-xs">
                          {log.level.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-foreground mb-1">
                        {log.message}
                      </div>
                      {log.data && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                            查看详细数据
                          </summary>
                          <pre className="mt-1 text-xs bg-muted p-2 rounded overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}