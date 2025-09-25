const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function fixUserProfiles() {
  console.log('🔧 修复用户资料表...');
  
  try {
    // 1. 获取所有auth用户
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ 获取auth用户失败:', authError.message);
      return;
    }
    
    console.log(`📊 找到 ${authUsers.users.length} 个auth用户`);
    
    // 2. 获取现有的users表记录
    const { data: existingUsers, error: usersError } = await supabase
      .from('users')
      .select('id, email, username');
    
    if (usersError) {
      console.error('❌ 获取users表记录失败:', usersError.message);
      return;
    }
    
    console.log(`📊 users表中有 ${existingUsers.length} 条记录`);
    
    // 3. 找出缺失的用户记录
    const existingUserIds = new Set(existingUsers.map(u => u.id));
    const missingUsers = authUsers.users.filter(u => !existingUserIds.has(u.id));
    
    console.log(`🔍 发现 ${missingUsers.length} 个缺失的用户记录`);
    
    // 4. 为缺失的用户创建记录
    for (const user of missingUsers) {
      const username = user.user_metadata?.username || user.email?.split('@')[0] || 'user';
      
      console.log(`➕ 为用户 ${user.email} 创建记录...`);
      
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          username: username,
          avatar_url: user.user_metadata?.avatar_url || null
        });
      
      if (insertError) {
        console.error(`❌ 创建用户记录失败 (${user.email}):`, insertError.message);
      } else {
        console.log(`✅ 成功创建用户记录: ${user.email}`);
      }
    }
    
    // 5. 验证结果
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('id, email, username');
    
    if (finalError) {
      console.error('❌ 验证失败:', finalError.message);
    } else {
      console.log(`🎉 修复完成！users表现在有 ${finalUsers.length} 条记录`);
      console.log('📋 用户列表:');
      finalUsers.forEach(u => {
        console.log(`   - ${u.email} (${u.username})`);
      });
    }
    
  } catch (error) {
    console.error('❌ 修复过程中发生异常:', error);
  }
}

fixUserProfiles();