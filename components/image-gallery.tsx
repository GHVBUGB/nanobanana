"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, Download, Heart } from "lucide-react"

// 原始图片数组
const originalGalleryImages = [
  {
    id: 1,
    url: "/jimeng-2025-06-19-6644-ca125ae9.png",
    title: "美式复古潮流插画",
    description: "摇滚薯条盒角色，拟人化红色薯条盒设计"
  },
  {
    id: 2,
    url: "/jimeng-2025-07-03-5590-25776c59.png",
    title: "细腻渐变艺术",
    description: "融合多位艺术家风格的细腻渐变作品"
  },
  {
    id: 3,
    url: "/jimeng-2025-07-08-4634-3f4eff87.png",
    title: "中国美女主持人",
    description: "25岁职业女性形象，时尚造型设计"
  },
  {
    id: 4,
    url: "/jimeng-2025-07-09-9006-8a51535d.png",
    title: "朦胧美学",
    description: "时尚少女与小黑猫，紫色猫耳针织帽"
  },
  {
    id: 5,
    url: "/jimeng-2025-07-12-9957-bd4b1c7c.png",
    title: "Q版齐天大圣",
    description: "蓝图风格吉祥物玩偶设计草图"
  },
  {
    id: 6,
    url: "/jimeng-2025-07-31-4340-e6bfca2d.png",
    title: "蓝图风格设计",
    description: "Q版角色蓝图风格创作"
  },
  {
    id: 7,
    url: "/jimeng-2025-08-26-2445-67688b70.png",
    title: "简笔画卡通",
    description: "Yeoniu Choi风格，粗线条树木仰视图"
  },
  {
    id: 8,
    url: "/jimeng-2025-08-26-6520-f5d2cf49.png",
    title: "潮玩风格花妖",
    description: "超现实主义凋零花妖，翡翠绿酒红渐变"
  },
  {
    id: 9,
    url: "/jimeng-2025-08-26-7483-6b71c634.png",
    title: "古朴线条画",
    description: "凹凸印板风格，农耕生活场景描绘"
  },
  {
    id: 10,
    url: "/jimeng-2025-08-27-3983-f6328ae7.png",
    title: "关羽威武形象",
    description: "骑赤兔马的关羽，熟铜铠甲绿战袍"
  },
  {
    id: 11,
    url: "/jimeng-2025-08-27-8184-c2f5c217.png",
  },
  {
    id: 12,
    url: "/jimeng-2025-08-29-8987-6ccf3787.png",
  },
  {
    id: 13,
    url: "/jimeng-2025-08-31-2969-4ae37bef.png",
  },
  {
    id: 14,
    url: "/jimeng-2025-09-01-4383-00292718.png",
  },
  {
    id: 15,
    url: "/jimeng-2025-09-02-4797-34f69e70.png",
  },
  {
    id: 16,
    url: "/jimeng-2025-09-04-9034-87a62499.png",
  },
  {
    id: 17,
    url: "/jimeng-2025-09-05-5381-159a466d.png",
  },
  {
    id: 18,
    url: "/jimeng-2025-09-05-5414-88432561.png",
  },
  {
    id: 19,
    url: "/jimeng-2025-09-06-8161-1d42bc73.png",
  },
  {
    id: 20,
    url: "/jimeng-2025-09-07-8168-93c17a8e.png",
  },
  {
    id: 21,
    url: "/jimeng-2025-09-08-6456-61b7d793.png",
  },
  {
    id: 22,
    url: "/jimeng-2025-09-09-9739-02030b86.png",
  },
  {
    id: 23,
    url: "/jimeng-2025-09-10-3994-f4c68e08.png",
  },
  {
    id: 24,
    url: "/jimeng-2025-09-10-9044-467800f8.png",
  },
  {
    id: 25,
    url: "/jimeng-2025-09-11-1945-61fbf8cb.png",
  },
  {
    id: 26,
    url: "/jimeng-2025-09-11-2564-9c80d580.png",
  },
  {
    id: 27,
    url: "/jimeng-2025-09-11-5429-b7a9b2dd.png",
  },
  {
    id: 28,
    url: "/jimeng-2025-09-11-8382-70308051.png",
  },
  {
    id: 29,
    url: "/jimeng-2025-09-11-8668-dfcff1bf.png",
  },
  {
    id: 30,
    url: "/jimeng-2025-09-13-2181-16b13088.png",
  },
  {
    id: 31,
    url: "/jimeng-2025-09-13-4926-c647ae42.png",
  },
  {
    id: 32,
    url: "/jimeng-2025-09-13-6485-2d986359.png",
  },
  {
    id: 33,
    url: "/jimeng-2025-09-13-8289-3d8f09c0.png",
  },
  {
    id: 34,
    url: "/jimeng-2025-09-14-7607-a5d45669.png",
  },
  {
    id: 35,
    url: "/jimeng-2025-09-14-9473-fed9bd14.png",
  },
  {
    id: 36,
    url: "/jimeng-2025-09-15-2596-a756f6b0.png",
  },
  {
    id: 37,
    url: "/jimeng-2025-09-15-2823-232b2137.png",
  },
  {
    id: 38,
    url: "/jimeng-2025-09-15-3192-baeb3381.png",
  },
  {
    id: 39,
    url: "/jimeng-2025-09-15-4489-c062f0f2.png",
  },
  {
    id: 40,
    url: "/jimeng-2025-09-15-7880-e69e3783.png",
  },
  {
    id: 41,
    url: "/jimeng-2025-09-16-1301-d56c4d77.png",
  },
  {
    id: 42,
    url: "/jimeng-2025-09-16-1417-8fe54baf.png",
  },
  {
    id: 43,
    url: "/jimeng-2025-09-16-2023-c6ccb39f.png",
  },
  {
    id: 44,
    url: "/jimeng-2025-09-16-6132-1a3911bc.png",
  },
  {
    id: 45,
    url: "/jimeng-2025-09-16-6798-c5ee6042.png",
  },
  {
    id: 46,
    url: "/jimeng-2025-09-16-9547-dceb255c.png",
  },
  {
    id: 47,
    url: "/jimeng-2025-09-17-4574-1e38f7a2.png",
  },
  {
    id: 48,
    url: "/jimeng-2025-09-17-5281-a756f6b0.png",
  },
  {
    id: 49,
    url: "/jimeng-2025-09-17-7275-5e57956f.png",
  },
  {
    id: 50,
    url: "/jimeng-2025-09-17-9669-02ee61a3.png",
  },
  {
    id: 51,
    url: "/jimeng-2025-09-18-1021-f9f94c46.png",
  },
  {
    id: 52,
    url: "/jimeng-2025-09-18-4247-71adbe6e.png",
  },
  {
    id: 53,
    url: "/jimeng-2025-09-18-4814-5b24c228.png",
  },
  {
    id: 54,
    url: "/jimeng-2025-09-18-4915-49dfade3.png",
  },
  {
    id: 55,
    url: "/jimeng-2025-09-18-6647-58ba3ac8.png",
  },
  {
    id: 56,
    url: "/jimeng-2025-09-19-6397-ded857df.png",
  },
  {
    id: 57,
    url: "/jimeng-2025-09-19-7143-d3471f29.png",
  },
  {
    id: 58,
    url: "/jimeng-2025-09-19-7153-139e10b8.png",
  },
  {
    id: 59,
    url: "/jimeng-2025-09-19-7463-3d4e9018.png",
  },
  {
    id: 60,
    url: "/jimeng-2025-09-19-8222-a5d45669.png",
  },
  {
    id: 61,
    url: "/jimeng-2025-09-20-4103-3e387007.png",
  },
  {
    id: 62,
    url: "/jimeng-2025-09-20-5027-319571fd.png",
  },
  {
    id: 63,
    url: "/jimeng-2025-09-20-8819-d499673d.png",
  },
  {
    id: 64,
    url: "/jimeng-2025-09-21-5319-9beee95f.png",
  },
  {
    id: 65,
    url: "/jimeng-2025-09-21-6180-5ec02323.png",
  },
  {
    id: 66,
    url: "/jimeng-2025-09-21-7727-c972ff62.png",
  },
  {
    id: 67,
    url: "/jimeng-2025-09-22-2665-bab2578f.png",
  },
  {
    id: 68,
    url: "/jimeng-2025-09-22-3608-9beee95f.png",
  },
  {
    id: 69,
    url: "/jimeng-2025-09-22-6657-a066ae07.png",
  },
  {
    id: 70,
    url: "/jimeng-2025-09-23-1380-5b07b78d.png",
  },
]

