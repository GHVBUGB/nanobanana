"use client"

import { useState } from "react"
import { useGeneration } from "@/hooks/use-generation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Upload, Sparkles, Download, RefreshCw } from "lucide-react"

export function FigurineGenerator() {
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("")
  const [quality, setQuality] = useState([80])
  const { start, progress, images, loading } = useGeneration('figurine')

  const handleGenerate = async () => {
    await start({ description: prompt, style, quality: quality[0] })
  }

  return (
    <div className="h-full flex flex-col module-container">
      {/* Header Section */}
      <div className="border-b border-border px-8 py-6 bg-card/50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">生成手办</h1>
            <p className="text-muted-foreground mt-1">使用AI技术生成精美的手办模型</p>
          </div>
          <Button onClick={handleGenerate} disabled={!prompt || loading} className="module-button px-8">
            {loading ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin loading-spinner" />
                <span className="loading-text">生成中...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                生成手办
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Controls */}
        <div className="w-80 border-r border-border p-6 space-y-6 overflow-y-auto bg-card/50">
          <div className="space-y-4">
            <div>
              <Label htmlFor="prompt" className="text-sm font-medium">
                手办描述
              </Label>
              <Textarea
                id="prompt"
                placeholder="例如：一个穿着盔甲的机器人战士，细节丰富，动作姿势..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="mt-2 resize-none"
                rows={4}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">手办风格</Label>
              <Select value={style} onValueChange={setStyle}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="选择手办风格" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="anime">动漫风格</SelectItem>
                  <SelectItem value="realistic">写实风格</SelectItem>
                  <SelectItem value="chibi">Q版风格</SelectItem>
                  <SelectItem value="mecha">机甲风格</SelectItem>
                  <SelectItem value="fantasy">奇幻风格</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-sm font-medium">生成质量: {quality[0]}%</Label>
              <Slider value={quality} onValueChange={setQuality} max={100} min={20} step={10} className="mt-2" />
            </div>
          </div>

          <div className="border-t border-border pt-6">
            <Label className="text-sm font-medium mb-3 block">参考图片</Label>
            <div className="upload-area rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto loading-spinner mb-2" />
              <p className="text-sm text-muted-foreground mb-1">拖拽图片到此处</p>
              <p className="text-xs text-muted-foreground/70">支持 PNG, JPG, JPEG</p>
              <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                选择文件
              </Button>
            </div>
          </div>
        </div>

        {/* Main Preview Area */}
        <div className="flex-1 p-8 bg-card/30">
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">生成预览</h2>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
            </div>

            <div className="flex-1 bg-card rounded-xl p-8 flex items-center justify-center border border-border">
              {loading ? (
                <div className="text-center">
                  <RefreshCw className="h-12 w-12 mx-auto animate-spin loading-spinner mb-4" />
                  <p className="text-muted-foreground mb-4 loading-text">正在生成手办模型... {progress}%</p>
                  <div className="w-48 h-2 bg-muted rounded-full mx-auto">
                    <div className="h-full module-progress-bar rounded-full animate-pulse" style={{ width: `${Math.max(10, progress)}%` }}></div>
                  </div>
                </div>
              ) : (
                <div className="max-w-md w-full">
                  <img
                  src={encodeURI((images && images[0]) || "/futuristic-robot-figurine.jpg")}
                  alt="Generated figurine"
                  className="w-full rounded-lg shadow-sm"
                />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar - History */}
        <div className="w-64 border-l border-border p-6 bg-card/50">
          <h3 className="text-sm font-medium mb-4">生成历史</h3>
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="aspect-square bg-muted rounded-lg overflow-hidden hover:ring-2 module-progress transition-all cursor-pointer"
              >
                <img
                  src={`/placeholder-150x150.png?text=手办${i}`}
                  alt={`历史生成 ${i}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
