'use client'

import React, { useState, useEffect } from 'react'
import { Heart, Download, Share2, Eye, User, Calendar, MessageCircle, MoreHorizontal } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/auth/auth-provider'
import { ImageDetailModal } from './image-detail-modal'

interface ImageItem {
  id: string
  user_id: string
  prompt: string
  image_url: string
  thumbnail_url: string | null
  likes_count: number
  downloads: number
  created_at: string
  updated_at: string
  user?: {
    username: string | null
    email: string
    avatar_url: string | null
  }
  isLiked?: boolean
  isBookmarked?: boolean
}

interface ImageGalleryProps {
  title?: string
  showUserInfo?: boolean
  maxItems?: number
  userId?: string // Filter by specific user
}

export function CommunityImageGallery({ 
  title = "社区图片", 
  showUserInfo = true, 
  maxItems,
  userId 
}: ImageGalleryProps) {
  const { user } = useAuth()
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)

  useEffect(() => {
    fetchImages()
  }, [userId, maxItems])

  const fetchImages = async () => {
    try {
      setLoading(true)
      
      let query = supabase
        .from('images')
        .select(`
          *,
          users:user_id (
            username,
            email,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (maxItems) {
        query = query.limit(maxItems)
      }

      const { data, error } = await query

      if (error) throw error

      // Check which images are liked by current user
      let imagesWithLikes = data || []
      if (user) {
        const { data: likes } = await supabase
          .from('image_likes')
          .select('image_id')
          .eq('user_id', user.id)

        const likedImageIds = new Set(likes?.map(like => like.image_id) || [])
        imagesWithLikes = (data || []).map(image => ({
          ...image,
          user: image.users,
          isLiked: likedImageIds.has(image.id)
        }))
      }

      setImages(imagesWithLikes)
    } catch (err) {
      console.error('Error fetching images:', err)
      setError('加载图片失败')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (imageId: string) => {
    if (!user) return

    try {
      const image = images.find(img => img.id === imageId)
      if (!image) return

      if (image.isLiked) {
        // Unlike
        await supabase
          .from('image_likes')
          .delete()
          .eq('user_id', user.id)
          .eq('image_id', imageId)

        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, isLiked: false, likes_count: img.likes_count - 1 }
            : img
        ))
      } else {
        // Like
        await supabase
          .from('image_likes')
          .insert({ user_id: user.id, image_id: imageId })

        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, isLiked: true, likes_count: img.likes_count + 1 }
            : img
        ))
      }
    } catch (err) {
      console.error('Error toggling like:', err)
    }
  }

  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${prompt.slice(0, 20)}.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading image:', err)
    }
  }

  const handleShare = async (image: ImageItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.prompt,
          text: `查看这张AI生成的图片：${image.prompt}`,
          url: window.location.origin + `/image/${image.id}`
        })
      } catch (err) {
        console.error('Error sharing:', err)
      }
    } else {
      // Fallback: copy to clipboard
      const shareUrl = `${window.location.origin}/image/${image.id}`
      await navigator.clipboard.writeText(shareUrl)
      alert('链接已复制到剪贴板')
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return '刚刚'
    if (diffInHours < 24) return `${diffInHours}小时前`
    if (diffInHours < 24 * 7) return `${Math.floor(diffInHours / 24)}天前`
    return date.toLocaleDateString('zh-CN')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-square bg-gray-200 animate-pulse" />
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
        <Button onClick={fetchImages} className="mt-4">
          重试
        </Button>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">暂无图片</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <Badge variant="secondary">{images.length} 张图片</Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
            <div className="relative aspect-square">
              <img
                src={encodeURI(image.thumbnail_url || image.image_url)}
                alt={image.prompt}
                className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-200"
                onClick={() => setSelectedImage(image)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLike(image.id)
                    }}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Heart className={`w-4 h-4 ${image.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(image.image_url, image.prompt)
                    }}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare(image)
                    }}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* 统计信息覆盖层 */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                <div className="flex items-center justify-between text-white text-sm">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Heart className="w-3 h-3" />
                      <span>{image.likes_count}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3" />
                      <span>1.2k</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>23</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-white hover:bg-white/20">
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
            
            <CardContent className="p-4">
              <div className="space-y-3">
                <p className="text-sm text-gray-900 line-clamp-2 font-medium">
                  {image.prompt}
                </p>
                
                {showUserInfo && image.user && (
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={image.user.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {image.user.username?.[0] || image.user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-gray-600 truncate">
                      {image.user.username || image.user.email.split('@')[0]}
                    </span>
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(image.created_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Heart className="w-3 h-3" />
                    <span>{image.likes_count}</span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike(image.id)}
                    className={`flex-1 ${image.isLiked ? 'text-red-600' : ''}`}
                    disabled={!user}
                  >
                    <Heart className={`w-4 h-4 mr-1 ${image.isLiked ? 'fill-current' : ''}`} />
                    {image.likes_count}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDownload(image.image_url, image.prompt)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleShare(image)}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="max-w-4xl max-h-full bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative">
              <img
                src={encodeURI(selectedImage.image_url)}
                alt={selectedImage.prompt}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white hover:bg-opacity-75"
                onClick={() => setSelectedImage(null)}
              >
                ✕
              </Button>
            </div>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{selectedImage.prompt}</h3>
              {showUserInfo && selectedImage.user && (
                <div className="flex items-center space-x-2 mb-4">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={selectedImage.user.avatar_url || undefined} />
                    <AvatarFallback>
                      {selectedImage.user.username?.[0] || selectedImage.user.email[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">
                      {selectedImage.user.username || selectedImage.user.email.split('@')[0]}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(selectedImage.created_at)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => handleLike(selectedImage.id)}
                  className={selectedImage.isLiked ? 'text-red-600' : ''}
                  disabled={!user}
                >
                  <Heart className={`w-4 h-4 mr-2 ${selectedImage.isLiked ? 'fill-current' : ''}`} />
                  {selectedImage.likes_count}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedImage.image_url, selectedImage.prompt)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  下载
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleShare(selectedImage)}
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  分享
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}