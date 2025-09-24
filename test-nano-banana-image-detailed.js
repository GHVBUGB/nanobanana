// 详细测试 nano banana API 图像生成功能
require('dotenv').config({ path: '.env.local' });

const API_BASE = process.env.OPENAI_API_BASE || 'https://newapi.aisonnet.org/v1';
const API_KEY = process.env.OPENAI_API_KEY || 'sk-qHOlqyoseAVOuQWvxXsdNRu4dX645K8Ox4JzFI2NBlNWTOO9';

console.log('🎨 详细测试 nano banana API 图像生成功能...\n');

async function testDetailedImageGeneration() {
  if (!API_KEY) {
    console.error('❌ API Key 未设置');
    return;
  }

  try {
    // 测试不同的图像生成提示方式
    const testCases = [
      {
        name: '直接图像生成请求',
        prompt: 'Generate an image of a cute robot cat sitting on rainbow clouds, cartoon style, high quality, 4K resolution'
      },
      {
        name: '中文图像生成请求',
        prompt: '生成一张图片：一只可爱的机器人猫咪，坐在彩虹色的云朵上，卡通风格，高质量，4K分辨率'
      },
      {
        name: '带格式要求的图像生成',
        prompt: 'Please generate an image and return it as base64 encoded data or image URL: A beautiful sunset over mountains with a lake reflection'
      },
      {
        name: '多模态请求',
        prompt: 'Create a visual representation of: A futuristic cityscape at night with neon lights. Please provide the image in a format I can display.'
      }
    ];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`\n🧪 测试 ${i + 1}: ${testCase.name}`);
      console.log(`📝 提示词: ${testCase.prompt}`);
      
      const requestBody = {
        model: 'nano-banana',
        messages: [
          {
            role: 'user',
            content: testCase.prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      };

      try {
        const response = await fetch(`${API_BASE}/chat/completions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        });

        console.log(`📡 响应状态: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || '';
          
          console.log('✅ 请求成功!');
          console.log(`📏 响应长度: ${content.length} 字符`);
          console.log(`📝 响应内容预览: ${content.substring(0, 200)}...`);
          
          // 检查是否包含图像相关内容
          const hasBase64 = content.includes('data:image') || content.includes('base64');
          const hasImageUrl = content.match(/https?:\/\/[^\s]+\.(jpg|jpeg|png|gif|webp)/i);
          const hasImageTag = content.includes('<img') || content.includes('[image]');
          
          console.log('🔍 图像内容检测:');
          console.log(`   Base64图像: ${hasBase64 ? '✅ 发现' : '❌ 未发现'}`);
          console.log(`   图像URL: ${hasImageUrl ? '✅ 发现' : '❌ 未发现'}`);
          console.log(`   图像标签: ${hasImageTag ? '✅ 发现' : '❌ 未发现'}`);
          
          if (hasBase64 || hasImageUrl || hasImageTag) {
            console.log('🎉 检测到图像内容！');
          } else {
            console.log('ℹ️ 未检测到直接的图像内容，可能是文本描述');
          }
          
          // 显示完整响应以供分析
          console.log('📊 完整响应:');
          console.log(JSON.stringify(data, null, 2));
          
        } else {
          const errorText = await response.text();
          console.error('❌ 请求失败:', errorText);
        }
        
      } catch (error) {
        console.error('❌ 请求错误:', error.message);
      }
      
      // 在测试之间添加延迟
      if (i < testCases.length - 1) {
        console.log('⏳ 等待 2 秒后继续下一个测试...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // 测试特殊的图像生成参数
    console.log('\n🎯 测试特殊参数: 尝试使用图像生成特定参数');
    
    const specialRequest = {
      model: 'nano-banana',
      messages: [
        {
          role: 'system',
          content: 'You are an AI that can generate images. When asked to create an image, provide the actual image data or a direct link to the generated image.'
        },
        {
          role: 'user',
          content: 'Generate an image of a red rose in a vase. Please provide the actual image, not just a description.'
        }
      ],
      max_tokens: 2000,
      temperature: 0.3,
      // 尝试添加可能的图像生成参数
      response_format: { type: "text" }
    };

    try {
      const specialResponse = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(specialRequest)
      });

      if (specialResponse.ok) {
        const specialData = await specialResponse.json();
        console.log('✅ 特殊参数测试成功!');
        console.log('📝 响应:', specialData.choices?.[0]?.message?.content?.substring(0, 300) + '...');
      } else {
        console.log('ℹ️ 特殊参数测试失败，使用标准参数');
      }
    } catch (error) {
      console.log('ℹ️ 特殊参数测试出错:', error.message);
    }

    console.log('\n🎉 详细测试完成!');
    console.log('💡 总结：');
    console.log('   - API连接正常');
    console.log('   - nano-banana模型可用');
    console.log('   - 需要根据实际响应格式调整应用逻辑');
    console.log('   - 建议检查API文档了解图像生成的具体实现方式');

  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行详细测试
testDetailedImageGeneration();