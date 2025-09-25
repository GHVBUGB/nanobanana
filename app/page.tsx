"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { ImageGallery } from "@/components/image-gallery"
import { ModuleOperationPage } from "@/components/module-operation-page"
import { useAuth } from "@/components/auth/auth-provider"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"

export default function HomePage() {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // 如果认证状态已确定且用户未登录，重定向到登录页面
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>加载中...</p>
        </div>
      </div>
    )
  }

  // 如果用户未登录，显示登录提示页面
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center space-y-6 p-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">欢迎使用 AI 图像平台</h1>
            <p className="text-muted-foreground text-lg">
              请登录以访问所有功能
            </p>
          </div>
          <Button 
            onClick={() => router.push('/auth')} 
            size="lg"
            className="gap-2"
          >
            <LogIn className="h-4 w-4" />
            立即登录
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar activeModule={activeModule} onModuleSelect={setActiveModule} />
      <main className="flex-1 overflow-hidden">
        {activeModule ? (
          <ModuleOperationPage module={activeModule} onBack={() => setActiveModule(null)} />
        ) : (
          <ImageGallery />
        )}
      </main>
    </div>
  )
}
