// 测试 Gemini API 图片生成功能
const { GoogleGenerativeAI } = require('@google/genai');

// 从环境变量获取 API 密钥
const API_KEY = process.env.GEMINI_API_KEY || 'your-api-key-here';

async function testGeminiImageGeneration() {
  console.log('🚀 开始测试 Gemini 图片生成功能...');
  
  if (!API_KEY || API_KEY === 'your-api-key-here') {
    console.error('❌ 错误: 请在 .env.local 文件中设置 GEMINI_API_KEY');
    console.log('📝 请按照以下步骤获取 API 密钥:');
    console.log('1. 访问 https://aistudio.google.com/app/apikey');
    console.log('2. 登录您的 Google 账户');
    console.log('3. 点击 "Create API Key" 创建新的 API 密钥');
    console.log('4. 复制密钥并添加到 .env.local 文件中');
    return;
  }

  try {
    console.log('🔑 使用 API 密钥:', API_KEY.substring(0, 10) + '...');
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // 获取 Gemini 2.5 Flash Image Preview 模型
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-image-preview" 
    });
    
    console.log('📝 测试提示词: "一只可爱的小猫咪在花园里玩耍"');
    
    const prompt = "一只可爱的小猫咪在花园里玩耍，高质量，详细，清晰";
    
    console.log('⏳ 正在生成图片...');
    
    const result = await model.generateContent([prompt]);
    const response = await result.response;
    
    console.log('✅ API 调用成功!');
    console.log('📊 响应数据:', JSON.stringify(response, null, 2));
    
    // 检查是否有图片数据
    if (response.candidates && response.candidates.length > 0) {
      const candidate = response.candidates[0];
      console.log('🖼️  生成的内容:', candidate.content);
      
      // 查找图片部分
      if (candidate.content && candidate.content.parts) {
        const imageParts = candidate.content.parts.filter(part => part.inlineData);
        if (imageParts.length > 0) {
          console.log(`🎉 成功生成 ${imageParts.length} 张图片!`);
          imageParts.forEach((part, index) => {
            console.log(`图片 ${index + 1}: ${part.inlineData.mimeType}, 大小: ${part.inlineData.data.length} 字符`);
          });
        } else {
          console.log('⚠️  响应中没有找到图片数据');
        }
      }
    } else {
      console.log('⚠️  响应中没有候选结果');
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('🔑 API 密钥无效，请检查密钥是否正确');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.log('🚫 权限被拒绝，请检查 API 密钥权限');
    } else if (error.message.includes('MODEL_NOT_FOUND')) {
      console.log('🤖 模型未找到，请检查模型名称是否正确');
    } else {
      console.log('🔍 详细错误信息:', error);
    }
  }
}

// 运行测试
testGeminiImageGeneration().catch(console.error);