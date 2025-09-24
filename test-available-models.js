const fetch = require('node-fetch');

const OPENAI_API_KEY = 'sk-qHOlqyoseAVOuQWvxXsdNRu4dX645K8Ox4JzFI2NBlNWTOO9';
const OPENAI_API_BASE = 'https://newapi.aisonnet.org/v1';

async function testModels() {
  try {
    console.log('🔍 获取可用模型列表...');
    
    const response = await fetch(`${OPENAI_API_BASE}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 获取模型列表失败:', response.status, errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ 可用模型:');
    
    if (data.data && Array.isArray(data.data)) {
      data.data.forEach(model => {
        console.log(`  - ${model.id}`);
      });
      
      // 查找图像相关的模型
      const imageModels = data.data.filter(model => 
        model.id.toLowerCase().includes('image') || 
        model.id.toLowerCase().includes('vision') ||
        model.id.toLowerCase().includes('dall') ||
        model.id.toLowerCase().includes('gpt-4')
      );
      
      console.log('\n🖼️ 可能支持图像的模型:');
      imageModels.forEach(model => {
        console.log(`  - ${model.id}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

// 测试一些常见的模型
async function testCommonModels() {
  const modelsToTest = [
    'gpt-3.5-turbo',
    'gpt-4',
    'gpt-4-turbo',
    'dall-e-3',
    'dall-e-2'
  ];
  
  console.log('\n🧪 测试常见模型...');
  
  for (const model of modelsToTest) {
    try {
      const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: model,
          messages: [{
            role: 'user',
            content: 'Hello'
          }],
          max_tokens: 10
        })
      });
      
      if (response.ok) {
        console.log(`✅ ${model}: 可用`);
      } else {
        const error = await response.text();
        console.log(`❌ ${model}: ${response.status} - ${error.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`❌ ${model}: 网络错误`);
    }
  }
}

async function main() {
  await testModels();
  await testCommonModels();
}

main();