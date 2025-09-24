"use client"

import { useState } from "react"
import { useGeneration } from "@/hooks/use-generation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Grid3X3, Download, RefreshCw } from "lucide-react"

export function IdPhotos() {
  const [photoSize, setPhotoSize] = useState("")
  const [background, setBackground] = useState("")
  const { start, progress, images, loading } = useGeneration('id-photos')

  const handleGenerate = async () => {
    await start({ size: photoSize, background })
  }

  const photoSizes = [
    { id: "1inch", name: "1寸 (25x35mm)", size: "25x35mm" },
    { id: "2inch", name: "2寸 (35x49mm)", size: "35x49mm" },
    { id: "passport", name: "护照 (33x48mm)", size: "33x48mm" },
    { id: "visa", name: "签证 (35x45mm)", size: "35x45mm" },
    { id: "id-card", name: "身份证 (26x32mm)", size: "26x32mm" },
  ]

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Panel - Upload & Settings */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">上传人像照片</h3>

            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center mb-4">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">上传清晰的人像照片</p>
              <p className="text-sm text-muted-foreground">建议正面免冠照片</p>
              <Button variant="outline" className="mt-4 bg-transparent">
                选择文件
              </Button>
            </div>

            <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
              <img
                src="/placeholder.svg?height=300&width=225&text=人像照片"
                alt="Portrait photo"
                className="w-full h-full object-cover"
              />
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">证件照设置</h3>

            <div className="space-y-4">
              <div>
                <Label>照片尺寸</Label>
                <Select value={photoSize} onValueChange={setPhotoSize}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="选择证件照尺寸" />
                  </SelectTrigger>
                  <SelectContent>
                    {photoSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>背景颜色</Label>
                <Select value={background} onValueChange={setBackground}>
                  <SelectTrigger className="mt-2">
                    <SelectValue placeholder="选择背景颜色" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="white">白色背景</SelectItem>
                    <SelectItem value="blue">蓝色背景</SelectItem>
                    <SelectItem value="red">红色背景</SelectItem>
                    <SelectItem value="gray">灰色背景</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="auto-crop" className="rounded" />
                <Label htmlFor="auto-crop" className="text-sm">
                  自动裁剪人像
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="beauty-filter" className="rounded" />
                <Label htmlFor="beauty-filter" className="text-sm">
                  轻度美颜
                </Label>
              </div>

              <Button
                onClick={handleGenerate}
                disabled={!photoSize || !background || loading}
                className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    生成中... {progress}%
                  </>
                ) : (
                  <>
                    <Grid3X3 className="h-4 w-4 mr-2" />
                    生成9宫格证件照
                  </>
                )}
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Panel - 9-Grid Preview */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">9宫格证件照</h3>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                下载
              </Button>
            </div>

            <div className="aspect-square bg-muted rounded-lg p-4">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 mx-auto animate-spin text-accent mb-2" />
                    <p className="text-muted-foreground">正在生成证件照... {progress}%</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 h-full">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="bg-white rounded border aspect-[3/4] overflow-hidden">
                      <img
                        src={`/ceholder-svg-height-120-width-90-text-.jpg?height=120&width=90&text=${i + 1}`}
                        alt={`证件照 ${i + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {photoSize && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                尺寸: {photoSizes.find((s) => s.id === photoSize)?.size} | 背景: {background}
              </p>
            )}
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">单张预览</h3>
            <div className="flex justify-center">
              <div className="aspect-[3/4] w-48 bg-white rounded border overflow-hidden">
                <img
                  src="/placeholder.svg?height=240&width=180&text=证件照"
                  alt="Single ID photo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                调整位置
              </Button>
              <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                更换背景
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
