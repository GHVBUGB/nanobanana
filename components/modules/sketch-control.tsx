"use client"

import { useState } from "react"
import { useGeneration } from "@/hooks/use-generation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, PenTool, Download, RefreshCw, Eraser } from "lucide-react"

export function SketchControl() {
  const [prompt, setPrompt] = useState("")
  const [controlStrength, setControlStrength] = useState([70])
  const { start, progress, images, loading } = useGeneration('sketch-control')

  const handleGenerate = async () => {
    await start({ description: prompt, controlStrength: controlStrength[0] })
  }

  return (
    <div className="h-full flex flex-col module-container">
      {/* Header Section */}
      <div className="border-b border-border px-8 py-6 bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">草图控制</h1>
            <p className="text-muted-foreground mt-1">将草图转换为精美的渲染图像</p>
          </div>
          <Button onClick={handleGenerate} disabled={!prompt || loading} className="module-button px-8">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin loading-spinner" />
                <span className="loading-text">渲染中...</span>
              </>
            ) : (
              <>
                <PenTool className="h-4 w-4 mr-2" />
                开始渲染
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Panel - Sketch Canvas */}
        <div className="flex-1 p-8">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">草图绘制区域</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50 bg-transparent"
                >
                  <PenTool className="h-4 w-4 mr-2" />
                  画笔
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-orange-600 border-orange-200 hover:bg-orange-50 bg-transparent"
                >
                  <Eraser className="h-4 w-4 mr-2" />
                  橡皮
                </Button>
              </div>
            </div>

            <div className="flex-1 bg-card border-2 border-border rounded-xl relative overflow-hidden shadow-sm">
              <img
                src="/architectural-sketch-to-render.jpg"
                alt="Sketch canvas"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/5" />
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1 bg-transparent">
                <Upload className="h-4 w-4 mr-2" />
                上传草图
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                清空画布
              </Button>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Controls */}
        <div className="w-80 border-l border-border p-6 space-y-6 overflow-y-auto bg-card/50">
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">描述您想要的效果</Label>
              <Textarea
                placeholder="例如：将这个建筑草图渲染成现代风格的建筑，添加玻璃幕墙和绿化..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-2 resize-none"
                rows={3}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">渲染风格</Label>
              <Select>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="选择渲染风格" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="photorealistic">照片级写实</SelectItem>
                  <SelectItem value="architectural">建筑渲染</SelectItem>
                  <SelectItem value="concept-art">概念艺术</SelectItem>
                  <SelectItem value="watercolor">水彩风格</SelectItem>
                  <SelectItem value="sketch">素描风格</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">控制强度: {controlStrength[0]}%</Label>
              <Slider
                value={controlStrength}
                onValueChange={setControlStrength}
                max={100}
                min={10}
                step={5}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">控制强度越高，生成结果越接近草图结构</p>
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-medium mb-4">渲染结果</h3>
            <div className="aspect-square bg-card rounded-lg overflow-hidden mb-4 border border-border">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 mx-auto animate-spin loading-spinner mb-2" />
                    <p className="text-muted-foreground text-sm loading-text">正在渲染... {progress}%</p>
                    <div className="w-32 h-2 bg-muted rounded-full mt-3 mx-auto">
                      <div className="h-full module-progress-bar rounded-full animate-pulse" style={{ width: `${Math.max(10, progress)}%` }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <img
                  src={(images && images[0]) || "/architectural-sketch-to-render.jpg"}
                  alt="Rendered result"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <Download className="h-4 w-4 mr-2" />
              下载结果
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
