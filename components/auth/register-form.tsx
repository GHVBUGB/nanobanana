'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff, Loader2, CheckCircle } from 'lucide-react'
import { useAuth } from './auth-provider'

interface RegisterFormProps {
  onToggleForm: () => void
}

export function RegisterForm({ onToggleForm }: RegisterFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const { signUp, authLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email || !password || !confirmPassword) {
      setError('请填写所有必填字段')
      return
    }

    if (password !== confirmPassword) {
      setError('密码不匹配')
      return
    }

    if (password.length < 6) {
      setError('密码至少需要6个字符')
      return
    }

    const { error } = await signUp(email, password, username)
    
    if (error) {
      setError(error.message || '注册失败，请重试')
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-gray-900">注册成功！</h3>
              <p className="text-gray-600 text-sm">
                请检查您的邮箱并点击验证链接来激活您的账户。
              </p>
            </div>
            <Button 
              onClick={onToggleForm}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            >
              返回登录
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          创建账户
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          注册新账户开始使用AI图像平台
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="用户名（可选）"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={authLoading}
              className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
            />
          </div>

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
                placeholder="密码（至少6个字符）"
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

          <div className="space-y-2">
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="确认密码"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={authLoading}
                className="h-11 pr-10 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={authLoading}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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
                注册中...
              </>
            ) : (
              '创建账户'
            )}
          </Button>
        </form>

        <div className="text-center">
          <button
            onClick={onToggleForm}
            disabled={authLoading}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors disabled:opacity-50"
          >
            已有账户？立即登录
          </button>
        </div>
      </CardContent>
    </Card>
  )
}