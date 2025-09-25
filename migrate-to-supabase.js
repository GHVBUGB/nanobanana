const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Supabase 配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少 Supabase 配置信息');
  console.log('请确保 .env.local 文件中包含:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL');
  console.log('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSupabaseConnection() {
  console.log('🔍 检查 Supabase 连接...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase 连接失败:', error.message);
      return false;
    }
    
    console.log('✅ Supabase 连接成功');
    return true;
  } catch (err) {
    console.error('❌ Supabase 连接异常:', err.message);
    return false;
  }
}

async function createTables() {
  console.log('🏗️ 创建数据库表结构...');
  
  // 检查表是否存在
  const { data: tables, error: tablesError } = await supabase
    .rpc('get_table_names');
  
  if (tablesError) {
    console.log('📝 执行 SQL 脚本创建表结构...');
    
    // 读取并执行 schema.sql
    const fs = require('fs');
    const path = require('path');
    
    try {
      const schemaPath = path.join(__dirname, 'supabase', 'schema.sql');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      
      console.log('📄 读取 schema.sql 文件成功');
      console.log('⚠️ 注意: 需要在 Supabase Dashboard 的 SQL Editor 中手动执行 schema.sql');
      console.log('🔗 访问: https://supabase.com/dashboard/project/' + supabaseUrl.split('//')[1].split('.')[0] + '/sql');
      
      return true;
    } catch (err) {
      console.error('❌ 读取 schema.sql 失败:', err.message);
      return false;
    }
  }
  
  console.log('✅ 数据库表结构已存在');
  return true;
}

async function migrateExistingData() {
  console.log('📦 迁移现有数据...');
  
  // 检查是否有现有的图片数据需要迁移
  const fs = require('fs');
  const path = require('path');
  
  // 检查 .tasks 目录中的任务文件
  const tasksDir = path.join(__dirname, '.tasks');
  
  if (!fs.existsSync(tasksDir)) {
    console.log('📁 未找到 .tasks 目录，跳过数据迁移');
    return true;
  }
  
  const taskFiles = fs.readdirSync(tasksDir).filter(file => file.endsWith('.json'));
  console.log(`📋 找到 ${taskFiles.length} 个任务文件`);
  
  let migratedCount = 0;
  
  for (const file of taskFiles) {
    try {
      const taskPath = path.join(tasksDir, file);
      const taskData = JSON.parse(fs.readFileSync(taskPath, 'utf8'));
      
      if (taskData.status === 'completed' && taskData.result && taskData.result.images) {
        const images = taskData.result.images.filter(img => 
          img && !img.includes('placeholder') && img.startsWith('http')
        );
        
        if (images.length > 0) {
          console.log(`📸 迁移任务 ${file} 中的 ${images.length} 张图片`);
          
          // 创建一个默认用户（如果不存在）
          const defaultUserId = '00000000-0000-0000-0000-000000000000';
          
          for (const imageUrl of images) {
            const { error } = await supabase
              .from('images')
              .insert({
                user_id: defaultUserId,
                title: `生成图片 - ${taskData.result.taskId}`,
                prompt: taskData.result.usedPrompt || '未知提示词',
                image_url: imageUrl,
                is_public: true
              });
            
            if (error && !error.message.includes('duplicate')) {
              console.warn(`⚠️ 插入图片失败: ${error.message}`);
            } else {
              migratedCount++;
            }
          }
        }
      }
    } catch (err) {
      console.warn(`⚠️ 处理任务文件 ${file} 失败: ${err.message}`);
    }
  }
  
  console.log(`✅ 成功迁移 ${migratedCount} 张图片到 Supabase`);
  return true;
}

async function updateSaveImageFunction() {
  console.log('🔧 更新图片保存函数...');
  
  // 修改 save-generated-images.ts 以使用 Supabase
  const fs = require('fs');
  const path = require('path');
  
  const saveImagePath = path.join(__dirname, 'lib', 'save-generated-images.ts');
  
  if (fs.existsSync(saveImagePath)) {
    let content = fs.readFileSync(saveImagePath, 'utf8');
    
    // 检查是否已经更新过
    if (content.includes('supabase')) {
      console.log('✅ 图片保存函数已配置为使用 Supabase');
      return true;
    }
    
    console.log('📝 需要手动更新 lib/save-generated-images.ts 以使用 Supabase');
    console.log('💡 建议: 修改 saveGeneratedImages 函数使用 Supabase 客户端');
  }
  
  return true;
}

async function main() {
  console.log('🚀 开始 Supabase 数据库迁移...');
  console.log('=' .repeat(50));
  
  // 1. 检查连接
  const connected = await checkSupabaseConnection();
  if (!connected) {
    process.exit(1);
  }
  
  // 2. 创建表结构
  const tablesCreated = await createTables();
  if (!tablesCreated) {
    process.exit(1);
  }
  
  // 3. 迁移现有数据
  const dataMigrated = await migrateExistingData();
  if (!dataMigrated) {
    process.exit(1);
  }
  
  // 4. 更新代码
  const codeUpdated = await updateSaveImageFunction();
  if (!codeUpdated) {
    process.exit(1);
  }
  
  console.log('=' .repeat(50));
  console.log('✅ Supabase 数据库迁移完成!');
  console.log('');
  console.log('📋 后续步骤:');
  console.log('1. 在 Supabase Dashboard 中执行 supabase/schema.sql');
  console.log('2. 验证数据库表结构是否正确');
  console.log('3. 测试图片生成和保存功能');
  console.log('4. 更新前端代码以使用 Supabase 数据');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  checkSupabaseConnection,
  createTables,
  migrateExistingData
};