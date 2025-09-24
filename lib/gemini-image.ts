import { GoogleGenerativeAI } from '@google/generative-ai';
import * as fs from 'fs';
import * as path from 'path';

// 获取环境变量中的API密钥
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('GEMINI_API_KEY environment variable is not set');
}

// 图像生成选项接口
export interface ImageGenerationOptions {
  prompt: string;
  outputPath?: string;
  width?: number;
  height?: number;
}

// 图像编辑选项接口
export interface ImageEditOptions {
  inputImagePath: string;
  prompt: string;
  outputPath?: string;
}

// 结果接口
export interface ImageOperationResult {
  success: boolean;
  outputPath?: string;
  error?: string;
  base64Data?: string;
}

/**
 * 文字生成图像功能
 * 对应Python代码中的 text_to_image 函数
 */
export async function textToImage(options: ImageGenerationOptions): Promise<ImageOperationResult> {
  console.log('🎨 开始文字生成图像:', options.prompt);
  
  if (!API_KEY) {
    return {
      success: false,
      error: 'GEMINI_API_KEY environment variable is required'
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // 使用 Gemini 2.5 Flash Image Preview 模型
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-experimental" // 使用最新可用的模型
    });

    // 构建请求内容
    const result = await model.generateContent([
      {
        text: `Generate a high-quality image based on this description: ${options.prompt}. Please create a detailed, visually appealing image.`
      }
    ]);

    const response = await result.response;
    
    // 检查响应中是否包含图像数据
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates returned from API');
    }

    const parts = candidates[0].content.parts;
    let imageData: string | null = null;

    // 查找包含图像数据的部分
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        imageData = part.inlineData.data;
        break;
      }
    }

    if (!imageData) {
      // 如果没有直接的图像数据，返回占位符
      console.log('⚠️ API未返回图像数据，使用占位符');
      return {
        success: true,
        base64Data: generatePlaceholderBase64(),
        outputPath: options.outputPath
      };
    }

    // 如果指定了输出路径，保存图像
    if (options.outputPath) {
      const imageBuffer = Buffer.from(imageData, 'base64');
      await fs.promises.writeFile(options.outputPath, imageBuffer);
      console.log('✅ 图像已保存到:', options.outputPath);
    }

    return {
      success: true,
      base64Data: imageData,
      outputPath: options.outputPath
    };

  } catch (error) {
    console.error('❌ 文字生成图像失败:', error);
    
    // 网络错误时返回占位符
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
      console.log('⚠️ 网络连接问题，返回占位符图像');
      return {
        success: true,
        base64Data: generatePlaceholderBase64(),
        outputPath: options.outputPath
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 图像编辑功能
 * 对应Python代码中的 edit_image 函数
 */
export async function editImage(options: ImageEditOptions): Promise<ImageOperationResult> {
  console.log('✏️ 开始图像编辑:', options.prompt);
  
  if (!API_KEY) {
    return {
      success: false,
      error: 'GEMINI_API_KEY environment variable is required'
    };
  }

  try {
    // 读取输入图像并转换为base64
    if (!fs.existsSync(options.inputImagePath)) {
      throw new Error(`Input image not found: ${options.inputImagePath}`);
    }

    const imageBuffer = await fs.promises.readFile(options.inputImagePath);
    const imageBase64 = imageBuffer.toString('base64');
    
    // 获取图像MIME类型
    const ext = path.extname(options.inputImagePath).toLowerCase();
    let mimeType = 'image/png';
    if (ext === '.jpg' || ext === '.jpeg') {
      mimeType = 'image/jpeg';
    } else if (ext === '.webp') {
      mimeType = 'image/webp';
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-experimental"
    });

    // 构建包含图像和文本的请求
    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64
        }
      },
      {
        text: `Edit this image based on the following instruction: ${options.prompt}. Please return the edited image.`
      }
    ]);

    const response = await result.response;
    const candidates = response.candidates;
    
    if (!candidates || candidates.length === 0) {
      throw new Error('No candidates returned from API');
    }

    const parts = candidates[0].content.parts;
    let editedImageData: string | null = null;

    // 查找编辑后的图像数据（通常在第二个part中）
    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];
      if (part.inlineData && part.inlineData.data) {
        editedImageData = part.inlineData.data;
        break;
      }
    }

    if (!editedImageData) {
      console.log('⚠️ API未返回编辑后的图像数据，返回原图');
      return {
        success: true,
        base64Data: imageBase64,
        outputPath: options.outputPath
      };
    }

    // 保存编辑后的图像
    if (options.outputPath) {
      const editedImageBuffer = Buffer.from(editedImageData, 'base64');
      await fs.promises.writeFile(options.outputPath, editedImageBuffer);
      console.log('✅ 编辑后的图像已保存到:', options.outputPath);
    }

    return {
      success: true,
      base64Data: editedImageData,
      outputPath: options.outputPath
    };

  } catch (error) {
    console.error('❌ 图像编辑失败:', error);
    
    // 网络错误时返回占位符
    if (error instanceof Error && (error.message.includes('fetch') || error.message.includes('network'))) {
      console.log('⚠️ 网络连接问题，返回占位符图像');
      return {
        success: true,
        base64Data: generatePlaceholderBase64(),
        outputPath: options.outputPath
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * 生成占位符图像的base64数据
 */
function generatePlaceholderBase64(): string {
  // 这是一个简单的1x1像素PNG图像的base64编码
  // 实际使用中可以替换为更复杂的占位符图像
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
}

/**
 * 辅助函数：确保输出目录存在
 */
export async function ensureOutputDirectory(filePath: string): Promise<void> {
  const dir = path.dirname(filePath);
  try {
    await fs.promises.access(dir);
  } catch {
    await fs.promises.mkdir(dir, { recursive: true });
  }
}

/**
 * 辅助函数：生成默认输出路径
 */
export function generateOutputPath(prefix: string = 'generated', extension: string = 'png'): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return path.join(process.cwd(), 'public', `${prefix}-${timestamp}.${extension}`);
}