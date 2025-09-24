"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Download, Heart } from "lucide-react"

const sampleImages = [
  {
    id: 1,
    url: "/placeholder.svg?height=400&width=225&text=AI生成图像1",
  },
  {
    id: 2,
    url: "/placeholder.svg?height=400&width=225&text=AI生成图像2",
  },
  {
    id: 3,
    url: "/placeholder.svg?height=400&width=225&text=AI生成图像3",
  },
  {
    id: 4,
    url: "/placeholder.svg?height=400&width=225&text=AI生成图像4",
  },
  {
    id: 5,
    url: "/placeholder.svg?height=400&width=225&text=AI生成图像5",
  },
  {
    id: 6,
    url: "/placeholder.svg?height=400&width=225&text=AI生成图像6",
  },
  {
    id: 7,
    url: "/placeholder.svg?height=400&width=225&text=AI生成图像7",
  },
  {
    id: 8,
    url: "/placeholder.svg?height=400&width=225&text=AI生成图像8",
  },
  {
    id: 9,
    url: "/placeholder.svg?height=400&width=225&text=AI生成图像9",
  },
  {
    id: 10,
    url: "/placeholder.svg?height=400&width=225&text=AI生成图像10",
  },
  {
    id: 11,
    url: "/placeholder.svg?height=400&width=225&text=AI生成图像11",
  },
  {
    id: 12,
    url: "/placeholder.svg?height=400&width=225&text=AI生成图像12",
  },
]

export function ImageGallery() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--gallery-background)' }}>
      {/* Header */}
      <div className="p-6 border-b border-border bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground">图像作品集</h2>
            <p className="text-muted-foreground">浏览和管理您的 AI 生成图像</p>
          </div>
          <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <Plus className="h-4 w-4 mr-2" />
            新建项目
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="搜索图像、标签或类别..." className="pl-10 bg-background" />
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="flex-1 p-0 overflow-auto" style={{ backgroundColor: 'var(--gallery-background)' }}>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-0">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="aspect-[9/16]">
                <Skeleton className="w-full h-full rounded-none" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-0">
            {sampleImages.map((image) => (
              <Card
                key={image.id}
                className="group overflow-hidden hover:shadow-lg transition-all duration-300 rounded-none border-0 bg-transparent m-0 p-0"
              >
                <div className="relative aspect-[9/16] overflow-hidden m-0 p-0 block">
                  <img
                    src={image.url || "/placeholder.svg"}
                    alt={`AI生成图像${image.id}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 block m-0 p-0"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
