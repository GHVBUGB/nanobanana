require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Creating Supabase admin client...');
const supabase = createClient(supabaseUrl, serviceRoleKey);

const createImagesTable = `
CREATE TABLE IF NOT EXISTS public.images (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT,
    prompt TEXT NOT NULL,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    model_used TEXT,
    generation_params JSONB,
    is_public BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    downloads_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

async function createTables() {
  try {
    console.log('Creating images table...');
    
    // 直接执行SQL
    const { data, error } = await supabase
      .from('_sql')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('Using alternative method to create table...');
      // 尝试使用插入操作来测试连接
      const testResult = await supabase
        .from('images')
        .select('count')
        .limit(1);
      
      if (testResult.error && testResult.error.code === 'PGRST205') {
        console.log('Table does not exist. Please create it manually in Supabase dashboard.');
        console.log('SQL to execute:');
        console.log(createImagesTable);
      } else {
        console.log('Table already exists or connection successful');
      }
    }
    
  } catch (err) {
    console.error('Error:', err);
  }
}

createTables();