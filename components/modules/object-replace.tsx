"use client"

import { useState } from "react"
import { useGeneration } from "@/hooks/use-generation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Replace, Download, RefreshCw, MousePointer } from "lucide-react"

export function ObjectReplace() {
  const [replacePrompt, setReplacePrompt] = useState("")
  const { start, progress, images, loading } = useGeneration('object-replace')

  const handleGenerate = async () => {
    await start({ description: replacePrompt })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto module-container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Image Upload & Selection */}
        <div className="space-y-6">
          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">上传原始图片</h3>

            <div className="upload-area rounded-lg p-8 text-center mb-4">
              <Upload className="h-12 w-12 mx-auto loading-spinner mb-4" />
              <p className="text-muted-foreground mb-2">上传要编辑的图片</p>
              <p className="text-sm text-muted-foreground/70">支持 PNG, JPG, JPEG 格式</p>
              <Button variant="outline" className="mt-4 bg-transparent">
                选择文件
              </Button>
            </div>

            <div className="aspect-square bg-card rounded-lg overflow-hidden relative border border-border">
              <img src="/object-replacement-in-room.jpg" alt="Original image" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/10" />
              <div className="absolute top-4 left-4">
                <Button variant="secondary" size="sm">
                  <MousePointer className="h-4 w-4 mr-2" />
                  选择物品
                </Button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-2">点击图片中要替换的物品，或使用画笔工具选择区域</p>
          </Card>
        </div>

        {/* Right Panel - Replace Controls & Preview */}
        <div className="space-y-6">
          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">替换设置</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="replace-prompt">替换为什么物品</Label>
                <Textarea
                  id="replace-prompt"
                  placeholder="描述您想要替换成的物品，例如：一张现代风格的沙发，蓝色布料..."
                  value={replacePrompt}
                  onChange={(e) => setReplacePrompt(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="style">替换风格</Label>
                <select className="w-full mt-2 p-2 border border-border rounded-md bg-background">
                  <option value="">选择风格</option>
                  <option value="realistic">写实风格</option>
                  <option value="artistic">艺术风格</option>
                  <option value="modern">现代风格</option>
                  <option value="vintage">复古风格</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="preserve-lighting" className="rounded" />
                <Label htmlFor="preserve-lighting" className="text-sm">
                  保持原始光照
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="match-perspective" className="rounded" />
                <Label htmlFor="match-perspective" className="text-sm">
                  匹配透视角度
                </Label>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!replacePrompt || loading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    替换中...
                  </>
                ) : (
                  <>
                    <Replace className="h-4 w-4 mr-2" />
                    开始替换
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">替换结果</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
            </div>

            <div className="aspect-square bg-card rounded-lg overflow-hidden border border-border">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 mx-auto animate-spin loading-spinner mb-2" />
                    <p className="text-muted-foreground loading-text">正在替换物品... {progress}%</p>
                  </div>
                </div>
              ) : (
                <img
                  src={encodeURI((images && images[0]) || "/object-replacement-in-room.jpg")}
                  alt="物体替换结果"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">对比视图</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <div className="aspect-square bg-card rounded-lg overflow-hidden mb-2 border border-border">
                  <img
                    src="/placeholder.svg?height=150&width=150&text=原图"
                    alt="Original"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground">原图</p>
              </div>
              <div className="text-center">
                <div className="aspect-square bg-card rounded-lg overflow-hidden mb-2 border border-border">
                  <img
                    src="/placeholder.svg?height=150&width=150&text=替换后"
                    alt="After replacement"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground">替换后</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
