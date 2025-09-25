'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { useAuth } from './auth-provider'

interface LoginFormProps {
  onToggleForm: () => void
}

export function LoginForm({ onToggleForm }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const { signIn, authLoading } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('请填写所有字段')
      return
    }

    const { error } = await signIn(email, password)
    
    if (error) {
      setError(error.message || '登录失败，请检查您的凭据')
    } else {
      router.push('/')
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          欢迎回来
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          登录您的账户以继续使用AI图像平台
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="邮箱地址"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={authLoading}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>
          
          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={authLoading}
                className="h-11 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                disabled={authLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
            disabled={authLoading}
          >
            {authLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                登录中...
              </>
            ) : (
              '登录'
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={onToggleForm}
            disabled={authLoading}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
          >
            还没有账户？立即注册
          </button>
        </div>
      </CardContent>
    </Card>
  )
}