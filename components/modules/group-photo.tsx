"use client"

import { useState } from "react"
import { useGeneration } from "@/hooks/use-generation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Upload, Users, Download, RefreshCw, X } from "lucide-react"
import { pickSingleFile, toObjectUrl } from "@/lib/upload"

interface UploadedPerson {
  id: string
  name: string
  imageUrl: string
  file: File
}

export function GroupPhoto() {
  const [people, setPeople] = useState<UploadedPerson[]>([])
  const [scenePrompt, setScenePrompt] = useState("")
  const [groupStyle, setGroupStyle] = useState("")
  const [autoArrange, setAutoArrange] = useState(true)
  const [matchLighting, setMatchLighting] = useState(true)
  const { start, progress, images, loading } = useGeneration('group-photo')

  const handleUploadPerson = async () => {
    try {
      const file = await pickSingleFile("image/*")
      if (file) {
        const imageUrl = toObjectUrl(file)
        const newPerson: UploadedPerson = {
          id: Date.now().toString(),
          name: `人物${people.length + 1}`,
          imageUrl,
          file
        }
        setPeople(prev => [...prev, newPerson])
      }
    } catch (error) {
      console.error('上传图片失败:', error)
    }
  }

  const removePerson = (id: string) => {
    setPeople(prev => {
      const updated = prev.filter(person => person.id !== id)
      // 清理对象URL以避免内存泄漏
      const removed = prev.find(person => person.id === id)
      if (removed) {
        URL.revokeObjectURL(removed.imageUrl)
      }
      return updated
    })
  }

  const handleGenerate = async () => {
    if (!scenePrompt.trim()) {
      alert('请输入场景描述')
      return
    }
    
    if (people.length === 0) {
      alert('请至少上传一张人物照片')
      return
    }

    // 构建包含参考图片的请求
    const referenceImages = people.map(person => person.imageUrl)
    const peopleDescription = people.map((person, index) => `人物${index + 1}`).join('、')
    
    const enhancedPrompt = `合成包含${peopleDescription}的合影照片。场景：${scenePrompt}。${groupStyle ? `风格：${groupStyle}。` : ''}${autoArrange ? '自动排列人物位置。' : ''}${matchLighting ? '统一光照效果。' : ''}`
    
    await start({ 
      description: enhancedPrompt,
      referenceImages: referenceImages,
      style: groupStyle,
      autoArrange,
      matchLighting,
      peopleCount: people.length
    })
  }

  return (
    <div className="p-6 max-w-6xl mx-auto module-container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - People Upload */}
        <div className="space-y-6">
          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">上传人物照片</h3>

            <div 
              className="upload-area rounded-lg p-8 text-center mb-4 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={handleUploadPerson}
            >
              <Upload className="h-12 w-12 mx-auto loading-spinner mb-4" />
              <p className="text-muted-foreground mb-2">上传要合成的人物照片</p>
              <p className="text-sm text-muted-foreground">支持多人同时上传，点击选择文件</p>
              <Button variant="outline" className="mt-4 bg-transparent">
                选择文件
              </Button>
            </div>

            {/* 显示已上传的人物 */}
            {people.length > 0 && (
              <div className="grid grid-cols-2 gap-3">
                {people.map((person) => (
                  <div key={person.id} className="relative aspect-[3/4] bg-card rounded-lg overflow-hidden border border-border">
                    <img
                      src={person.imageUrl}
                      alt={person.name}
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0"
                      onClick={() => removePerson(person.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                      {person.name}
                    </div>
                  </div>
                ))}
                
                {/* 添加更多人物按钮 */}
                {people.length < 6 && (
                  <div 
                    className="aspect-[3/4] bg-muted/50 rounded-lg border-2 border-dashed border-border flex items-center justify-center cursor-pointer hover:bg-muted transition-colors"
                    onClick={handleUploadPerson}
                  >
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">添加人物</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {people.length === 0 && (
              <div className="text-center text-muted-foreground text-sm">
                还没有上传任何人物照片
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">合影设置</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="scene-prompt">场景描述 *</Label>
                <Textarea
                  id="scene-prompt"
                  placeholder="描述合影的场景和背景，例如：在海边日落时分，大家开心地站在一起..."
                  value={scenePrompt}
                  onChange={(e) => setScenePrompt(e.target.value)}
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div>
                <Label>合影风格</Label>
                <select 
                  className="w-full mt-2 p-2 border border-border rounded-md bg-background"
                  value={groupStyle}
                  onChange={(e) => setGroupStyle(e.target.value)}
                >
                  <option value="">选择风格</option>
                  <option value="casual">休闲合影</option>
                  <option value="formal">正式合影</option>
                  <option value="party">聚会合影</option>
                  <option value="travel">旅行合影</option>
                  <option value="wedding">婚礼合影</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="auto-arrange" 
                  className="rounded" 
                  checked={autoArrange}
                  onChange={(e) => setAutoArrange(e.target.checked)}
                />
                <Label htmlFor="auto-arrange" className="text-sm">
                  自动排列人物位置
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="match-lighting" 
                  className="rounded" 
                  checked={matchLighting}
                  onChange={(e) => setMatchLighting(e.target.checked)}
                />
                <Label htmlFor="match-lighting" className="text-sm">
                  统一光照效果
                </Label>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!scenePrompt.trim() || people.length === 0 || loading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    合成中... {progress}%
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    生成合影 ({people.length}人)
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Panel - Group Photo Preview */}
        <div className="space-y-6">
          <Card className="p-6 bg-card/50 border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">合影预览</h3>
              {images && images.length > 0 && (
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </Button>
              )}
            </div>

            <div className="aspect-[4/3] bg-card rounded-lg overflow-hidden border border-border">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 mx-auto animate-spin loading-spinner mb-2" />
                    <p className="text-muted-foreground loading-text">正在合成合影... {progress}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      正在处理 {people.length} 个人物的合影
                    </p>
                  </div>
                </div>
              ) : images && images.length > 0 ? (
                <img
                  src={images[0]}
                  alt="Group photo result"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <Users className="h-12 w-12 mx-auto mb-2" />
                    <p>上传人物照片并设置场景后</p>
                    <p>点击生成合影</p>
                  </div>
                </div>
              )}
            </div>

            {/* 显示多个生成结果 */}
            {images && images.length > 1 && (
              <div className="grid grid-cols-2 gap-2 mt-4">
                {images.slice(1).map((image, index) => (
                  <div key={index} className="aspect-[4/3] bg-card rounded-lg overflow-hidden border border-border">
                    <img
                      src={image}
                      alt={`合影变体 ${index + 2}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">布局选项</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: "一字排列", layout: "line" },
                { name: "三角形", layout: "triangle" },
                { name: "圆形排列", layout: "circle" },
                { name: "自由排列", layout: "free" },
              ].map((option) => (
                <Button
                  key={option.layout}
                  variant="outline"
                  className="h-20 flex flex-col items-center justify-center bg-transparent"
                >
                  <div className="text-xs mb-1">{option.name}</div>
                  <div className="w-8 h-6 bg-muted rounded" />
                </Button>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">合影历史</h3>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/3] bg-card rounded-lg overflow-hidden border border-border">
                  <img
                    src={`/ceholder-svg-height-80-width-100-text---.jpg?height=80&width=100&text=合影${i}`}
                    alt={`合影历史 ${i}`}
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
