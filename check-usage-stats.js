const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkUsageStats() {
  console.log('📊 检查使用量统计...');
  
  try {
    // 检查usage_stats表
    const { data: stats, error: statsError } = await supabase
      .from('usage_stats')
      .select('*')
      .order('date', { ascending: false });
    
    if (statsError) {
      console.error('❌ 查询使用统计失败:', statsError.message);
      return;
    }
    
    console.log(`📈 使用统计记录数量: ${stats.length}`);
    
    if (stats.length > 0) {
      console.log('📋 最新统计记录:');
      stats.slice(0, 3).forEach((stat, index) => {
        console.log(`  ${index + 1}. 日期: ${stat.date}`);
        console.log(`     用户: ${stat.user_id.substring(0, 8)}...`);
        console.log(`     生成图片: ${stat.images_generated || 0} 张`);
        console.log(`     创建时间: ${stat.created_at}`);
        console.log('');
      });
    } else {
      console.log('⚠️ 没有使用统计记录');
    }
    
    // 检查图片记录
    const { data: images, error: imagesError } = await supabase
      .from('images')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(3);
    
    if (imagesError) {
      console.error('❌ 查询图片记录失败:', imagesError.message);
    } else {
      console.log(`📸 图片记录数量: ${images.length}`);
      console.log('📋 最新图片记录:');
      images.forEach((img, index) => {
        console.log(`  ${index + 1}. ${img.title} (${img.created_at})`);
      });
    }
    
  } catch (error) {
    console.error('❌ 检查过程中发生异常:', error);
  }
}

checkUsageStats();