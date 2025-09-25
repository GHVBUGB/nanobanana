"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sparkles, RotateCcw, PenTool, Layers, FileImage, Replace, Grid3X3, Users, Camera, Sun, Moon, ImageIcon, Edit, LogIn } from "lucide-react"
import { useTheme } from "next-themes"
import { UserMenu } from "@/components/auth/user-menu"

interface SidebarProps {
  activeModule: string | null
  onModuleSelect: (module: string) => void
}

const modules = [
  { id: "standard", name: "智能生图", icon: Sparkles },
  { id: "figurine", name: "生成手办", icon: Sparkles },
  { id: "multi-pose", name: "单图生成多姿势", icon: RotateCcw },
  { id: "sketch-control", name: "草图控制", icon: PenTool },
  { id: "image-fusion", name: "多图融合", icon: Layers },
  { id: "social-cover", name: "自媒体封面设计", icon: FileImage },
  { id: "object-replace", name: "局部物品替换", icon: Replace },
  { id: "id-photos", name: "9宫格证件照", icon: Grid3X3 },
  { id: "group-photo", name: "人物合影", icon: Users },
  { id: "multi-camera", name: "多机位生成", icon: Camera },
]

export function Sidebar({ activeModule, onModuleSelect }: SidebarProps) {
  const { theme, setTheme } = useTheme()
  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div>
            <h1 className="text-xl font-bold text-sidebar-foreground">AI 图像工作室</h1>
            <p className="text-sm text-muted-foreground mt-1">专业图像生成平台</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            aria-label="切换主题"
            className="shrink-0"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
        </div>
        
        {/* User Menu */}
        <div className="flex justify-end">
          <UserMenu />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {modules.map((module) => {
          const Icon = module.icon
          const isActive = activeModule === module.id

          return (
            <Button
              key={module.id}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-12 text-left relative border-l-2",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-sidebar-primary"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/10 border-transparent",
              )}
              onClick={() => onModuleSelect(module.id)}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{module.name}</span>
            </Button>
          )
        })}
        
        <a
            href="/community"
            className="block w-full text-left px-4 py-3 rounded-lg transition-colors hover:bg-gray-100"
          >
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5" />
              <span className="font-medium">社区</span>
            </div>
          </a>
          
          <a
            href="/auth"
            className="block w-full text-left px-4 py-3 rounded-lg transition-colors hover:bg-gray-100"
          >
            <div className="flex items-center space-x-3">
              <LogIn className="w-5 h-5" />
              <span className="font-medium">登录/注册</span>
            </div>
          </a>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-muted-foreground text-center">© 2024 AI 图像工作室</div>
      </div>
    </div>
  )
}
