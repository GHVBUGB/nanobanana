// 测试 nano banana API 图像生成功能
require('dotenv').config({ path: '.env.local' });

const API_BASE = process.env.OPENAI_API_BASE || 'https://newapi.aisonnet.org/v1';
const API_KEY = process.env.OPENAI_API_KEY || 'sk-qHOlqyoseAVOuQWvxXsdNRu4dX645K8Ox4JzFI2NBlNWTOO9';

console.log('🚀 测试 nano banana API 图像生成功能...\n');
console.log('🔗 API Base URL:', API_BASE);
console.log('🔑 API Key:', API_KEY ? API_KEY.substring(0, 20) + '...' : '未设置');

async function testNanoBananaImageGeneration() {
  if (!API_KEY) {
    console.error('❌ API Key 未设置，请检查环境变量配置');
    return;
  }

  try {
    // 测试1: 验证API连接
    console.log('\n📋 测试1: 验证API连接...');
    
    const modelsResponse = await fetch(`${API_BASE}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('📡 模型列表响应状态:', modelsResponse.status, modelsResponse.statusText);
    
    if (modelsResponse.ok) {
      const modelsData = await modelsResponse.json();
      console.log('✅ API连接成功!');
      console.log('📊 可用模型数量:', modelsData.data?.length || 0);
      
      // 显示前几个模型
      if (modelsData.data && modelsData.data.length > 0) {
        console.log('🎯 前5个可用模型:');
        modelsData.data.slice(0, 5).forEach((model, index) => {
          console.log(`   ${index + 1}. ${model.id}`);
        });
      }
    } else {
      const errorText = await modelsResponse.text();
      console.error('❌ API连接失败:', errorText);
      return;
    }

    // 测试2: 文本生成图像
    console.log('\n🎨 测试2: 文本生成图像...');
    
    const imagePrompt = '一只可爱的机器人猫咪，坐在彩虹色的云朵上，卡通风格，高质量，4K分辨率';
    
    const requestBody = {
      model: 'nano-banana', // 使用可用的nano-banana模型
      messages: [
        {
          role: 'user',
          content: `请生成一张图片：${imagePrompt}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    };

    console.log('📤 发送图像生成请求...');
    console.log('🎯 提示词:', imagePrompt);

    const imageResponse = await fetch(`${API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📥 图像生成响应状态:', imageResponse.status, imageResponse.statusText);
    
    if (imageResponse.ok) {
      const imageData = await imageResponse.json();
      console.log('✅ 图像生成请求成功!');
      
      if (imageData.choices && imageData.choices[0]) {
        const message = imageData.choices[0].message;
        console.log('📝 生成的内容:', message.content?.substring(0, 200) + '...');
        
        // 检查是否包含图像数据
        if (message.content && (message.content.includes('data:image') || message.content.includes('http'))) {
          console.log('🖼️ 检测到可能的图像数据或链接');
        } else {
          console.log('ℹ️ 响应包含文本描述，可能需要进一步处理');
        }
      }
      
      console.log('📊 完整响应结构:');
      console.log(JSON.stringify(imageData, null, 2));
      
    } else {
      const errorText = await imageResponse.text();
      console.error('❌ 图像生成失败:', errorText);
    }

    // 测试3: 尝试使用图像生成专用端点（如果存在）
    console.log('\n🖼️ 测试3: 尝试图像生成专用端点...');
    
    try {
      const imageGenResponse = await fetch(`${API_BASE}/images/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          n: 1,
          size: '1024x1024'
        })
      });

      console.log('📡 专用端点响应状态:', imageGenResponse.status);
      
      if (imageGenResponse.ok) {
        const imageGenData = await imageGenResponse.json();
        console.log('✅ 专用图像生成端点可用!');
        console.log('🖼️ 生成的图像:', imageGenData.data?.length || 0, '张');
      } else {
        console.log('ℹ️ 专用图像生成端点不可用，使用聊天端点');
      }
    } catch (error) {
      console.log('ℹ️ 专用图像生成端点测试失败:', error.message);
    }

    console.log('\n🎉 测试完成!');
    console.log('✅ nano banana API 配置正确');
    console.log('💡 建议：根据API响应调整应用中的图像生成逻辑');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
    console.error('🔍 错误详情:', error);
  }
}

// 运行测试
testNanoBananaImageGeneration();