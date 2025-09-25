'use client'

import React, { useState } from 'react'
import { CommunityImageGallery } from '@/components/community/image-gallery'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Search, TrendingUp, Clock, Heart, Upload } from 'lucide-react'
import { useAuth } from '@/components/auth/auth-provider'
import { AuthModal } from '@/components/auth/auth-modal'
import { useRouter } from 'next/navigation'

export default function CommunityPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleUploadClick = () => {
    if (!user) {
      setShowAuthModal(true)
    } else {
      router.push('/upload')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI图像社区</h1>
              <p className="text-gray-600 mt-2">
                发现和分享AI生成的精美图像，与创作者交流灵感
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={handleUploadClick}>
                <Upload className="w-4 h-4 mr-2" />
                上传作品
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索图片描述..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">全部</Badge>
                <Badge variant="outline">风景</Badge>
                <Badge variant="outline">人物</Badge>
                <Badge variant="outline">动物</Badge>
                <Badge variant="outline">艺术</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">今日上传</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                +12% 比昨天
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">热门作品</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                本周获赞最多
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">社区活跃度</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89%</div>
              <p className="text-xs text-muted-foreground">
                用户参与度
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Image Gallery Tabs */}
        <Tabs defaultValue="latest" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="latest" className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>最新</span>
            </TabsTrigger>
            <TabsTrigger value="popular" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>热门</span>
            </TabsTrigger>
            <TabsTrigger value="liked" className="flex items-center space-x-2">
              <Heart className="w-4 h-4" />
              <span>最受欢迎</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="latest" className="space-y-6">
            <CommunityImageGallery 
              title="最新上传"
              showUserInfo={true}
            />
          </TabsContent>

          <TabsContent value="popular" className="space-y-6">
            <CommunityImageGallery 
              title="本周热门"
              showUserInfo={true}
              maxItems={20}
            />
          </TabsContent>

          <TabsContent value="liked" className="space-y-6">
            <CommunityImageGallery 
              title="最受欢迎"
              showUserInfo={true}
              maxItems={20}
            />
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        {!user && (
          <Card className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  加入AI图像社区
                </h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  注册账户，上传您的AI创作，与全球创作者分享灵感，获得点赞和反馈
                </p>
                <div className="flex justify-center space-x-4">
                  <Button onClick={() => setShowAuthModal(true)}>
                    立即注册
                  </Button>
                  <Button variant="outline" onClick={() => setShowAuthModal(true)}>
                    登录账户
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
}