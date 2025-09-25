import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies()
    const supabase = createSupabaseServerClient(cookieStore)
    
    // 获取查询参数
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const userId = searchParams.get('userId')
    
    // 构建查询
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
      .range(offset, offset + limit - 1)
    
    // 如果指定了用户ID，则过滤
    if (userId) {
      query = query.eq('user_id', userId)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('获取图片列表失败:', error)
      return NextResponse.json(
        { 
          code: 500, 
          message: '获取图片列表失败', 
          error: error.message 
        },
        { status: 500 }
      )
    }
    
    // 格式化返回数据
    const images = (data || []).map(image => ({
      ...image,
      user: image.users
    }))
    
    return NextResponse.json({
      code: 200,
      message: 'OK',
      data: {
        images,
        total: images.length,
        hasMore: images.length === limit
      }
    })
    
  } catch (error) {
    console.error('API错误:', error)
    return NextResponse.json(
      { 
        code: 500, 
        message: '服务器内部错误',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}