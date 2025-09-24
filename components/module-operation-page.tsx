"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { FigurineGenerator } from "@/components/modules/figurine-generator"
import { MultiPoseGenerator } from "@/components/modules/multi-pose-generator"
import { SketchControl } from "@/components/modules/sketch-control"
import { ImageFusion } from "@/components/modules/image-fusion"
import { SocialCoverDesign } from "@/components/modules/social-cover-design"
import { ObjectReplace } from "@/components/modules/object-replace"
import { IdPhotos } from "@/components/modules/id-photos"
import { GroupPhoto } from "@/components/modules/group-photo"
import { MultiCamera } from "@/components/modules/multi-camera"
import { StandardGenerate } from "@/components/modules/standard-generate"

interface ModuleOperationPageProps {
  module: string
  onBack: () => void
}

const moduleConfig = {
  figurine: {
    title: "生成手办",
    description: "将您的想法转化为精美的手办模型",
    component: FigurineGenerator,
  },
  "multi-pose": {
    title: "单图生成多姿势",
    description: "从单张图片生成多种不同姿势",
    component: MultiPoseGenerator,
  },
  "sketch-control": {
    title: "草图控制",
    description: "通过草图精确控制图像生成",
    component: SketchControl,
  },
  "image-fusion": {
    title: "多图融合",
    description: "将多张图片智能融合为一张",
    component: ImageFusion,
  },
  "social-cover": {
    title: "自媒体封面设计",
    description: "为社交媒体创建吸引人的封面",
    component: SocialCoverDesign,
  },
  "object-replace": {
    title: "局部物品替换",
    description: "智能替换图片中的特定物品",
    component: ObjectReplace,
  },
  "id-photos": {
    title: "9宫格证件照",
    description: "生成标准的证件照格式",
    component: IdPhotos,
  },
  "group-photo": {
    title: "人物合影",
    description: "将多个人物合成到一张照片中",
    component: GroupPhoto,
  },
  "multi-camera": {
    title: "多机位生成",
    description: "从不同角度生成同一场景",
    component: MultiCamera,
  },
  "standard": {
    title: "智能生图",
    description: "上传参考或输入提示词，快速生成高质图片",
    component: StandardGenerate,
  },
}

export function ModuleOperationPage({ module, onBack }: ModuleOperationPageProps) {
  const config = moduleConfig[module as keyof typeof moduleConfig]

  if (!config) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">模块未找到</h2>
          <p className="text-muted-foreground mb-4">请选择一个有效的模块</p>
          <Button onClick={onBack}>返回</Button>
        </Card>
      </div>
    )
  }

  const ModuleComponent = config.component

  const moduleClassMap: Record<string, string> = {
    figurine: "module-figurine",
    "multi-pose": "module-multi-pose",
    "sketch-control": "module-sketch",
    "image-fusion": "module-fusion",
    "social-cover": "module-social",
    "object-replace": "module-replace",
    "id-photos": "module-id-photos",
    "group-photo": "module-group",
    "multi-camera": "module-camera",
  }
  const moduleThemeClass = moduleClassMap[module] || ""

  return (
    <div className={cn("flex flex-col h-full", moduleThemeClass)}>
      {/* Header */}
      <div className="p-6 border-b border-border bg-card/50 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{config.title}</h1>
            <p className="text-muted-foreground">{config.description}</p>
          </div>
        </div>
      </div>

      {/* Module Content */}
      <div className="flex-1 overflow-auto">
        <ModuleComponent />
      </div>
    </div>
  )
}
