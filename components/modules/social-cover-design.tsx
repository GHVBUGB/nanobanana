"use client"

import { useState } from "react"
import { useGeneration } from "@/hooks/use-generation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, RefreshCw, Palette } from "lucide-react"

export function SocialCoverDesign() {
  const [title, setTitle] = useState("")
  const [subtitle, setSubtitle] = useState("")
  const [platform, setPlatform] = useState("")
  const [style, setStyle] = useState("")
  const { start, progress, images, loading } = useGeneration('social-cover')

  const handleGenerate = async () => {
    await start({ platform, title, subtitle, style })
  }

  const platforms = [
    { id: "youtube", name: "YouTube (1280x720)", size: "1280x720" },
    { id: "instagram", name: "Instagram Post (1080x1080)", size: "1080x1080" },
    { id: "facebook", name: "Facebook Cover (820x312)", size: "820x312" },
    { id: "twitter", name: "Twitter Header (1500x500)", size: "1500x500" },
    { id: "linkedin", name: "LinkedIn Banner (1584x396)", size: "1584x396" },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto module-container">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Design Controls */}
        <div className="space-y-6">
          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">封面设计参数</h3>

            <div className="space-y-4">
              <div>
                <Label htmlFor="platform">选择平台</Label>
                <Select value={platform} onValueChange={setPlatform}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="选择社交媒体平台" />
                  </SelectTrigger>
                  <SelectContent>
                    {platforms.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">主标题</Label>
                <Input
                  id="title"
                  placeholder="输入封面主标题"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="subtitle">副标题</Label>
                <Input
                  id="subtitle"
                  placeholder="输入副标题（可选）"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="style">设计风格</Label>
                <Select value={style} onValueChange={setStyle}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="选择设计风格" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">现代简约</SelectItem>
                    <SelectItem value="vibrant">活力色彩</SelectItem>
                    <SelectItem value="professional">商务专业</SelectItem>
                    <SelectItem value="creative">创意艺术</SelectItem>
                    <SelectItem value="minimalist">极简主义</SelectItem>
                    <SelectItem value="gaming">游戏风格</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">设计描述</Label>
                <Textarea id="description" placeholder="描述您想要的封面风格和元素..." className="mt-2" rows={3} />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!title || !platform || loading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    设计中... {progress}%
                  </>
                ) : (
                  <>
                    <Palette className="h-4 w-4 mr-2" />
                    生成封面设计
                  </>
                )}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">颜色主题</h3>
            <div className="grid grid-cols-4 gap-3">
              {["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8", "#F7DC6F"].map((color) => (
                <div
                  key={color}
                  className="aspect-square rounded-lg cursor-pointer border-2 border-transparent hover:border-accent transition-colors"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          <Card className="p-6 bg-card/50 border-border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">设计预览</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
            </div>

            <div className="bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 mx-auto animate-spin text-accent mb-2" />
                    <p className="text-muted-foreground">正在设计封面... {progress}%</p>
                  </div>
                </div>
              ) : (
                <img
                  src={(images && images[0]) || "/youtube-thumbnail-design.jpg"}
                  alt="Cover design preview"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {platform && (
              <p className="text-sm text-muted-foreground mt-2">
                尺寸: {platforms.find((p) => p.id === platform)?.size}
              </p>
            )}
          </Card>

          <Card className="p-6 bg-card/50 border-border">
            <h3 className="text-lg font-semibold mb-4">设计变体</h3>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-muted rounded-lg overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <img
                    src={`/ceholder-svg-height-120-width-200-text---.jpg?height=120&width=200&text=变体${i}`}
                    alt={`设计变体 ${i}`}
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
