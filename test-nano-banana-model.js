const fetch = require('node-fetch');

const OPENAI_API_KEY = 'sk-qHOlqyoseAVOuQWvxXsdNRu4dX645K8Ox4JzFI2NBlNWTOO9';
const OPENAI_API_BASE = 'https://newapi.aisonnet.org/v1';

async function testNanoBananaModel() {
  try {
    console.log('🍌 测试 nano-banana 模型...');
    
    const requestBody = {
      model: 'nano-banana',
      messages: [{
        role: 'user',
        content: '请生成一张可爱的小猫图片'
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
      
      // 测试多种图片URL提取模式
      console.log('\n🔍 测试图片URL提取...');
      
      // 模式1: 标准HTTP/HTTPS URL
      const httpUrlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+\.(?:png|jpg|jpeg|gif|webp)/gi;
      const httpUrls = content.match(httpUrlRegex) || [];
      console.log('🌐 HTTP URLs:', httpUrls);
      
      // 模式2: Markdown 图片格式
      const markdownRegex = /!\[.*?\]\((https?:\/\/[^\s)]+\.(?:png|jpg|jpeg|gif|webp))\)/gi;
      const markdownUrls = [];
      let match;
      while ((match = markdownRegex.exec(content)) !== null) {
        markdownUrls.push(match[1]);
      }
      console.log('📝 Markdown URLs:', markdownUrls);
      
      // 模式3: 任何包含图片扩展名的URL
      const anyImageRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
      const allUrls = content.match(anyImageRegex) || [];
      const imageUrls = allUrls.filter(url => 
        /\.(png|jpg|jpeg|gif|webp)(\?[^]*)?$/i.test(url)
      );
      console.log('🖼️ 所有图片URLs:', imageUrls);
      
      // 模式4: 查找任何URL（清理尾随括号）
      const cleanUrls = allUrls.map(url => url.replace(/\)+$/, ''));
      console.log('🔗 所有URLs:', cleanUrls);
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error);
  }
}

testNanoBananaModel();