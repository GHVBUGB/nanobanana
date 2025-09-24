// OpenRouter API 测试脚本
// 使用方法: node test-api.js

// 直接设置 API 配置
const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';
const OPENROUTER_MODEL = 'google/gemini-2.5-flash-image-preview';
const OPENROUTER_API_KEY = 'sk-or-v1-8fe8015f590f34c9db8d3969fae79649e7272f50063e7c01843a5e';

async function testOpenRouterAPI() {
  console.log('🚀 开始测试 OpenRouter API 配置...\n');
  
  // 检查环境变量
  console.log('📋 环境变量检查:');
  console.log(`   OPENROUTER_API_KEY: ${OPENROUTER_API_KEY ? '✅ 已设置' : '❌ 未设置'}`);
  console.log(`   OPENROUTER_BASE_URL: ${OPENROUTER_BASE_URL}`);
  console.log(`   OPENROUTER_MODEL: ${OPENROUTER_MODEL}\n`);

  if (!OPENROUTER_API_KEY) {
    console.error('❌ 错误: 未找到 OPENROUTER_API_KEY 环境变量');
    console.log('💡 请按照以下步骤设置:');
    console.log('   1. 在项目根目录创建 .env.local 文件');
    console.log('   2. 添加: OPENROUTER_API_KEY=你的API密钥');
    console.log('   3. 重新运行此测试脚本');
    return;
  }

  if (OPENROUTER_API_KEY === '你的OpenRouter API密钥') {
    console.error('❌ 错误: 请将 "你的OpenRouter API密钥" 替换为实际的API密钥');
    return;
  }

  try {
    console.log('🔗 测试 API 连接...');
    
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_X_TITLE || 'AI Image Platform Test',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are a helpful assistant. Respond briefly.' 
          },
          { 
            role: 'user', 
            content: 'Say "API test successful" if you can read this message.' 
          },
        ],
        max_tokens: 50,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    
    console.log('✅ API 连接测试成功!');
    console.log(`📝 模型回应: ${reply}\n`);

    // 测试图像生成提示
    console.log('🎨 测试图像生成提示...');
    const imageResponse = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_X_TITLE || 'AI Image Platform Test',
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { 
            role: 'system', 
            content: 'You are an image generation assistant. Create detailed prompts for AI image generation.' 
          },
          { 
            role: 'user', 
            content: 'Create a prompt for: a cute robot cat, digital art style' 
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      const imagePrompt = imageData.choices?.[0]?.message?.content;
      console.log('✅ 图像生成提示测试成功!');
      console.log(`🎯 生成的提示: ${imagePrompt}\n`);
    }

    console.log('🎉 所有测试完成!');
    console.log('✅ OpenRouter API 配置正确，可以正常使用');
    console.log('💡 现在你可以启动应用: npm run dev');

  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    if (error.message.includes('401')) {
      console.log('🔑 可能的问题: API 密钥无效或已过期');
      console.log('💡 解决方案: 请检查你的 OpenRouter API 密钥是否正确');
    } else if (error.message.includes('429')) {
      console.log('⏰ 可能的问题: API 调用频率限制或余额不足');
      console.log('💡 解决方案: 请检查你的 OpenRouter 账户余额');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('🌐 可能的问题: 网络连接问题');
      console.log('💡 解决方案: 请检查你的网络连接');
    } else if (error.message.includes('fetch')) {
      console.log('📦 可能的问题: 缺少依赖包');
      console.log('💡 解决方案: 运行 npm install 安装依赖');
    }
  }
}

// 运行测试
testOpenRouterAPI().catch(console.error);
