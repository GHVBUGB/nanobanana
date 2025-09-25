-- Supabase 数据库设置脚本
-- 请在 Supabase Dashboard 的 SQL Editor 中执行此脚本

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 创建默认用户（用于未登录用户的图片）
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'anonymous@example.com',
  crypt('anonymous', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 用户表（扩展auth.users）
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认用户记录
INSERT INTO public.users (id, email, username) 
VALUES ('00000000-0000-0000-0000-000000000000', 'anonymous@example.com', 'anonymous')
ON CONFLICT (id) DO NOTHING;

-- 图片表
CREATE TABLE IF NOT EXISTS public.images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  width INTEGER,
  height INTEGER,
  file_size INTEGER,
  model TEXT,
  style TEXT,
  quality TEXT,
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 图片点赞表
CREATE TABLE IF NOT EXISTS public.image_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, image_id)
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_images_user_id ON public.images(user_id);
CREATE INDEX IF NOT EXISTS idx_images_is_public ON public.images(is_public);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_image_likes_user_id ON public.image_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_image_likes_image_id ON public.image_likes(image_id);

-- 设置行级安全策略 (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_likes ENABLE ROW LEVEL SECURITY;

-- 删除现有策略（如果存在）
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own images" ON public.images;
DROP POLICY IF EXISTS "Users can view public images" ON public.images;
DROP POLICY IF EXISTS "Users can insert own images" ON public.images;
DROP POLICY IF EXISTS "Users can update own images" ON public.images;
DROP POLICY IF EXISTS "Users can delete own images" ON public.images;
DROP POLICY IF EXISTS "Users can view all likes" ON public.image_likes;
DROP POLICY IF EXISTS "Users can insert own likes" ON public.image_likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.image_likes;

-- 用户表策略
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id OR id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 图片表策略
CREATE POLICY "Users can view own images" ON public.images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public images" ON public.images
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can insert own images" ON public.images
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id = '00000000-0000-0000-0000-000000000000');

CREATE POLICY "Users can update own images" ON public.images
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON public.images
  FOR DELETE USING (auth.uid() = user_id);

-- 图片点赞表策略
CREATE POLICY "Users can view all likes" ON public.image_likes
  FOR SELECT USING (true);

CREATE POLICY "Users can insert own likes" ON public.image_likes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own likes" ON public.image_likes
  FOR DELETE USING (auth.uid() = user_id);

-- 创建触发器函数来更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加触发器
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_images_updated_at ON public.images;
CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON public.images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建函数来更新图片点赞数
CREATE OR REPLACE FUNCTION update_image_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.images 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.image_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.images 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.image_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- 为点赞表添加触发器
DROP TRIGGER IF EXISTS update_likes_count_trigger ON public.image_likes;
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON public.image_likes
  FOR EACH ROW EXECUTE FUNCTION update_image_likes_count();

-- 创建用户注册时自动创建用户记录的函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 创建触发器，当新用户注册时自动创建用户记录
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 验证设置
SELECT 'Supabase 数据库设置完成!' as status;
SELECT 'Tables created:' as info, count(*) as table_count 
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name IN ('users', 'images', 'image_likes');