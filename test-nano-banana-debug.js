const fetch = require('node-fetch');

const OPENAI_API_KEY = 'sk-qHOlqyoseAVOuQWvxXsdNRu4dX645K8Ox4JzFI2NBlNWTOO9';
const OPENAI_API_BASE = 'https://newapi.aisonnet.org/v1';

async function testAPI() {
  try {
    console.log('🚀 测试 Nano Banana API...');
    
    const requestBody = {
      model: 'gpt-4o',
      messages: [{
        role: 'user',
        content: '生成一张可爱的小猫图片'
      }],
      max_tokens: 4000,
      temperature: 0.7
    };
    
    console.log('📋 请求体:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(`${OPENAI_API_BASE}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log('📊 响应状态:', response.status);
    console.log('📊 响应头:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API 请求失败:', response.status, errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ API 响应成功');
    console.log('📄 完整响应:', JSON.stringify(data, null, 2));
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content;
      console.log('📝 消息内容:', content);
      
      // 测试图片URL提取
      const imageUrlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+\.(?:png|jpg|jpeg|gif|webp)/gi;
      const urls = content.match(imageUrlRegex) || [];
      console.log('🖼️ 提取的图片URL:', urls);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testAPI();