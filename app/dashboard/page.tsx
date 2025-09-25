'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/components/auth/auth-provider'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { 
  BarChart3, 
  Image, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  Heart,
  Eye
} from 'lucide-react'

interface DashboardStats {
  totalImages: number
  totalUsers: number
  totalCost: number
  todayImages: number
  weeklyImages: number
  monthlyImages: number
  popularImages: Array<{
    id: string
    title: string
    likes_count: number
    created_at: string
  }>
  recentUsers: Array<{
    id: string
    email: string
    username: string | null
    created_at: string
  }>
  dailyStats: Array<{
    date: string
    images_generated: number
    cost: number
  }>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createSupabaseBrowserClient()

  useEffect(() => {
    if (!user) return

    const fetchDashboardStats = async () => {
      try {
        setLoading(true)
        setError(null)

        // 获取总体统计
        const [
          { count: totalImages },
          { count: totalUsers },
          { data: costData },
          { count: todayImages },
          { count: weeklyImages },
          { count: monthlyImages },
          { data: popularImages },
          { data: recentUsers },
          { data: dailyStats }
        ] = await Promise.all([
          // 总图片数
          supabase.from('images').select('*', { count: 'exact', head: true }),
          // 总用户数
          supabase.from('users').select('*', { count: 'exact', head: true }),
          // 总成本
          supabase.from('usage_stats').select('cost'),
          // 今日图片数
          supabase
            .from('images')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', new Date().toISOString().split('T')[0]),
          // 本周图片数
          supabase
            .from('images')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
          // 本月图片数
          supabase
            .from('images')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),
          // 热门图片
          supabase
            .from('images')
            .select('id, title, likes_count, created_at')
            .eq('is_public', true)
            .order('likes_count', { ascending: false })
            .limit(5),
          // 最近用户
          supabase
            .from('users')
            .select('id, email, username, created_at')
            .order('created_at', { ascending: false })
            .limit(5),
          // 每日统计
          supabase
            .from('usage_stats')
            .select('date, images_generated, cost')
            .order('date', { ascending: false })
            .limit(7)
        ])

        const totalCost = costData?.reduce((sum, item) => sum + (item.cost || 0), 0) || 0

        setStats({
          totalImages: totalImages || 0,
          totalUsers: totalUsers || 0,
          totalCost,
          todayImages: todayImages || 0,
          weeklyImages: weeklyImages || 0,
          monthlyImages: monthlyImages || 0,
          popularImages: popularImages || [],
          recentUsers: recentUsers || [],
          dailyStats: dailyStats || []
        })
      } catch (err) {
        console.error('获取数据看板统计失败:', err)
        setError('获取统计数据失败')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardStats()
  }, [user, supabase])

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">请先登录</h2>
              <p className="text-muted-foreground">您需要登录才能查看数据看板</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-red-600">加载失败</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>重试</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">数据看板</h1>
          <p className="text-muted-foreground">查看平台使用统计和用户数据</p>
        </div>
        <Badge variant="outline" className="text-sm">
          实时数据
        </Badge>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总图片数</CardTitle>
            <Image className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalImages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              今日新增 {stats?.todayImages}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              活跃用户平台
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总成本</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              累计消耗资源
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月图片</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.monthlyImages.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              本周 {stats?.weeklyImages}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 详细数据 */}
      <Tabs defaultValue="images" className="space-y-4">
        <TabsList>
          <TabsTrigger value="images">热门图片</TabsTrigger>
          <TabsTrigger value="users">最近用户</TabsTrigger>
          <TabsTrigger value="stats">使用统计</TabsTrigger>
        </TabsList>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>热门图片</CardTitle>
              <CardDescription>
                按点赞数排序的公开图片
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.popularImages.map((image, index) => (
                  <div key={image.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{image.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(image.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-red-500" />
                      <span className="font-medium">{image.likes_count}</span>
                    </div>
                  </div>
                ))}
                {stats?.popularImages.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    暂无公开图片
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>最近用户</CardTitle>
              <CardDescription>
                最新注册的用户列表
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.username || '未设置用户名'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
                {stats?.recentUsers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    暂无用户数据
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>每日使用统计</CardTitle>
              <CardDescription>
                最近7天的图片生成和成本统计
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.dailyStats.map((stat) => (
                  <div key={stat.date} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{stat.date}</p>
                        <p className="text-sm text-muted-foreground">
                          生成 {stat.images_generated} 张图片
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${stat.cost.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">成本</p>
                    </div>
                  </div>
                ))}
                {stats?.dailyStats.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    暂无统计数据
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}