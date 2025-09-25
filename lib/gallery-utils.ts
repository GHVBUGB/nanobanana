// 图片画廊工具函数

export interface GalleryImage {
  id: string
  url: string
  title?: string
  description?: string
  createdAt: Date
  tags?: string[]
  metadata?: {
    width?: number
    height?: number
    size?: number
    format?: string
  }
}

export interface GalleryFilter {
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  searchQuery?: string
}

/**
 * 过滤图片列表
 */
export function filterImages(images: GalleryImage[], filter: GalleryFilter): GalleryImage[] {
  return images.filter(image => {
    // 标签过滤
    if (filter.tags && filter.tags.length > 0) {
      const imageTags = image.tags || []
      const hasMatchingTag = filter.tags.some(tag => 
        imageTags.some(imageTag => 
          imageTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
      if (!hasMatchingTag) return false
    }

    // 日期范围过滤
    if (filter.dateRange) {
      const imageDate = new Date(image.createdAt)
      if (imageDate < filter.dateRange.start || imageDate > filter.dateRange.end) {
        return false
      }
    }

    // 搜索查询过滤
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase()
      const titleMatch = image.title?.toLowerCase().includes(query)
      const descriptionMatch = image.description?.toLowerCase().includes(query)
      const tagMatch = image.tags?.some(tag => tag.toLowerCase().includes(query))
      
      if (!titleMatch && !descriptionMatch && !tagMatch) {
        return false
      }
    }

    return true
  })
}

/**
 * 按日期排序图片
 */
export function sortImagesByDate(images: GalleryImage[], order: 'asc' | 'desc' = 'desc'): GalleryImage[] {
  return [...images].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return order === 'desc' ? dateB - dateA : dateA - dateB
  })
}

/**
 * 获取图片的缩略图URL
 */
export function getThumbnailUrl(imageUrl: string, size: number = 300): string {
  // 如果是本地文件或已经是缩略图，直接返回
  if (imageUrl.startsWith('/') || imageUrl.includes('thumbnail')) {
    return imageUrl
  }

  // 如果是外部URL，尝试生成缩略图
  try {
    const url = new URL(imageUrl)
    
    // 对于一些常见的图片服务，添加缩略图参数
    if (url.hostname.includes('picsum.photos')) {
      return `${imageUrl}?w=${size}&h=${size}&fit=crop`
    }
    
    if (url.hostname.includes('unsplash.com')) {
      return `${imageUrl}?w=${size}&h=${size}&fit=crop&crop=center`
    }
    
    // 默认返回原图
    return imageUrl
  } catch {
    return imageUrl
  }
}

/**
 * 生成图片的唯一ID
 */
export function generateImageId(): string {
  return `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * 验证图片URL是否有效
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    return response.ok && (contentType?.startsWith('image/') ?? false)
  } catch {
    return false
  }
}

/**
 * 从URL获取图片元数据
 */
export async function getImageMetadata(url: string): Promise<GalleryImage['metadata']> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (!response.ok) return {}

    const contentType = response.headers.get('content-type')
    const contentLength = response.headers.get('content-length')

    return {
      format: contentType?.split('/')[1],
      size: contentLength ? parseInt(contentLength) : undefined
    }
  } catch {
    return {}
  }
}

/**
 * 批量处理图片
 */
export async function batchProcessImages(
  urls: string[],
  processor: (url: string) => Promise<GalleryImage>
): Promise<GalleryImage[]> {
  const results = await Promise.allSettled(
    urls.map(url => processor(url))
  )

  return results
    .filter((result): result is PromiseFulfilledResult<GalleryImage> => 
      result.status === 'fulfilled'
    )
    .map(result => result.value)
}

/**
 * 创建图片对象
 */
export function createGalleryImage(
  url: string,
  options: Partial<Omit<GalleryImage, 'id' | 'url' | 'createdAt'>> = {}
): GalleryImage {
  return {
    id: generateImageId(),
    url,
    createdAt: new Date(),
    ...options
  }
}

/**
 * 获取所有唯一标签
 */
export function getAllTags(images: GalleryImage[]): string[] {
  const tagSet = new Set<string>()
  
  images.forEach(image => {
    if (image.tags) {
      image.tags.forEach(tag => tagSet.add(tag))
    }
  })
  
  return Array.from(tagSet).sort()
}

/**
 * 按标签分组图片
 */
export function groupImagesByTag(images: GalleryImage[]): Record<string, GalleryImage[]> {
  const groups: Record<string, GalleryImage[]> = {}
  
  images.forEach(image => {
    if (image.tags && image.tags.length > 0) {
      image.tags.forEach(tag => {
        if (!groups[tag]) {
          groups[tag] = []
        }
        groups[tag].push(image)
      })
    } else {
      // 未标记的图片
      if (!groups['未分类']) {
        groups['未分类'] = []
      }
      groups['未分类'].push(image)
    }
  })
  
  return groups
}