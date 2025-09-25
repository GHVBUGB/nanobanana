'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useAuth } from '@/components/auth/auth-provider'
import { supabase } from '@/lib/supabase'

interface ImageUploadProps {
  onUploadComplete?: (imageUrl: string, imageId: string) => void
  onUploadError?: (error: string) => void
  maxFiles?: number
  maxSize?: number // in MB
}

interface UploadingFile {
  file: File
  progress: number
  id: string
  error?: string
}

export function ImageUpload({ 
  onUploadComplete, 
  onUploadError, 
  maxFiles = 5, 
  maxSize = 10 
}: ImageUploadProps) {
  const { user } = useAuth()
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user) {
      onUploadError?.('请先登录后再上传图片')
      return
    }

    // Filter files by size
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        onUploadError?.(`文件 ${file.name} 超过 ${maxSize}MB 限制`)
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    // Limit number of files
    const filesToUpload = validFiles.slice(0, maxFiles)
    
    setIsUploading(true)
    
    // Initialize uploading files state
    const initialUploadingFiles = filesToUpload.map(file => ({
      file,
      progress: 0,
      id: Math.random().toString(36).substr(2, 9)
    }))
    
    setUploadingFiles(initialUploadingFiles)

    // Upload files one by one
    for (let i = 0; i < filesToUpload.length; i++) {
      const file = filesToUpload[i]
      const uploadingFile = initialUploadingFiles[i]
      
      try {
        await uploadFile(file, uploadingFile.id)
      } catch (error) {
        console.error('Upload error:', error)
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === uploadingFile.id 
              ? { ...f, error: '上传失败' }
              : f
          )
        )
        onUploadError?.(`文件 ${file.name} 上传失败`)
      }
    }

    setIsUploading(false)
  }, [user, maxFiles, maxSize, onUploadError])

  const uploadFile = async (file: File, fileId: string) => {
    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${user!.id}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`

    // Update progress to show upload starting
    setUploadingFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, progress: 10 } : f)
    )

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      throw uploadError
    }

    // Update progress
    setUploadingFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, progress: 50 } : f)
    )

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    // Update progress
    setUploadingFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, progress: 80 } : f)
    )

    // Save image record to database
    const { data: imageData, error: dbError } = await supabase
      .from('images')
      .insert({
        user_id: user!.id,
        prompt: `上传的图片 - ${file.name}`,
        image_url: publicUrl,
        thumbnail_url: publicUrl
      })
      .select()
      .single()

    if (dbError) {
      // If database insert fails, try to delete the uploaded file
      await supabase.storage.from('images').remove([fileName])
      throw dbError
    }

    // Update progress to complete
    setUploadingFiles(prev => 
      prev.map(f => f.id === fileId ? { ...f, progress: 100 } : f)
    )

    // Call success callback
    onUploadComplete?.(publicUrl, imageData.id)

    // Remove from uploading files after a delay
    setTimeout(() => {
      setUploadingFiles(prev => prev.filter(f => f.id !== fileId))
    }, 2000)
  }

  const removeUploadingFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles,
    disabled: isUploading
  })

  return (
    <div className="space-y-4">
      <Card 
        {...getRootProps()} 
        className={`
          border-2 border-dashed p-8 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 bg-gray-100 rounded-full">
            <Upload className="w-8 h-8 text-gray-600" />
          </div>
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isDragActive ? '放下文件以上传' : '拖拽图片到这里或点击选择'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              支持 JPEG、PNG、GIF、WebP 格式，最大 {maxSize}MB，最多 {maxFiles} 个文件
            </p>
          </div>
          <Button variant="outline" disabled={isUploading}>
            <ImageIcon className="w-4 h-4 mr-2" />
            选择图片
          </Button>
        </div>
      </Card>

      {/* Uploading Files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-900">上传进度</h3>
          {uploadingFiles.map((uploadingFile) => (
            <Card key={uploadingFile.id} className="p-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {uploadingFile.file.name}
                  </p>
                  <div className="mt-2">
                    <Progress value={uploadingFile.progress} className="h-2" />
                  </div>
                  {uploadingFile.error && (
                    <p className="text-xs text-red-600 mt-1">{uploadingFile.error}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeUploadingFile(uploadingFile.id)}
                  className="flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}