'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Heart, 
  Download, 
  Share2, 
  MessageCircle, 
  Send,
  Calendar,
  Eye,
  Bookmark,
  Flag,
  MoreHorizontal
} from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'

interface Comment {
  id: string
  user: {
    name: string
    avatar?: string
  }
  content: string
  createdAt: string
  likes: number
}

interface ImageDetailModalProps {
  isOpen: boolean
  onClose: () => void
  image: {
    id: string
    url: string
    title: string
    description?: string
    prompt?: string
    user: {
      name: string
      avatar?: string
    }
    createdAt: string
    likes: number
    views: number
    downloads: number
    tags: string[]
    isLiked?: boolean
    isBookmarked?: boolean
  }
}

export function ImageDetailModal({ isOpen, onClose, image }: ImageDetailModalProps) {
  const { user } = useAuth()
  const [isLiked, setIsLiked] = useState(image.isLiked || false)
  const [isBookmarked, setIsBookmarked] = useState(image.isBookmarked || false)
  const [likes, setLikes] = useState(image.likes)
  const [newComment, setNewComment] = useState('')
  const [comments, setComments] = useState<Comment[]>([
    {
      id: '1',
      user: { name: '艺术爱好者', avatar: '' },
      content: '这张图片太棒了！色彩搭配很有创意。',
      createdAt: '2024-01-15T10:30:00Z',
      likes: 5
    },
    {
      id: '2',
      user: { name: 'AI创作者', avatar: '' },
      content: '请问用的是什么提示词？效果很不错！',
      createdAt: '2024-01-15T11:15:00Z',
      likes: 3
    }
  ])

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikes(prev => isLiked ? prev - 1 : prev + 1)
  }

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked)
  }

  const handleDownload = () => {
    // 实现下载功能
    const link = document.createElement('a')
    link.href = image.url
    link.download = `${image.title}.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.title,
          text: image.description,
          url: window.location.href
        })
      } catch (error) {
        console.log('分享失败:', error)
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const handleAddComment = () => {
    if (!newComment.trim() || !user) return

    const comment: Comment = {
      id: Date.now().toString(),
      user: {
        name: user.email?.split('@')[0] || '用户',
        avatar: ''
      },
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0
    }

    setComments(prev => [comment, ...prev])
    setNewComment('')
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* 图片区域 */}
          <div className="relative bg-black flex items-center justify-center">
            <img
              src={encodeURI(image.url)}
              alt={image.title}
              className="max-w-full max-h-[70vh] object-contain"
            />
          </div>

          {/* 信息区域 */}
          <div className="flex flex-col h-full">
            <DialogHeader className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={image.user.avatar} />
                    <AvatarFallback>
                      {image.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <DialogTitle className="text-lg">{image.title}</DialogTitle>
                    <p className="text-sm text-gray-600">
                      by {image.user.name}
                    </p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>

            {/* 操作按钮 */}
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant={isLiked ? "default" : "ghost"}
                    size="sm"
                    onClick={handleLike}
                    className="flex items-center space-x-2"
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{likes}</span>
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={handleDownload}>
                    <Download className="w-4 h-4 mr-2" />
                    下载
                  </Button>
                  
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    分享
                  </Button>
                  
                  <Button
                    variant={isBookmarked ? "default" : "ghost"}
                    size="sm"
                    onClick={handleBookmark}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm">
                  <Flag className="w-4 h-4" />
                </Button>
              </div>

              {/* 统计信息 */}
              <div className="flex items-center space-x-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{image.views} 浏览</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Download className="w-4 h-4" />
                  <span>{image.downloads} 下载</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(image.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* 描述和标签 */}
            <div className="p-6 border-b">
              {image.description && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">描述</h4>
                  <p className="text-gray-700">{image.description}</p>
                </div>
              )}

              {image.prompt && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">提示词</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    {image.prompt}
                  </p>
                </div>
              )}

              {image.tags.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">标签</h4>
                  <div className="flex flex-wrap gap-2">
                    {image.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 评论区域 */}
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b">
                <h4 className="font-medium flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>评论 ({comments.length})</span>
                </h4>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={comment.user.avatar} />
                        <AvatarFallback>
                          {comment.user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">
                            {comment.user.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 mt-1">
                          {comment.content}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            <Heart className="w-3 h-3 mr-1" />
                            {comment.likes}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-6 px-2">
                            回复
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* 添加评论 */}
              {user && (
                <div className="p-6 border-t">
                  <div className="flex space-x-3">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        placeholder="写下你的评论..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="min-h-[60px]"
                      />
                      <div className="flex justify-end">
                        <Button 
                          size="sm" 
                          onClick={handleAddComment}
                          disabled={!newComment.trim()}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          发送
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}