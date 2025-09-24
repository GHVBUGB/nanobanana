"use client"

import { useState } from "react"
import { useGeneration } from "@/hooks/use-generation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Upload, Blend, Download, RefreshCw, X } from "lucide-react"
import { pickSingleFile, toObjectUrl } from "@/lib/upload"

interface UploadedImage {
  id: string
  name: string
  imageUrl: string
  file: File
}

export function ImageFusion() {
  const [images, setImages] = useState<UploadedImage[]>([])
  const [fusionStrength, setFusionStrength] = useState([50])
  const [fusionDescription, setFusionDescription] = useState("")
  const [fusionMode, setFusionMode] = useState("blend")
  const { start, progress, images: resultImages, loading } = useGeneration('image-fusion')

  const handleUploadImage = async () => {
    try {
      const file = await pickSingleFile("image/*")
      if (file) {
        const imageUrl = toObjectUrl(file)
        const newImage: UploadedImage = {
          id: Date.now().toString(),
          name: `图片${images.length + 1}`,
          imageUrl,
          file
        }
        setImages(prev => [...prev, newImage])
      }
    } catch (error) {
      console.error('上传图片失败:', error)
    }
  }

  const removeImage = (id: string) => {
    setImages(prev => {
      const updated = prev.filter(image => image.id !== id)
      // 清理对象URL以避免内存泄漏
      const removed = prev.find(image => image.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.imageUrl)
      }
      return updated
    })
  }

  const handleGenerate = async () => {
    if (images.length < 2) {
      alert('请至少上传两张图片进行融合')
      return
    }

    // 构建包含参考图片的请求
    const referenceImages = images.map(image => image.imageUrl)
    const imageDescriptions = images.map((image, index) => `图片${index + 1}`).join('、')
    
    const enhancedPrompt = `融合${imageDescriptions}。${fusionDescription ? `融合描述：${fusionDescription}。` : ''}融合强度：${fusionStrength[0]}%。融合模式：${fusionMode}。`
    
    await start({ 
      description: enhancedPrompt,
      referenceImages: referenceImages,
      fusionStrength: fusionStrength[0],
      fusionMode,
      imageCount: images.length
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto module-container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Image Upload */}
        <div className="space-y-6">
          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">上传图片</h3>

            <div 
              className="upload-area rounded-lg p-8 text-center mb-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={handleUploadImage}
            >
              <Upload className="h-12 w-12 mx-auto loading-spinner mb-4" />
              <p className="text-muted-foreground mb-2">上传要融合的图片</p>
              <p className="text-sm text-muted-foreground">支持多张图片同时融合，点击选择文件</p>
              <Button variant="outline" className="mt-4 bg-transparent">
                选择文件
              </Button>
            </div>

            {/* 显示已上传的图片 */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {images.map((image) => (
                  <div key={image.id} className="relative aspect-square bg-card rounded-lg overflow-hidden border border-border">
                    <img
                      src={image.imageUrl}
                      alt={image.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removeImage(image.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                      {image.name}
                    </div>
                  </div>
                ))}
                
                {/* 添加更多图片按钮 */}
                {images.length < 4 && (
                  <div 
                    className="aspect-square bg-muted/50 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors"
                    onClick={handleUploadImage}
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">添加图片</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {images.length === 0 && (
              <div className="text-center text-muted-foreground text-sm">
                还没有上传任何图片
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">融合设置</h3>

            <div className="space-y-4">
              <div>
                <Label>融合强度: {fusionStrength[0]}%</Label>
                <Slider
                  value={fusionStrength}
                  onValueChange={setFusionStrength}
                  max={100}
                  min={10}
                  step={5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>轻度融合</span>
                  <span>深度融合</span>
                </div>
              </div>

              <div>
                <Label>融合模式</Label>
                <select 
                  className="w-full mt-2 p-2 border border-border rounded-md bg-background"
                  value={fusionMode}
                  onChange={(e) => setFusionMode(e.target.value)}
                >
                  <option value="blend">混合融合</option>
                  <option value="overlay">叠加融合</option>
                  <option value="multiply">正片叠底</option>
                  <option value="screen">滤色融合</option>
                  <option value="soft-light">柔光融合</option>
                </select>
              </div>

              <div>
                <Label htmlFor="fusion-description">融合描述</Label>
                <Textarea
                  id="fusion-description"
                  placeholder="描述你希望的融合效果，例如：将两张图片自然地融合在一起，保持主体清晰..."
                  value={fusionDescription}
                  onChange={(e) => setFusionDescription(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={images.length < 2 || loading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    融合中... {progress}%
                  </>
                ) : (
                  <>
                    <Blend className="h-4 w-4 mr-2" />
                    开始融合 ({images.length}张图片)
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Panel - Fusion Preview */}
        <div className="space-y-6">
          <Card className="p-6 bg-card/50 border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">融合预览</h3>
              {resultImages && resultImages.length > 0 && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </Button>
              )}
            </div>

            <div className="aspect-square bg-card rounded-lg overflow-hidden border border-border">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 mx-auto animate-spin loading-spinner mb-2" />
                    <p className="text-muted-foreground loading-text">正在融合图片... {progress}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      正在处理 {images.length} 张图片的融合
                    </p>
                  </div>
                </div>
              ) : resultImages && resultImages.length > 0 ? (
                <img
                  src={resultImages[0]}
                  alt="Fusion result"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Blend className="h-12 w-12 mx-auto mb-2" />
                    <p>上传至少两张图片</p>
                    <p>设置融合参数后开始融合</p>
                  </div>
                </div>
              )}
            </div>

            {/* 显示多个融合结果 */}
            {resultImages && resultImages.length > 1 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {resultImages.slice(1).map((image, index) => (
                  <div key={index} className="aspect-square bg-card rounded-lg overflow-hidden border border-border">
                    <img
                      src={image}
                      alt={`融合变体 ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">融合预设</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "自然融合", strength: 30, mode: "blend" },
                { name: "艺术融合", strength: 60, mode: "overlay" },
                { name: "梦幻融合", strength: 80, mode: "soft-light" },
                { name: "强烈融合", strength: 90, mode: "multiply" },
              ].map((preset) => (
                <Button
                  key={preset.name}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center bg-transparent"
                  onClick={() => {
                    setFusionStrength([preset.strength])
                    setFusionMode(preset.mode)
                  }}
                >
                  <div className="text-xs mb-1">{preset.name}</div>
                  <div className="text-xs text-muted-foreground">{preset.strength}%</div>
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">融合历史</h3>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-card rounded-lg overflow-hidden border border-border">
                  <img
                    src={`/placeholder.svg?height=80&width=80&text=融合${i}`}
                    alt={`融合历史 ${i}`}
                    className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
