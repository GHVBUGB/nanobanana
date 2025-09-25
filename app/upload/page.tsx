'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/image-upload/image-upload'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { AuthModal } from '@/components/auth/auth-modal'

interface UploadedImage {
  id: string
  url: string
  name: string
}

export default function UploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [uploadErrors, setUploadErrors] = useState<string[]>([])
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleUploadComplete = (imageUrl: string, imageId: string) => {
    const newImage: UploadedImage = {
      id: imageId,
      url: imageUrl,
      name: `图片 ${uploadedImages.length + 1}`
    }
    setUploadedImages(prev => [...prev, newImage])
  }

  const handleUploadError = (error: string) => {
    setUploadErrors(prev => [...prev, error])
    // Auto-remove error after 5 seconds
    setTimeout(() => {
      setUploadErrors(prev => prev.slice(1))
    }, 5000)
  }

  const clearErrors = () => {
    setUploadErrors([])
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回
            </Button>
          </div>

          <Card className="text-center py-12">
            <CardContent>
              <div className="space-y-4">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">需要登录</h2>
                  <p className="text-gray-600 mt-2">请先登录后再上传图片</p>
                </div>
                <Button onClick={() => setShowAuthModal(true)}>
                  立即登录
                </Button>
              </div>
            </CardContent>
          </Card>

          <AuthModal 
            isOpen={showAuthModal} 
            onClose={() => setShowAuthModal(false)} 
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold text-gray-900">图片上传</h1>
            <p className="text-gray-600 mt-2">
              上传您的图片到平台，与社区分享您的创作
            </p>
          </div>
        </div>

        {/* Error Messages */}
        {uploadErrors.length > 0 && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">上传错误</h3>
                  <div className="mt-2 space-y-1">
                    {uploadErrors.map((error, index) => (
                      <p key={index} className="text-sm text-red-700">{error}</p>
                    ))}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearErrors}
                  className="text-red-600 hover:text-red-800"
                >
                  清除
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>上传图片</CardTitle>
            <CardDescription>
              支持拖拽上传，最大10MB，支持JPEG、PNG、GIF、WebP格式
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImageUpload
              onUploadComplete={handleUploadComplete}
              onUploadError={handleUploadError}
              maxFiles={5}
              maxSize={10}
            />
          </CardContent>
        </Card>

        {/* Uploaded Images */}
        {uploadedImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>上传成功</span>
                <Badge variant="secondary">{uploadedImages.length}</Badge>
              </CardTitle>
              <CardDescription>
                以下图片已成功上传到您的图库
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {uploadedImages.map((image) => (
                  <div key={image.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={encodeURI(image.url)}
                        alt={image.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {image.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        刚刚上传
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="flex space-x-3">
                  <Button onClick={() => router.push('/dashboard')}>
                    查看数据统计
                  </Button>
                  <Button variant="outline" onClick={() => router.push('/')}>
                    返回首页
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}