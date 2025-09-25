'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from './auth-provider'
import { User, LogOut, BarChart3, Settings, Image, Upload } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function UserMenu() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleAuthClick = (mode: 'login' | 'register') => {
    // 直接跳转到认证页面
    router.push('/auth')
  }

  if (!user) {
    return (
      <>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => handleAuthClick('login')}
          >
            登录
          </Button>
          <Button
            onClick={() => handleAuthClick('register')}
          >
            注册
          </Button>
        </div>
      </>
    )
  }

  const userInitials = user.user_metadata?.username?.charAt(0)?.toUpperCase() || 
                      user.email?.charAt(0)?.toUpperCase() || 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url} alt="用户头像" />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.user_metadata?.username || '用户'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>个人资料</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Image className="mr-2 h-4 w-4" />
          <span>我的作品</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/upload')}>
          <Upload className="mr-2 h-4 w-4" />
          <span>图片上传</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          <BarChart3 className="mr-2 h-4 w-4" />
          <span>数据统计</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>设置</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}