import { GoogleGenerativeAI } from '@google/generative-ai';
import { textToImage, editImage, ImageGenerationOptions, ImageEditOptions, ImageOperationResult } from './gemini-image';

// 获取环境变量中的API密钥 - 优先使用 nano banana API
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_BASE = process.env.OPENAI_API_BASE || 'https://newapi.aisonnet.org/v1';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (OPENAI_API_KEY) {
  console.log('✅ Nano Banana API密钥已加载:', OPENAI_API_KEY.substring(0, 10) + '...' + OPENAI_API_KEY.substring(OPENAI_API_KEY.length - 5));
  console.log('✅ API Base URL:', OPENAI_API_BASE);
} else if (GEMINI_API_KEY) {
  console.log('✅ Gemini API密钥已加载:', GEMINI_API_KEY.substring(0, 10) + '...' + GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 5));
} else {
  console.warn('No API keys found, using fallback');
}

// 图片生成接口
export interface ImageGenerationOptions {
  prompt: string;
  count?: number;
  size?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  images?: string[];
  error?: string;
}

/**
 * 使用 nano banana API 生成图片
 * 优先使用 nano banana API，如果不可用则回退到 Gemini API
 */
export async function generateImages(prompt: string, options?: ImageGenerationOptions & { referenceImage?: string }): Promise<ImageGenerationResult> {
  console.log('🔄 图像生成 API 调用开始:', prompt);
  console.log('🖼️ 参考图片:', options?.referenceImage ? '已提供' : '未提供');
  
  // 优先尝试使用 nano banana API
  if (OPENAI_API_KEY) {
    console.log('🚀 使用 Nano Banana API 生成图像');
    return await generateImagesWithNanoBanana(prompt, options);
  }
  
  // 回退到 Gemini API
  if (GEMINI_API_KEY) {
    console.log('🔄 回退到 Gemini API');
    return await generateImagesWithRealAPI(prompt, options);
  }
  
  // 如果没有API密钥，返回占位符图片
  console.log('⚠️ 未找到API密钥，返回占位符图片');
  return await generatePlaceholderImages(options?.count || 1);
}

/**
 * 使用 nano banana API 生成图片
 */
