const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createDefaultUser() {
  console.log('🔧 创建默认用户...');
  
  const defaultUserId = '00000000-0000-0000-0000-000000000000';
  const defaultEmail = 'default@example.com';
  
  try {
    // 检查默认用户是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', defaultUserId)
      .single();
    
    if (existingUser) {
      console.log('✅ 默认用户已存在');
      return;
    }
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ 检查用户失败:', checkError.message);
      return;
    }
    
    // 创建默认用户
    const { data, error } = await supabase
      .from('users')
      .insert([{
        id: defaultUserId,
        email: defaultEmail,
        username: 'default_user',
        avatar_url: null
      }])
      .select();
    
    if (error) {
      console.error('❌ 创建默认用户失败:', error.message);
      console.error('错误详情:', error);
    } else {
      console.log('✅ 默认用户创建成功:', data);
    }
    
  } catch (error) {
    console.error('❌ 创建默认用户过程中发生异常:', error);
  }
}

createDefaultUser();