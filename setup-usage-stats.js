const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function setupUsageStats() {
  console.log('🔧 设置使用量统计功能...');
  
  try {
    // 1. 检查usage_stats表是否存在
    console.log('📊 检查usage_stats表...');
    const { data: tables, error: tablesError } = await supabase
      .from('usage_stats')
      .select('*')
      .limit(1);
    
    if (tablesError && tablesError.code === 'PGRST116') {
      console.log('❌ usage_stats表不存在，需要创建');
      
      // 创建usage_stats表的SQL
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS public.usage_stats (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
          date DATE NOT NULL,
          images_generated INTEGER DEFAULT 0,
          api_calls INTEGER DEFAULT 0,
          tokens_used INTEGER DEFAULT 0,
          cost_usd DECIMAL(10,4) DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(user_id, date)
        );
        
        -- 创建索引
        CREATE INDEX IF NOT EXISTS idx_usage_stats_user_date ON public.usage_stats(user_id, date);
        CREATE INDEX IF NOT EXISTS idx_usage_stats_date ON public.usage_stats(date);
        
        -- 启用RLS
        ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;
        
        -- 创建RLS策略
        CREATE POLICY "Users can view own usage stats" ON public.usage_stats
          FOR SELECT USING (auth.uid() = user_id);
        
        CREATE POLICY "Users can insert own usage stats" ON public.usage_stats
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        
        CREATE POLICY "Users can update own usage stats" ON public.usage_stats
          FOR UPDATE USING (auth.uid() = user_id);
      `;
      
      console.log('🔨 创建usage_stats表...');
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: createTableSQL
      });
      
      if (createError) {
        console.error('❌ 创建表失败:', createError.message);
        console.log('💡 请在Supabase Dashboard中手动执行以下SQL:');
        console.log(createTableSQL);
      } else {
        console.log('✅ usage_stats表创建成功');
      }
    } else {
      console.log('✅ usage_stats表已存在');
    }
    
    // 2. 设置用户注册触发器
    console.log('🔧 设置用户注册触发器...');
    
    const triggerSQL = `
      -- 创建或替换用户注册触发器函数
      CREATE OR REPLACE FUNCTION public.handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
        -- 在users表中创建用户记录
        INSERT INTO public.users (id, email, username, avatar_url)
        VALUES (
          NEW.id,
          NEW.email,
          COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
          NEW.raw_user_meta_data->>'avatar_url'
        )
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          username = COALESCE(EXCLUDED.username, users.username),
          avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
          updated_at = NOW();
        
        RETURN NEW;
      END;
      $$ language 'plpgsql' SECURITY DEFINER;
      
      -- 删除现有触发器（如果存在）
      DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
      
      -- 创建新的触发器
      CREATE TRIGGER on_auth_user_created
        AFTER INSERT ON auth.users
        FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
    `;
    
    const { error: triggerError } = await supabase.rpc('exec_sql', {
      sql: triggerSQL
    });
    
    if (triggerError) {
      console.error('❌ 设置触发器失败:', triggerError.message);
      console.log('💡 请在Supabase Dashboard中手动执行触发器SQL');
    } else {
      console.log('✅ 用户注册触发器设置成功');
    }
    
    // 3. 测试使用量统计功能
    console.log('🧪 测试使用量统计功能...');
    
    const testUserId = 'beeb74bd-9680-47e9-8ea2-6553f3ca3a26'; // 匿名用户ID
    const today = new Date().toISOString().split('T')[0];
    
    // 尝试插入测试统计记录
    const { data: statsData, error: statsError } = await supabase
      .from('usage_stats')
      .upsert({
        user_id: testUserId,
        date: today,
        images_generated: 1,
        api_calls: 1,
        tokens_used: 50
      }, {
        onConflict: 'user_id,date'
      })
      .select();
    
    if (statsError) {
      console.error('❌ 测试统计记录失败:', statsError.message);
    } else {
      console.log('✅ 使用量统计功能正常:', statsData);
    }
    
    // 4. 验证完整功能
    console.log('🔍 验证当前状态...');
    
    const [usersResult, imagesResult, statsResult] = await Promise.all([
      supabase.from('users').select('id, email, username').limit(5),
      supabase.from('images').select('id, title, created_at').limit(5),
      supabase.from('usage_stats').select('*').limit(5)
    ]);
    
    console.log('👥 用户数量:', usersResult.data?.length || 0);
    console.log('📸 图片数量:', imagesResult.data?.length || 0);
    console.log('📊 统计记录数量:', statsResult.data?.length || 0);
    
    if (statsResult.data && statsResult.data.length > 0) {
      console.log('📈 最新统计:', statsResult.data[0]);
    }
    
    console.log('🎉 使用量统计功能设置完成！');
    
  } catch (error) {
    console.error('❌ 设置过程中发生异常:', error);
  }
}

setupUsageStats();