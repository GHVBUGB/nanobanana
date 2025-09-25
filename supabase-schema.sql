-- AI图片平台 Supabase 数据库表结构

-- 启用必要的扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 用户资料表 (扩展 auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 图片表
CREATE TABLE public.images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
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

-- 图片点赞表
CREATE TABLE public.image_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, image_id)
);

-- 图片收藏表
CREATE TABLE public.image_bookmarks (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, image_id)
);

-- 图片评论表
CREATE TABLE public.image_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
    parent_id UUID REFERENCES public.image_comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 评论点赞表
CREATE TABLE public.comment_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    comment_id UUID REFERENCES public.image_comments(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- 图片标签表
CREATE TABLE public.tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 图片标签关联表
CREATE TABLE public.image_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
    tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(image_id, tag_id)
);

-- 用户关注表
CREATE TABLE public.user_follows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- 图片浏览历史表
CREATE TABLE public.image_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    image_id UUID REFERENCES public.images(id) ON DELETE CASCADE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX idx_images_user_id ON public.images(user_id);
CREATE INDEX idx_images_created_at ON public.images(created_at DESC);
CREATE INDEX idx_images_likes_count ON public.images(likes_count DESC);
CREATE INDEX idx_images_is_public ON public.images(is_public);
CREATE INDEX idx_images_is_featured ON public.images(is_featured);

CREATE INDEX idx_image_likes_user_id ON public.image_likes(user_id);
CREATE INDEX idx_image_likes_image_id ON public.image_likes(image_id);

CREATE INDEX idx_image_bookmarks_user_id ON public.image_bookmarks(user_id);
CREATE INDEX idx_image_bookmarks_image_id ON public.image_bookmarks(image_id);

CREATE INDEX idx_image_comments_image_id ON public.image_comments(image_id);
CREATE INDEX idx_image_comments_user_id ON public.image_comments(user_id);
CREATE INDEX idx_image_comments_parent_id ON public.image_comments(parent_id);

CREATE INDEX idx_image_tags_image_id ON public.image_tags(image_id);
CREATE INDEX idx_image_tags_tag_id ON public.image_tags(tag_id);

CREATE INDEX idx_user_follows_follower_id ON public.user_follows(follower_id);
CREATE INDEX idx_user_follows_following_id ON public.user_follows(following_id);

CREATE INDEX idx_image_views_image_id ON public.image_views(image_id);
CREATE INDEX idx_image_views_user_id ON public.image_views(user_id);

-- 创建触发器函数来更新 updated_at 字段
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表添加 updated_at 触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_images_updated_at BEFORE UPDATE ON public.images
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_image_comments_updated_at BEFORE UPDATE ON public.image_comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 创建触发器函数来更新计数器
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

CREATE OR REPLACE FUNCTION update_image_comments_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.images 
        SET comments_count = comments_count + 1 
        WHERE id = NEW.image_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.images 
        SET comments_count = comments_count - 1 
        WHERE id = OLD.image_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE public.image_comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE public.image_comments 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- 创建计数器触发器
CREATE TRIGGER trigger_update_image_likes_count
    AFTER INSERT OR DELETE ON public.image_likes
    FOR EACH ROW EXECUTE FUNCTION update_image_likes_count();

CREATE TRIGGER trigger_update_image_comments_count
    AFTER INSERT OR DELETE ON public.image_comments
    FOR EACH ROW EXECUTE FUNCTION update_image_comments_count();

CREATE TRIGGER trigger_update_comment_likes_count
    AFTER INSERT OR DELETE ON public.comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();

-- 创建 RLS (Row Level Security) 策略
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_views ENABLE ROW LEVEL SECURITY;

-- Profiles 策略
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Images 策略
CREATE POLICY "Public images are viewable by everyone" ON public.images
    FOR SELECT USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can insert their own images" ON public.images
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own images" ON public.images
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own images" ON public.images
    FOR DELETE USING (auth.uid() = user_id);

-- Image likes 策略
CREATE POLICY "Image likes are viewable by everyone" ON public.image_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like images" ON public.image_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own likes" ON public.image_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Image bookmarks 策略
CREATE POLICY "Users can view their own bookmarks" ON public.image_bookmarks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can bookmark images" ON public.image_bookmarks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own bookmarks" ON public.image_bookmarks
    FOR DELETE USING (auth.uid() = user_id);

-- Image comments 策略
CREATE POLICY "Comments are viewable by everyone" ON public.image_comments
    FOR SELECT USING (true);

CREATE POLICY "Users can insert comments" ON public.image_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON public.image_comments
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON public.image_comments
    FOR DELETE USING (auth.uid() = user_id);

-- Comment likes 策略
CREATE POLICY "Comment likes are viewable by everyone" ON public.comment_likes
    FOR SELECT USING (true);

CREATE POLICY "Users can like comments" ON public.comment_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike their own comment likes" ON public.comment_likes
    FOR DELETE USING (auth.uid() = user_id);

-- Tags 策略
CREATE POLICY "Tags are viewable by everyone" ON public.tags
    FOR SELECT USING (true);

-- Image tags 策略
CREATE POLICY "Image tags are viewable by everyone" ON public.image_tags
    FOR SELECT USING (true);

-- User follows 策略
CREATE POLICY "Follows are viewable by everyone" ON public.user_follows
    FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON public.user_follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can unfollow others" ON public.user_follows
    FOR DELETE USING (auth.uid() = follower_id);

-- Image views 策略
CREATE POLICY "Users can view image views" ON public.image_views
    FOR SELECT USING (true);

CREATE POLICY "Anyone can insert image views" ON public.image_views
    FOR INSERT WITH CHECK (true);

-- 创建一些默认标签
INSERT INTO public.tags (name, description, color) VALUES
    ('风景', '自然风景和户外场景', '#10B981'),
    ('人物', '人物肖像和角色', '#F59E0B'),
    ('动物', '各种动物和宠物', '#EF4444'),
    ('建筑', '建筑物和城市景观', '#6366F1'),
    ('抽象', '抽象艺术和概念', '#8B5CF6'),
    ('科幻', '科幻和未来主义', '#06B6D4'),
    ('幻想', '奇幻和魔法主题', '#EC4899'),
    ('艺术', '艺术作品和创意', '#F97316');

-- 创建用户资料触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', '')
    );
    RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- 创建新用户时自动创建资料的触发器
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();