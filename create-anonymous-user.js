const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createAnonymousUser() {
  console.log('🔧 创建匿名用户记录...');
  
  const anonymousUserId = '00000000-0000-0000-0000-000000000000';
  
  try {
    // 首先在 auth.users 表中创建匿名用户
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      user_id: anonymousUserId,
      email: 'anonymous@ai-image-platform.local',
      email_confirm: true,
      user_metadata: {
        username: 'anonymous',
        full_name: '匿名用户'
      }
    });

    if (authError && !authError.message.includes('already exists')) {
      console.error('❌ 创建auth用户失败:', authError.message);
      return;
    }

    if (authUser) {
      console.log('✅ Auth用户创建成功');
    } else {
      console.log('ℹ️ Auth用户可能已存在');
    }

    // 检查 users 表中是否已存在匿名用户
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', anonymousUserId)
      .single();
    
    if (existingUser) {
      console.log('✅ 匿名用户记录已存在');
      return;
    }
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ 检查用户失败:', checkError.message);
    }
    
    // 在 users 表中创建匿名用户记录
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: anonymousUserId,
        email: 'anonymous@ai-image-platform.local',
        username: 'anonymous',
        avatar_url: null
      }])
      .select();
    
    if (error) {
      console.error('❌ 创建匿名用户记录失败:', error.message);
      console.error('错误详情:', error);
    } else {
      console.log('✅ 匿名用户记录创建成功:', data);
    }
    
  } catch (error) {
    console.error('❌ 创建过程中发生异常:', error);
  }
}

createAnonymousUser();