export function ImageGallery() {
  const [isLoading, setIsLoading] = useState(true)
  const [galleryImages, setGalleryImages] = useState(originalGalleryImages)
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set())

  // 随机打乱数组的函数
  const shuffleArray = (array: typeof originalGalleryImages) => {
    const shuffled = [...array]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled
  }

  const handleImageError = (imageId: number) => {
    setImageErrors(prev => new Set(prev).add(imageId))
  }

  useEffect(() => {
    // 每次组件挂载时随机排序图片
    setGalleryImages(shuffleArray(originalGalleryImages))
    const t = setTimeout(() => setIsLoading(false), 600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="h-full p-0 overflow-auto" style={{ backgroundColor: 'var(--gallery-background)' }}>
        {isLoading ? (
          <div className="columns-4 gap-0 p-0">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="break-inside-avoid mb-0">
                <Skeleton className="w-full h-64 rounded-none" />
              </div>
            ))}
          </div>
        ) : (
          <div className="columns-4 gap-0 p-0">
            {galleryImages.map((image) => (
              <div key={image.id} className="break-inside-avoid mb-0 relative group overflow-hidden">
                {imageErrors.has(image.id) ? (
                  <div className="w-full h-64 flex items-center justify-center bg-gray-100">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <p className="text-sm text-gray-500">图片加载失败</p>
                    </div>
                  </div>
                ) : (
                  <img
                    src={encodeURI(image.url)}
                    alt={`AI生成图像 ${image.id}`}
                    className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105 block"
                    loading="lazy"
                    onError={() => handleImageError(image.id)}
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                
                {/* 悬停时显示的文字信息 - 隐藏文字描述 */}
                {/* <div className="absolute bottom-0 left-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/60 backdrop-blur-sm p-3 max-h-32 overflow-y-auto">
                    <p className="text-white text-xs leading-relaxed">
                      {(() => {
                        const filename = image.url.split('/').pop()?.replace('.png', '') || '';
                        // 提取提示词：去掉 jimeng-日期-数字- 前缀，保留后面的完整提示词
                        const promptMatch = filename.match(/^jimeng-\d{4}-\d{2}-\d{2}-\d+-(.+)$/);
                        if (promptMatch && promptMatch[1]) {
                          // 将....替换为省略号，并清理可能的特殊字符
                          return promptMatch[1].replace(/\.{4,}/g, '...').trim();
                        }
                        return `AI生成图像 ${image.id}`;
                      })()}
                    </p>
                  </div>
                </div> */}
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex gap-1">
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0 bg-white/90 hover:bg-white">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
    </div>
  )
}
