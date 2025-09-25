/**
 * 文件名处理工具函数
 * 用于处理包含中文字符和特殊字符的文件名，确保在 Next.js 静态文件服务中正常工作
 */

import { createHash } from 'crypto'

/**
 * 清理文件名，将中文字符和特殊字符转换为安全的ASCII字符
 * @param filename 原始文件名
 * @returns 清理后的安全文件名
 */
export function sanitizeFilename(filename: string): string {
  // 提取文件扩展名
  const lastDotIndex = filename.lastIndexOf('.')
  const name = lastDotIndex > 0 ? filename.substring(0, lastDotIndex) : filename
  const extension = lastDotIndex > 0 ? filename.substring(lastDotIndex) : ''
  
  // 清理文件名主体
  let cleanName = name
    // 移除或替换特殊字符
    .replace(/[<>:"/\\|?*]/g, '-')  // 替换文件系统不允许的字符
    .replace(/[\s]+/g, '-')         // 将空格替换为连字符
    .replace(/[，。！？；：""''（）【】]/g, '-')  // 替换中文标点
    .replace(/-+/g, '-')            // 合并多个连字符
    .replace(/^-|-$/g, '')          // 移除开头和结尾的连字符
  
  // 如果包含中文字符，使用拼音转换或哈希
  if (/[\u4e00-\u9fff]/.test(cleanName)) {
    // 为了简单起见，我们使用哈希值 + 时间戳来确保唯一性
    const hash = createHash('md5').update(name).digest('hex').substring(0, 8)
    const timestamp = Date.now().toString().slice(-6)
    cleanName = `img-${hash}-${timestamp}`
  }
  
  // 确保文件名不为空
  if (!cleanName) {
    const timestamp = Date.now().toString()
    cleanName = `file-${timestamp}`
  }
  
  // 限制文件名长度
  if (cleanName.length > 100) {
    const hash = createHash('md5').update(cleanName).digest('hex').substring(0, 8)
    cleanName = `${cleanName.substring(0, 80)}-${hash}`
  }
  
  return cleanName + extension
}

/**
 * 生成唯一的文件名
 * @param originalFilename 原始文件名
 * @param prefix 可选的前缀
 * @returns 唯一的安全文件名
 */
export function generateUniqueFilename(originalFilename: string, prefix?: string): string {
  const sanitized = sanitizeFilename(originalFilename)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  
  // 提取扩展名
  const lastDotIndex = sanitized.lastIndexOf('.')
  const name = lastDotIndex > 0 ? sanitized.substring(0, lastDotIndex) : sanitized
  const extension = lastDotIndex > 0 ? sanitized.substring(lastDotIndex) : ''
  
  const prefixPart = prefix ? `${prefix}-` : ''
  return `${prefixPart}${name}-${timestamp}-${random}${extension}`
}

/**
 * 检查文件名是否包含不安全字符
 * @param filename 文件名
 * @returns 是否包含不安全字符
 */
export function hasUnsafeCharacters(filename: string): boolean {
  // 检查是否包含中文字符、特殊字符或空格
  return /[\u4e00-\u9fff\s<>:"/\\|?*，。！？；：""''（）【】]/.test(filename)
}

/**
 * 从URL路径中提取文件名并清理
 * @param url 图片URL
 * @returns 清理后的文件名
 */
export function extractAndSanitizeFilename(url: string): string {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop() || 'image.jpg'
    return sanitizeFilename(decodeURIComponent(filename))
  } catch {
    return `image-${Date.now()}.jpg`
  }
}