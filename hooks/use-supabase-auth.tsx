'use client'

import { createContext, useContext, useEffect, useState } from 'react'

// 模拟用户类型
export interface User {
  id: string
  email: string
  name?: string
  avatar?: string
}

// 认证上下文类型
interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// 认证提供者组件
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟检查用户登录状态
    const checkUser = async () => {
      try {
        // 从localStorage检查是否有保存的用户信息
        const savedUser = localStorage.getItem('user')
        if (savedUser) {
          setUser(JSON.parse(savedUser))
        }
      } catch (error) {
        console.error('检查用户状态失败:', error)
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      // 模拟登录逻辑
      const mockUser: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      }
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
    } catch (error) {
      console.error('登录失败:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string) => {
    setLoading(true)
    try {
      // 模拟注册逻辑
      const mockUser: User = {
        id: Date.now().toString(),
        email,
        name: email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      }
      setUser(mockUser)
      localStorage.setItem('user', JSON.stringify(mockUser))
    } catch (error) {
      console.error('注册失败:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      setUser(null)
      localStorage.removeItem('user')
    } catch (error) {
      console.error('登出失败:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

// 使用认证的hook
export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within an AuthProvider')
  }
  return context
}

// 默认导出
export default useSupabaseAuth