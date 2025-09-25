import { createClient } from '@supabase/supabase-js'

// 获取环境变量
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

// 创建Supabase客户端
let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey)
  console.log('✅ Supabase客户端初始化成功')
} else {
  console.warn('⚠️ Supabase环境变量未配置，跳过数据库保存功能')
}

/**
 * 保存生成的图片到 Supabase 数据库
 */
export async function saveGeneratedImages(
  images: string[], 
  prompt: string, 
  taskId: string
): Promise<void> {
  console.log('🔄 开始保存图片到 Supabase 数据库...')
  console.log('📊 图片数量:', images.length)
  console.log('📝 提示词:', prompt.substring(0, 100) + (prompt.length > 100 ? '...' : ''))
  console.log('🆔 任务ID:', taskId)
  
  // 过滤有效的图片URL
  const validImages = images.filter(imageUrl => {
    if (!imageUrl || typeof imageUrl !== 'string') {
      console.log('❌ 跳过无效图片URL:', imageUrl)
      return false
    }
    
    // 跳过占位符图片
    if (imageUrl.includes('placeholder') || imageUrl.includes('/placeholder.svg')) {
      console.log('📋 跳过占位符图片:', imageUrl)
      return false
    }
    
    // 检查是否为有效的图片URL
    const isValidUrl = imageUrl.startsWith('http') || 
                      imageUrl.startsWith('/') ||
                      /\.(png|jpg|jpeg|gif|webp)$/i.test(imageUrl)
    
    if (!isValidUrl) {
      console.log('❌ 跳过无效图片格式:', imageUrl)
      return false
    }
    
    console.log('✅ 有效图片URL:', imageUrl)
    return true
  })

  if (validImages.length === 0) {
    console.log('⚠️ 没有有效图片需要保存到数据库')
    return
  }

  console.log(`📸 准备保存 ${validImages.length} 张有效图片`)

  // 使用服务角色密钥直接保存，绕过RLS
  try {
    if (!supabase) {
      console.warn('⚠️ Supabase未初始化，跳过数据库保存')
      return
    }
    
    // 获取当前登录用户ID，如果没有则使用匿名用户ID
    let userId = 'beeb74bd-9680-47e9-8ea2-6553f3ca3a26' // 默认匿名用户ID
    
    // 尝试从任务ID或其他方式获取真实用户ID
    // 这里可以根据实际需求添加用户ID获取逻辑
    
    console.log('👤 使用用户ID保存图片:', userId)
    
    // 批量插入图片记录
    const imageRecords = validImages.map((imageUrl, index) => ({
      user_id: userId,
      title: extractImageTitle(imageUrl, index),
      prompt: prompt,
      image_url: imageUrl,
      is_public: true,
      likes_count: 0
    }))

    const { data, error } = await supabase
      .from('images')
      .insert(imageRecords as any)
      .select()

    if (error) {
      console.error('❌ 保存图片到数据库失败:', error.message)
      console.error('错误详情:', error)
      return
    }

    console.log(`✅ 成功保存 ${data?.length || 0} 张图片到数据库`)
    
    // 打印保存的图片信息
    data?.forEach((record: any, index: number) => {
      console.log(`📷 图片 ${index + 1}: ${record.title} (ID: ${record.id})`)
    })
    
    // 记录使用量统计
    await recordUsageStats(supabase, userId, validImages.length, prompt)
    
  } catch (err) {
    console.error('❌ 数据库操作异常:', err)
  }
}

/**
 * 记录使用量统计
 */
async function recordUsageStats(supabase: any, userId: string, imageCount: number, prompt: string) {
  try {
    const today = new Date().toISOString().split('T')[0]
    
    console.log('📊 开始记录使用量统计...')
    console.log('用户ID:', userId)
    console.log('日期:', today)
    console.log('图片数量:', imageCount)
    
    // 检查今天是否已有记录
    const { data: existingStats, error: selectError } = await supabase
      .from('usage_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single()
    
    if (selectError && selectError.code !== 'PGRST116') {
      console.error('查询现有统计记录失败:', selectError.message)
    }
    
    if (existingStats) {
      // 更新现有记录
      const { data: updateData, error: updateError } = await supabase
        .from('usage_stats')
        .update({
          images_generated: (existingStats.images_generated || 0) + imageCount,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingStats.id)
        .select()
      
      if (updateError) {
        console.error('❌ 更新使用量统计失败:', updateError.message)
      } else {
        console.log('✅ 更新使用量统计成功: +' + imageCount + ' 张图片')
      }
    } else {
      // 创建新记录
      const { data: insertData, error: insertError } = await supabase
        .from('usage_stats')
        .insert({
          user_id: userId,
          date: today,
          images_generated: imageCount
        })
        .select()
      
      if (insertError) {
        console.error('❌ 创建使用量统计失败:', insertError.message)
        console.error('错误详情:', insertError)
      } else {
        console.log('✅ 创建新的使用量统计记录成功')
        console.log('记录详情:', insertData)
      }
    }
  } catch (error) {
    console.error('⚠️ 记录使用量统计异常:', error)
  }
}

/**
 * 获取当前用户ID
 */
async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) {
    return null // 返回null而不是默认用户ID
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      console.log('👤 未登录用户，返回null')
      return null
    }
    
    console.log('👤 当前用户:', user.email)
    return user.id
  } catch (err) {
    console.warn('⚠️ 获取用户信息失败:', err)
    return null
  }
}

/**
 * 从图片URL提取标题
 */
function extractImageTitle(imageUrl: string, index: number): string {
  try {
    // 从URL中提取文件名
    const url = new URL(imageUrl)
    const pathname = url.pathname
    const filename = pathname.split('/').pop() || `image_${index + 1}`
    
    // 移除文件扩展名
    const title = filename.replace(/\.(png|jpg|jpeg|gif|webp)$/i, '')
    
    return title || `生成图片 ${index + 1}`
  } catch {
    return `生成图片 ${index + 1}`
  }
}