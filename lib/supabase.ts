import { createClient } from '@supabase/supabase-js'
import { createBrowserClient, createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 验证 Supabase URL 格式
if (supabaseUrl && !supabaseUrl.startsWith('https://')) {
  throw new Error('Invalid supabaseUrl: Must be a valid HTTPS URL')
}

// Browser client for client-side operations
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Server client for server-side operations (SSR)
export const createSupabaseServerClient = (cookieStore: any) => {
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}

// Browser client for client components
export const createSupabaseBrowserClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

// Mock data for demo purposes when Supabase is not configured
export const mockData = {
  users: [
    { id: '1', email: 'demo@example.com', username: 'demo_user', created_at: new Date().toISOString() },
    { id: '2', email: 'user2@example.com', username: 'user2', created_at: new Date().toISOString() }
  ],
  images: [
    { 
      id: '1', 
      user_id: '1', 
      prompt: '美丽的风景画', 
      image_url: '/placeholder.jpg', 
      likes_count: 15,
      created_at: new Date().toISOString() 
    },
    { 
      id: '2', 
      user_id: '2', 
      prompt: '可爱的小猫', 
      image_url: '/placeholder.jpg', 
      likes_count: 8,
      created_at: new Date().toISOString() 
    }
  ],
  stats: {
    totalImages: 156,
    totalUsers: 42,
    totalCost: 89.50,
    dailyImages: 23,
    weeklyImages: 87,
    monthlyImages: 234
  }
}

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          website: string | null
          location: string | null
          followers_count: number
          following_count: number
          images_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          followers_count?: number
          following_count?: number
          images_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          website?: string | null
          location?: string | null
          followers_count?: number
          following_count?: number
          images_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      images: {
        Row: {
          id: string
          user_id: string
          title: string
          prompt: string
          image_url: string
          thumbnail_url: string | null
          width: number | null
          height: number | null
          file_size: number | null
          model: string | null
          style: string | null
          quality: string | null
          is_public: boolean
          likes_count: number
          comments_count: number
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          prompt: string
          image_url: string
          thumbnail_url?: string | null
          width?: number | null
          height?: number | null
          file_size?: number | null
          model?: string | null
          style?: string | null
          quality?: string | null
          is_public?: boolean
          likes_count?: number
          comments_count?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          prompt?: string
          image_url?: string
          thumbnail_url?: string | null
          width?: number | null
          height?: number | null
          file_size?: number | null
          model?: string | null
          style?: string | null
          quality?: string | null
          is_public?: boolean
          likes_count?: number
          comments_count?: number
          views_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      image_likes: {
        Row: {
          id: string
          user_id: string
          image_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_id?: string
          created_at?: string
        }
      }
      image_bookmarks: {
        Row: {
          id: string
          user_id: string
          image_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_id?: string
          created_at?: string
        }
      }
      image_comments: {
        Row: {
          id: string
          user_id: string
          image_id: string
          content: string
          likes_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_id: string
          content: string
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_id?: string
          content?: string
          likes_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comment_likes: {
        Row: {
          id: string
          user_id: string
          comment_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          comment_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          comment_id?: string
          created_at?: string
        }
      }
      tags: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string | null
          created_at?: string
        }
      }
      image_tags: {
        Row: {
          id: string
          image_id: string
          tag_id: string
          created_at: string
        }
        Insert: {
          id?: string
          image_id: string
          tag_id: string
          created_at?: string
        }
        Update: {
          id?: string
          image_id?: string
          tag_id?: string
          created_at?: string
        }
      }
      user_follows: {
        Row: {
          id: string
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          id?: string
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          id?: string
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      image_views: {
        Row: {
          id: string
          image_id: string
          user_id: string | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          image_id: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          image_id?: string
          user_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
  }
}