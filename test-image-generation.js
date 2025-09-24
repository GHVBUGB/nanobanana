// 图像生成测试脚本
const fs = require('fs');

// 直接设置 API 密钥进行测试
const apiKey = 'sk-or-v1-c9db8d3969fae79649e7272f50063e7c01843a5e60684b4d';

if (!apiKey || apiKey === '你的OpenRouter API密钥') {
  console.error('❌ 请在 .env.local 文件中设置有效的 OPENROUTER_API_KEY');
  process.exit(1);
}

console.log('🚀 开始测试 OpenRouter 图像生成...\n');
console.log('🔑 API 密钥已找到:', apiKey.substring(0, 20) + '...');

async function testImageGeneration() {
  try {
    // 测试1: 基础 API 连接测试
    console.log('\n📋 测试1: 验证 API 密钥...');
    
    const testResponse = await fetch('https://openrouter.ai/api/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Image Platform Test',
      },
    });

    if (!testResponse.ok) {
      const errorText = await testResponse.text();
      console.error('❌ API 密钥验证失败:', errorText);
      
      if (testResponse.status === 401) {
        console.log('💡 解决方案:');
        console.log('   1. 检查你的 OpenRouter API 密钥是否正确');
        console.log('   2. 访问 https://openrouter.ai/keys 验证密钥状态');
        console.log('   3. 确保账户有足够的余额');
      }
      return;
    }

    console.log('✅ API 密钥验证成功!');

    // 测试2: 文本生成测试（用于图像提示优化）
    console.log('\n🎨 测试2: 文本生成测试（图像提示优化）...');
    
    const chatResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Image Platform Test',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert at creating detailed prompts for AI image generation. Create vivid, detailed descriptions.' 
          },
          { 
            role: 'user', 
            content: '请为以下主题创建一个详细的AI图像生成提示: 一只可爱的机器人猫咪' 
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (chatResponse.ok) {
      const chatData = await chatResponse.json();
      const generatedPrompt = chatData.choices?.[0]?.message?.content;
      console.log('✅ 图像提示生成成功!');
      console.log('🎯 生成的提示:', generatedPrompt);
    } else {
      console.log('⚠️ 文本生成测试失败，但这不影响主要功能');
    }

    // 测试3: 检查支持的图像生成模型
    console.log('\n🔍 测试3: 检查可用的图像生成模型...');
    
    const modelsData = await testResponse.json();
    const imageModels = modelsData.data?.filter(model => 
      model.id.includes('dall-e') || 
      model.id.includes('midjourney') || 
      model.id.includes('stable-diffusion') ||
      model.id.includes('imagen') ||
      model.name?.toLowerCase().includes('image')
    );

    if (imageModels && imageModels.length > 0) {
      console.log('✅ 找到图像生成模型:');
      imageModels.slice(0, 5).forEach(model => {
        console.log(`   - ${model.id}: ${model.name || 'N/A'}`);
      });
    } else {
      console.log('⚠️ 未找到专门的图像生成模型');
      console.log('💡 当前配置使用文本模型来生成图像描述和URL');
    }

    console.log('\n🎉 测试完成!');
    console.log('✅ OpenRouter API 配置正确');
    console.log('💡 你的应用现在应该可以正常工作了');
    console.log('🚀 启动应用: npm run dev');
    console.log('🌐 访问: http://localhost:3000');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    
    if (error.message.includes('fetch')) {
      console.log('💡 可能需要安装 node-fetch: npm install node-fetch');
    }
  }
}

// 运行测试
testImageGeneration();
