"use client"

import { useState } from "react"
import { useGeneration } from "@/hooks/use-generation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, RotateCcw, Download, RefreshCw } from "lucide-react"

export function MultiPoseGenerator() {
  const [selectedPoses, setSelectedPoses] = useState<string[]>([])
  const { start, progress, images, loading } = useGeneration('multi-pose')

  const poses = [
    { id: "standing", name: "站立" },
    { id: "sitting", name: "坐姿" },
    { id: "walking", name: "行走" },
    { id: "running", name: "跑步" },
    { id: "jumping", name: "跳跃" },
    { id: "dancing", name: "舞蹈" },
    { id: "fighting", name: "战斗" },
    { id: "thinking", name: "思考" },
  ]

  const handlePoseToggle = (poseId: string) => {
    setSelectedPoses((prev) => (prev.includes(poseId) ? prev.filter((id) => id !== poseId) : [...prev, poseId]))
  }

  const handleGenerate = async () => {
    await start({ poseTypes: selectedPoses, poseCount: selectedPoses.length || 4 })
  }

  return (
    <div className="h-full flex flex-col module-container">
      {/* Header Section */}
      <div className="border-b border-border px-8 py-6 bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">单图生成多姿势</h1>
            <p className="text-muted-foreground mt-1">从单张图片生成多种不同姿势</p>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={selectedPoses.length === 0 || loading}
            className="module-button px-8"
          >
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin loading-spinner" />
                <span className="loading-text">生成中...</span>
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                生成多姿势 ({selectedPoses.length})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Upload */}
        <div className="w-80 border-r border-border p-6 space-y-6 bg-card/50">
          <div>
            <Label className="text-sm font-medium mb-3 block">上传原始图片</Label>
            <div className="upload-area rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto loading-spinner mb-2" />
              <p className="text-sm text-muted-foreground mb-1">上传人物图片</p>
              <p className="text-xs text-muted-foreground/70">建议使用清晰的全身照</p>
              <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                选择文件
              </Button>
            </div>
          </div>

          <div className="aspect-square bg-card rounded-lg overflow-hidden border border-border">
            <img
              src="/anime-character-multiple-poses.jpg"
              alt="Original character"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="border-t border-border pt-6">
            <Label className="text-sm font-medium mb-3 block">生成风格</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="选择风格" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="original">保持原风格</SelectItem>
                <SelectItem value="anime">动漫风格</SelectItem>
                <SelectItem value="realistic">写实风格</SelectItem>
                <SelectItem value="cartoon">卡通风格</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Middle Panel - Pose Selection */}
        <div className="w-64 border-r border-border p-6 bg-card/50">
          <Label className="text-sm font-medium mb-4 block">选择生成姿势</Label>
          <div className="space-y-3">
            {poses.map((pose) => (
              <div key={pose.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted">
                <Checkbox
                  id={pose.id}
                  checked={selectedPoses.includes(pose.id)}
                  onCheckedChange={() => handlePoseToggle(pose.id)}
                />
                <Label htmlFor={pose.id} className="text-sm font-medium cursor-pointer">
                  {pose.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="flex-1 p-8 bg-card/30">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">生成结果</h2>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                全部下载
              </Button>
            </div>

            <div className="flex-1 bg-card rounded-xl p-6 border border-border">
              <div className="grid grid-cols-3 gap-4 h-full">
                {selectedPoses.slice(0, 9).map((poseId, index) => {
                  const pose = poses.find((p) => p.id === poseId)
                  return (
                    <div key={poseId} className="bg-card rounded-lg p-3 border border-border">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-2">
                        {loading ? (
                          <div className="w-full h-full flex items-center justify-center">
                            <RefreshCw className="h-6 w-6 animate-spin loading-spinner" />
                          </div>
                        ) : (
                          <img
                            src={`/placeholder-150x150.png?text=${pose?.name}`}
                            alt={pose?.name}
                            className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform"
                          />
                        )}
                      </div>
                      <p className="text-xs text-center text-gray-600 font-medium">{pose?.name}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
