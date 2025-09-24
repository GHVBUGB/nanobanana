"use client"

import { useState } from "react"
import { useGeneration } from "@/hooks/use-generation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, Camera, Download, RefreshCw } from "lucide-react"

export function MultiCamera() {
  const [scenePrompt, setScenePrompt] = useState("")
  const [selectedAngles, setSelectedAngles] = useState<string[]>([])
  const { start, progress, images, loading } = useGeneration('multi-camera')

  const cameraAngles = [
    { id: "front", name: "正面视角" },
    { id: "back", name: "背面视角" },
    { id: "left", name: "左侧视角" },
    { id: "right", name: "右侧视角" },
    { id: "top", name: "俯视视角" },
    { id: "bottom", name: "仰视视角" },
    { id: "diagonal", name: "斜角视角" },
    { id: "close-up", name: "特写视角" },
  ]

  const handleAngleToggle = (angleId: string) => {
    setSelectedAngles((prev) => (prev.includes(angleId) ? prev.filter((id) => id !== angleId) : [...prev, angleId]))
  }

  const handleGenerate = async () => {
    await start({ description: scenePrompt, angles: selectedAngles })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Panel - Scene Setup */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">场景描述</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="scene-description">描述要生成的场景</Label>
                <Textarea
                  id="scene-description"
                  placeholder="详细描述场景内容，例如：一辆红色跑车停在现代建筑前，阳光明媚的下午..."
                  value={scenePrompt}
                  onChange={(e) => setScenePrompt(e.target.value)}
                  className="mt-2"
                  rows={5}
                />
              </div>

              <div>
                <Label>场景风格</Label>
                <select className="w-full mt-2 p-2 border border-border rounded-md bg-background">
                  <option value="">选择风格</option>
                  <option value="realistic">写实风格</option>
                  <option value="cinematic">电影风格</option>
                  <option value="artistic">艺术风格</option>
                  <option value="commercial">商业风格</option>
                  <option value="documentary">纪实风格</option>
                </select>
              </div>

              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">上传参考图片（可选）</p>
                <Button variant="outline" size="sm">
                  选择文件
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Panel - Camera Angles */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">选择机位角度</h3>

            <div className="space-y-3">
              {cameraAngles.map((angle) => (
                <div key={angle.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={angle.id}
                    checked={selectedAngles.includes(angle.id)}
                    onCheckedChange={() => handleAngleToggle(angle.id)}
                  />
                  <Label htmlFor={angle.id} className="text-sm font-medium">
                    {angle.name}
                  </Label>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="consistent-lighting" className="rounded" />
                <Label htmlFor="consistent-lighting" className="text-sm">
                  保持一致光照
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="same-time" className="rounded" />
                <Label htmlFor="same-time" className="text-sm">
                  同一时间点
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="high-quality" className="rounded" />
                <Label htmlFor="high-quality" className="text-sm">
                  高质量渲染
                </Label>
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={selectedAngles.length === 0 || !scenePrompt || loading}
              className="w-full mt-6 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  生成中... {progress}%
                </>
              ) : (
                <>
                  <Camera className="h-4 w-4 mr-2" />
                  生成多机位 ({selectedAngles.length})
                </>
              )}
            </Button>
          </Card>
        </div>

        {/* Right Panel - Multi-Camera Results */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">多机位结果</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                全部下载
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {selectedAngles.slice(0, 6).map((angleId, index) => {
                const angle = cameraAngles.find((a) => a.id === angleId)
                return (
                  <div key={angleId} className="space-y-2">
                    <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                      {loading ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <RefreshCw className="h-4 w-4 animate-spin text-accent" />
                        </div>
                      ) : (
                        <img
                          src={`/placeholder-120x120.png?height=120&width=120&text=${angle?.name}`}
                          alt={angle?.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                        />
                      )}
                    </div>
                    <p className="text-xs text-center text-muted-foreground">{angle?.name}</p>
                  </div>
                )
              })}
            </div>

            {selectedAngles.length > 6 && (
              <p className="text-sm text-muted-foreground text-center mt-3">
                还有 {selectedAngles.length - 6} 个角度正在生成...
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">预设机位组合</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent"
                onClick={() => setSelectedAngles(["front", "left", "right", "top"])}
              >
                产品展示 (4机位)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent"
                onClick={() => setSelectedAngles(["front", "back", "left", "right", "top", "bottom"])}
              >
                全方位 (6机位)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-transparent"
                onClick={() => setSelectedAngles(["front", "diagonal", "close-up"])}
              >
                人像拍摄 (3机位)
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
