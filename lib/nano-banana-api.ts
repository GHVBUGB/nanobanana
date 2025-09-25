// Nano Banana API - 专注于图片理解和编辑
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_BASE = process.env.OPENAI_API_BASE || 'https://newapi.aisonnet.org/v1';

if (OPENAI_API_KEY) {
  console.log('✅ Nano Banana API密钥已加载');
  console.log('✅ API Base URL:', OPENAI_API_BASE);
} else {
  console.warn('⚠️ 未找到 Nano Banana API 密钥');
}

// 图片生成接口
export interface ImageGenerationOptions {
  prompt: string;
  count?: number;
  referenceImage?: string;
  taskId?: string;
}

export interface ImageGenerationResult {
  success: boolean;
  images?: string[];
  error?: string;
}

/**
 * 使用 Nano Banana API 生成或编辑图片
 */
export async function generateImages(prompt: string, options?: ImageGenerationOptions): Promise<ImageGenerationResult> {
  console.log('🍌 Nano Banana API 调用开始');
  console.log('📝 用户提示词:', prompt);
  console.log('🖼️ 参考图片:', options?.referenceImage ? '已提供' : '未提供');
  
  if (!OPENAI_API_KEY) {
    return {
      success: false,
      error: '未配置 Nano Banana API 密钥'
    };
  }

  try {
    // 构建请求消息
    const messages: any[] = [];
    
    if (options?.referenceImage) {
      // 有参考图片时，进行图片编辑
      console.log('🎨 执行图片编辑任务');
      
      let imageUrl: string;
      if (options.referenceImage.startsWith('data:image/')) {
        imageUrl = options.referenceImage;
      } else {
        imageUrl = `data:image/jpeg;base64,${options.referenceImage}`;
      }
      
      // 构建图片编辑提示词
      const editPrompt = `请根据用户的要求对这张图片进行编辑：${prompt}。请保持图片的主要构图和风格，只按照用户的具体要求进行修改。`;
      
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
            text: editPrompt
          }
        ]
      });
    } else {
      // 没有参考图片时，进行文本生图
      console.log('🎨 执行文本生图任务');
      messages.push({
        role: 'user',
        content: prompt
      });
    }

    const requestBody = {
      model: 'nano-banana',
      messages: messages,
      max_tokens: 4000,
      temperature: 0.7
    };

    console.log('🚀 发送请求到 Nano Banana API');
    
    // 添加超时控制
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时
    
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Nano Banana API 请求失败:', response.status, errorText);
      return {
        success: false,
        error: `API请求失败: ${response.status} ${errorText}`
      };
    }

    const data = await response.json();
    console.log('✅ Nano Banana API 响应成功');
    console.log('🤖 使用的模型:', data.model);
    
    const content = data.choices[0]?.message?.content || '';
    console.log('📝 AI完整回复:', content);
    
    // 提取图片URL
    const imageUrls = extractImageUrls(content);
    
    if (imageUrls.length > 0) {
      console.log('🖼️ 成功提取图片:', imageUrls.length, '张');
      console.log('🔗 图片URLs:', imageUrls);
      return {
        success: true,
        images: imageUrls
      };
    } else {
      console.warn('⚠️ 未找到生成的图片');
      console.warn('📄 AI回复内容:', content);
      
      // 如果没有找到图片，但API调用成功，可能是模型没有生成图片
      // 返回一个友好的错误信息
      return {
        success: false,
        error: 'AI模型未生成图片，请尝试更具体的描述或重新生成'
      };
    }

  } catch (error) {
    console.error('❌ Nano Banana API 调用异常:', error);
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'API调用超时，请重试'
        };
      }
      return {
        success: false,
        error: error.message
      };
    }
    
    return {
      success: false,
      error: '未知错误'
    };
  }
}

/**
 * 从AI回复中提取图片URL
 */
function extractImageUrls(content: string): string[] {
  console.log('🔍 开始提取图片URL...');
  console.log('📄 待分析内容:', content);
  
  const urls: string[] = [];
  
  // 匹配 nano-banana 特有格式: |>![image](url)
  const nanoBananaRegex = /\|>!\[image\]\((https?:\/\/[^\s\)]+)\)/gi;
  let match;
  while ((match = nanoBananaRegex.exec(content)) !== null) {
    console.log('🎯 找到nano-banana格式URL:', match[1]);
    urls.push(match[1]);
  }
  
  // 匹配标准 markdown 格式: ![alt](url)
  const markdownRegex = /!\[[^\]]*\]\((https?:\/\/[^\s\)]+)\)/gi;
  while ((match = markdownRegex.exec(content)) !== null) {
    console.log('🎯 找到markdown格式URL:', match[1]);
    urls.push(match[1]);
  }
  
  // 匹配直接的nananobanana.com URL
  const directUrlRegex = /(https?:\/\/cloudflarer?2?\.nananobanana\.com\/[^\s\)<>"{}|\\^`[\]]+)/gi;
  while ((match = directUrlRegex.exec(content)) !== null) {
    console.log('🎯 找到直接URL:', match[1]);
    urls.push(match[1]);
  }
  
  // 去重并清理URL
  const cleanUrls = [...new Set(urls)].map(url => {
    const cleaned = url.replace(/[)\]}>.,;!?]+$/, '');
    console.log('🧹 清理URL:', url, '->', cleaned);
    return cleaned;
  }).filter(url => {
    const isValid = url && url.startsWith('http');
    console.log('✅ URL有效性检查:', url, isValid);
    return isValid;
  });
  
  console.log('🔗 最终提取的图片URLs:', cleanUrls);
  return cleanUrls;
}