async function generateImagesWithNanoBanana(prompt: string, options?: ImageGenerationOptions & { referenceImage?: string }): Promise<ImageGenerationResult> {
  try {
    console.log('🍌 开始使用 Nano Banana API 生成图片');
    console.log('📝 提示词:', prompt);
    console.log('🖼️ 参考图片:', options?.referenceImage ? '已提供' : '未提供');
    
    // 构建消息内容
    const messages: any[] = [];
    
    // 如果有参考图片，先添加图片消息
    if (options?.referenceImage) {
      console.log('📸 添加参考图片到请求中');
      console.log('🔍 参考图片类型:', typeof options.referenceImage);
      console.log('🔍 参考图片长度:', options.referenceImage.length);
      console.log('🔍 参考图片前缀:', options.referenceImage.substring(0, 50));
      
      // 构建包含图片的base64 URL
      let imageUrl: string;
      
      if (options.referenceImage.startsWith('data:image/')) {
        // 已经是完整的data URL格式
        imageUrl = options.referenceImage;
        console.log('✅ 检测到完整的data URL格式');
      } else {
        // 假设是纯base64数据，需要添加前缀
        // 默认假设是JPEG格式，实际应用中可以根据需要调整
        imageUrl = `data:image/jpeg;base64,${options.referenceImage}`;
        console.log('✅ 添加data URL前缀到base64数据');
      }
      
      // 添加包含图片和文本的单个消息
      const textPrompt = `基于提供的参考图片，${prompt}。请保持原图的主要特征和构图，只根据描述进行相应的修改和调整。`;
      
      messages.push({
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: {
              url: imageUrl
            }
          },
          {
            type: 'text',
            text: textPrompt
          }
        ]
      });
      
      console.log('✅ 成功添加图片和文本到消息中');
    } else {
      // 没有参考图片时，只添加文本提示
      console.log('📝 添加纯文本提示');
      messages.push({
        role: 'user',
        content: prompt
      });
    }

    const requestBody = {
      model: 'nano-banana',  // 使用正确的模型名称
      messages: messages,
      max_tokens: 4000,
      temperature: 0.7
    };

    console.log('🚀 发送请求到 Nano Banana API');
    console.log('📋 请求体结构:', {
      model: requestBody.model,
      messageCount: messages.length,
      hasImage: messages.some(msg => 
        Array.isArray(msg.content) && 
        msg.content.some((item: any) => item.type === 'image_url')
      )
    });

    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📊 API 响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Nano Banana API 请求失败:', response.status, errorText);
      throw new Error(`API请求失败: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Nano Banana API 响应成功');
    console.log('📄 API 响应数据:', JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      console.log('📄 API 响应内容:', content);
      
      // 从响应中提取图片URL
      const imageUrls = extractImageUrls(content);
      
      if (imageUrls.length > 0) {
        console.log('🖼️ 成功提取图片URL:', imageUrls.length, '张');
        console.log('🎯 图片URLs:', imageUrls);
        return {
          success: true,
          images: imageUrls
        };
      } else {
        console.log('⚠️ 未找到图片URL，返回占位符图片');
        console.log('🔍 响应内容用于调试:', content);
        return await generatePlaceholderImages(options?.count || 1);
      }
    } else {
      console.error('❌ API响应格式异常:', data);
      throw new Error('API响应格式异常');
    }
  } catch (error) {
    console.error('❌ Nano Banana API 调用失败:', error);
    console.log('🔄 回退到占位符图片');
    return await generatePlaceholderImages(options?.count || 1);
  }
}

/**
 * 从响应内容中提取图像URL
 */
function extractImageUrls(content: string): string[] {
  console.log('🔍 开始提取图片URL');
  console.log('📄 原始内容:', content);
  
  const urls: string[] = [];
  
  // 1. 匹配标准 markdown 格式: ![alt](url) - 这是nano banana API的主要格式
  const markdownRegex = /!\[[^\]]*\]\((https?:\/\/[^\s\)]+)\)/gi;
  let match;
  while ((match = markdownRegex.exec(content)) !== null) {
    const url = match[1].trim();
    console.log('📝 找到 markdown 格式URL:', url);
    urls.push(url);
  }
  
  // 2. 匹配 nano-banana 特有的格式: |>![image](url)
  const nanoBananaRegex = /\|>!\[image\]\((https?:\/\/[^\s\)]+)\)/gi;
  while ((match = nanoBananaRegex.exec(content)) !== null) {
    const url = match[1].trim();
    if (!urls.includes(url)) {
      console.log('🍌 找到 nano-banana 格式URL:', url);
      urls.push(url);
    }
  }
  
  // 3. 特殊处理 cloudflarer2.nananobanana.com 域名的URL（直接匹配）
  const cloudflareRegex = /(https?:\/\/cloudflarer?2?\.nananobanana\.com\/[^\s\)<>"{}|\\^`[\]]+)/gi;
  while ((match = cloudflareRegex.exec(content)) !== null) {
    let url = match[1].trim();
    // 移除可能的尾随字符
    url = url.replace(/[)\]}>.,;!?]+$/, '');
    if (!urls.includes(url)) {
      console.log('☁️ 找到 cloudflare URL:', url);
      urls.push(url);
    }
  }
  
  // 4. 匹配直接的HTTP链接（以图片扩展名结尾）
  const directUrlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+\.(?:png|jpg|jpeg|gif|webp|svg))/gi;
  while ((match = directUrlRegex.exec(content)) !== null) {
    const url = match[1].trim();
    if (!urls.includes(url)) {
      console.log('🔗 找到直接URL:', url);
      urls.push(url);
    }
  }
  
  // 5. 通用URL匹配（作为最后的备选方案）
  const generalUrlRegex = /(https?:\/\/[^\s<>"{}|\\^`[\]]+)/gi;
  while ((match = generalUrlRegex.exec(content)) !== null) {
    const url = match[1].trim();
    // 只添加看起来像图片URL的链接
    if (!urls.includes(url) && (
      url.includes('image') || 
      url.includes('img') || 
      url.includes('png') || 
      url.includes('jpg') || 
      url.includes('jpeg') || 
      url.includes('gif') || 
      url.includes('webp') ||
      url.includes('nananobanana.com')
    )) {
      console.log('🌐 找到通用图片URL:', url);
      urls.push(url);
    }
  }
  
  // 清理和验证URL
  const cleanUrls = urls.map(url => {
    // 移除尾随的标点符号
    let cleanUrl = url.replace(/[)\]}>.,;!?]+$/, '');
    // 确保URL格式正确
    if (cleanUrl.startsWith('http') && !cleanUrl.includes(' ')) {
      return cleanUrl;
    }
    return null;
  }).filter(Boolean) as string[];
  
  console.log('✅ 最终提取的URL数量:', cleanUrls.length);
  console.log('🎯 最终URLs:', cleanUrls);
  
  return cleanUrls;
}

/**
 * 生成占位符图片
 */
async function generatePlaceholderImages(count: number): Promise<ImageGenerationResult> {
  console.log('⚠️ 生成占位符图片');
  
  // 模拟API调用延迟
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const images = [];
  for (let i = 1; i <= count; i++) {
    images.push(`/placeholder.svg?height=512&width=512&text=AI+Generated+${i}`);
  }
  
  return {
    success: true,
    images
  };
}

/**
 * 当网络环境允许时，这里是真实的Gemini API调用实现
 */
async function generateImagesWithRealAPI(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
  if (!GEMINI_API_KEY) {
    return {
      success: false,
      error: 'GEMINI_API_KEY environment variable is required'
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // 注意：Gemini API 目前主要用于文本生成，图片生成功能可能有限
    // 这里是一个示例实现，实际使用时需要根据API文档调整
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const result = await model.generateContent([
      {
        text: `Generate an image based on this prompt: ${prompt}`
      }
    ]);
    
    const response = await result.response;
    
    // 实际的图片生成逻辑需要根据Gemini API的具体实现来调整
    // 目前返回占位符
    return await generatePlaceholderImages(options?.count || 4);
    
  } catch (error) {
    console.error('❌ Gemini API 调用失败:', error);
    return await generatePlaceholderImages(options?.count || 4);
  }
}