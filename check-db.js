const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkImages() {
  try {
    const { data, error } = await supabase
      .from('images')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) throw error;
    
    console.log('数据库中的图片记录数量:', data.length);
    if (data.length > 0) {
      console.log('最新的图片记录:');
      data.forEach((img, index) => {
        console.log(`${index + 1}. ID: ${img.id}, URL: ${img.image_url}, 提示词: ${img.prompt}, 创建时间: ${img.created_at}`);
      });
    } else {
      console.log('数据库中没有图片记录');
    }
  } catch (error) {
    console.error('查询失败:', error.message);
  }
}

checkImages();