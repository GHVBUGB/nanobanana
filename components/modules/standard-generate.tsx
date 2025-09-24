"use client"

import { useState } from "react"
import { useGeneration } from "@/hooks/use-generation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Wand2, Download, RefreshCw, X, Image as ImageIcon } from "lucide-react"
import { pickSingleFile, toObjectUrl } from "@/lib/upload"

export function StandardGenerate() {
  const [referenceImage, setReferenceImage] = useState<string | null>(null)
  const [referenceFile, setReferenceFile] = useState<File | null>(null)
  const [prompt, setPrompt] = useState("")
  const [style, setStyle] = useState("")
  const [quality, setQuality] = useState("standard")
  const { start, progress, images, loading } = useGeneration('standard')

  const handleUpload = async () => {
    try {
      const file = await pickSingleFile("image/*")
      if (file) {
        const imageUrl = toObjectUrl(file)
        setReferenceImage(imageUrl)
        setReferenceFile(file)
      }
    } catch (error) {
      console.error('上传图片失败:', error)
    }
  }

  const handleRemove = () => {
    if (referenceImage) {
      URL.revokeObjectURL(referenceImage)
    }
    setReferenceImage(null)
    setReferenceFile(null)
  }

  const handleGenerate = async () => {
    console.log('🎯 点击生成按钮')
    if (!prompt.trim()) {
      alert('请输入生成描述')
      return
    }

    console.log('📝 生成参数:', {
      prompt,
      style,
      quality,
      hasReferenceImage: !!referenceImage
    })

    // 构建包含参考图片的请求
    const enhancedPrompt = `${prompt}${style ? ` 风格：${style}` : ''}`
    
    try {
      console.log('🚀 调用start函数')
      await start({ 
        description: enhancedPrompt,
        referenceImage: referenceImage,
        style,
        quality,
        hasReferenceImage: !!referenceImage
      })
      console.log('✅ start函数调用完成')
    } catch (error) {
      console.error('❌ 生成失败:', error)
      alert('生成失败: ' + (error as Error).message)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto module-container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Input */}
        <div className="space-y-6">
          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">参考图片 (可选)</h3>

            {!referenceImage ? (
              <div 
                className="upload-area rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={handleUpload}
              >
                <Upload className="h-12 w-12 mx-auto loading-spinner mb-4" />
                <p className="text-muted-foreground mb-2">上传参考图片</p>
                <p className="text-sm text-muted-foreground">AI将基于此图片进行修改和生成</p>
                <Button variant="outline" className="mt-4 bg-transparent">
                  选择文件
                </Button>
              </div>
            ) : (
              <div className="relative">
                <div className="aspect-square bg-card rounded-lg overflow-hidden border border-border">
                  <img
                    src={referenceImage}
                    alt="参考图片"
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2 h-8 w-8 p-0"
                  onClick={handleRemove}
                >
                  <X className="h-4 w-4" />
                </Button>
                <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  参考图片
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">生成设置</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="prompt">生成描述 *</Label>
                <Textarea
                  id="prompt"
                  placeholder={referenceImage 
                    ? "描述你希望如何修改参考图片，例如：将背景改为海边日落，人物穿着改为正装..." 
                    : "描述你想要生成的图片，例如：一只可爱的小猫坐在花园里..."
                  }
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div>
                <Label>图片风格</Label>
                <select 
                  className="w-full mt-2 p-2 border border-border rounded-md bg-background"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                >
                  <option value="">选择风格</option>
                  <option value="realistic">写实风格</option>
                  <option value="anime">动漫风格</option>
                  <option value="oil-painting">油画风格</option>
                  <option value="watercolor">水彩风格</option>
                  <option value="sketch">素描风格</option>
                  <option value="digital-art">数字艺术</option>
                  <option value="vintage">复古风格</option>
                  <option value="minimalist">极简风格</option>
                </select>
              </div>

              <div>
                <Label>生成质量</Label>
                <select 
                  className="w-full mt-2 p-2 border border-border rounded-md bg-background"
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                >
                  <option value="draft">草图质量 (快速)</option>
                  <option value="standard">标准质量</option>
                  <option value="high">高质量 (较慢)</option>
                  <option value="ultra">超高质量 (最慢)</option>
                </select>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || loading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    生成中... {progress}%
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    {referenceImage ? '基于参考图片生成' : '开始生成'}
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          <Card className="p-6 bg-card/50 border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">生成结果</h3>
              {images && images.length > 0 && (
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
                    <p className="text-muted-foreground loading-text">
                      {referenceImage ? '正在基于参考图片生成...' : '正在生成图片...'} {progress}%
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {referenceImage ? '正在识别和修改参考图片' : '正在创建新图片'}
                    </p>
                  </div>
                </div>
              ) : images && images.length > 0 ? (
                <div className="w-full h-full">
                  <img
                    src={images[0]}
                    alt="生成结果"
                    className="w-full h-full object-cover"
                    onLoad={() => console.log('🖼️ 图片加载成功:', images[0])}
                    onError={(e) => {
                      console.error('❌ 图片加载失败:', images[0], e)
                      console.error('❌ 错误详情:', e.currentTarget.src)
                    }}
                  />
                  <div className="text-xs text-green-600 p-2 bg-white/80">
                    图片URL: {images[0]}
                  </div>
                  <div className="text-xs text-blue-600 p-2 bg-white/80">
                    images数组长度: {images.length}
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                    <p>{referenceImage ? '上传参考图片并输入描述' : '输入描述'}</p>
                    <p>点击生成按钮开始</p>
                    <div className="text-xs text-red-600 mt-2">
                      调试: images={JSON.stringify(images)}, loading={String(loading)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 显示多个生成结果 */}
            {images && images.length > 1 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-square bg-card rounded-lg overflow-hidden border border-border">
                    <img
                      src={image}
                      alt={`生成变体 ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">快速模板</h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                "将背景改为海边日落",
                "添加梦幻的光效",
                "改为黑白艺术照",
                "添加花朵装饰",
                "改为卡通风格",
                "添加雨天效果"
              ].map((template) => (
                <Button
                  key={template}
                  variant="outline"
                  className="justify-start text-left bg-transparent"
                  onClick={() => setPrompt(template)}
                >
                  {template}
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">生成历史</h3>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-square bg-card rounded-lg overflow-hidden border border-border">
                  <img
                    src={`/placeholder.svg?height=80&width=80&text=生成${i}`}
                    alt={`生成历史 ${i}`}
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




