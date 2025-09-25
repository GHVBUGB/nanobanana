const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateImagesTable() {
  console.log('🔧 更新images表结构...');
  
  try {
    // 修改user_id字段，允许NULL值
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE public.images ALTER COLUMN user_id DROP NOT NULL;'
    });
    
    if (error) {
      console.error('❌ 更新表结构失败:', error.message);
      console.error('错误详情:', error);
      
      // 尝试直接执行SQL
      console.log('🔄 尝试直接执行SQL...');
      const { data: directData, error: directError } = await supabase
        .from('images')
        .select('id')
        .limit(1);
      
      if (directError) {
        console.error('❌ 表访问失败:', directError.message);
      } else {
        console.log('✅ 表访问正常，可能需要在Supabase Dashboard中手动执行SQL');
        console.log('SQL命令: ALTER TABLE public.images ALTER COLUMN user_id DROP NOT NULL;');
      }
    } else {
      console.log('✅ 表结构更新成功');
    }
    
  } catch (error) {
    console.error('❌ 更新过程中发生异常:', error);
  }
}

updateImagesTable();