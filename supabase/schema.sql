-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户表（扩展auth.users）
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 图片表
CREATE TABLE public.images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 使用统计表
CREATE TABLE public.usage_stats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  images_generated INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  cost DECIMAL(10,4) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- 图片点赞表
CREATE TABLE public.image_likes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, image_id)
);

-- 创建索引
CREATE INDEX idx_images_user_id ON public.images(user_id);
CREATE INDEX idx_images_is_public ON public.images(is_public);
CREATE INDEX idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX idx_usage_stats_user_id ON public.usage_stats(user_id);
CREATE INDEX idx_usage_stats_date ON public.usage_stats(date);
CREATE INDEX idx_image_likes_user_id ON public.image_likes(user_id);
CREATE INDEX idx_image_likes_image_id ON public.image_likes(image_id);

-- 设置行级安全策略 (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_likes ENABLE ROW LEVEL SECURITY;

-- 用户表策略
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

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
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own images" ON public.images
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own images" ON public.images
  FOR DELETE USING (auth.uid() = user_id);

-- 使用统计表策略
CREATE POLICY "Users can view own usage stats" ON public.usage_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage stats" ON public.usage_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage stats" ON public.usage_stats
  FOR UPDATE USING (auth.uid() = user_id);

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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

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
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON public.image_likes
  FOR EACH ROW EXECUTE FUNCTION update_image_likes_count();

-- 创建用户注册时自动创建用户记录的函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 创建触发器，当新用户注册时自动创建用户记录
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();