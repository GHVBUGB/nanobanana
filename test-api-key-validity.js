const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function testGeminiAPIKey() {
  console.log('🔍 测试 Gemini API 密钥有效性...\n');
  
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    console.error('❌ 未找到 GEMINI_API_KEY 环境变量');
    return false;
  }
  
  console.log(`🔑 API 密钥: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
  
  try {
    // 初始化 Google AI 客户端
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // 获取模型
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    console.log('✅ 客户端初始化成功');
    
    // 测试简单的文本生成
    console.log('🧪 测试文本生成...');
    const result = await model.generateContent("Say hello in one word");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ API 调用成功!');
    console.log(`📝 响应: ${text}`);
    
    return true;
    
  } catch (error) {
    console.error('❌ API 调用失败:');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('🚨 API 密钥无效，请检查密钥是否正确');
    } else if (error.message.includes('PERMISSION_DENIED')) {
      console.error('🚨 权限被拒绝，请检查 API 密钥权限');
    } else if (error.message.includes('QUOTA_EXCEEDED')) {
      console.error('🚨 API 配额已用完，请检查配额限制');
    } else if (error.message.includes('fetch failed')) {
      console.error('🚨 网络连接失败，请检查网络连接');
    }
    
    return false;
  }
}

async function testOpenRouterAPIKey() {
  console.log('\n🔍 测试 OpenRouter API 密钥有效性...\n');
  
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseUrl = process.env.OPENROUTER_BASE_URL;
  
  if (!apiKey) {
    console.error('❌ 未找到 OPENROUTER_API_KEY 环境变量');
    return false;
  }
  
  console.log(`🔑 API 密钥: ${apiKey.substring(0, 10)}...${apiKey.substring(apiKey.length - 5)}`);
  console.log(`🌐 基础URL: ${baseUrl}`);
  
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.OPENROUTER_HTTP_REFERER || 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_X_TITLE || 'AI Image Platform'
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash',
        messages: [
          { role: 'user', content: 'Say hello in one word' }
        ],
        max_tokens: 10
      })
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenRouter API 调用成功!');
      console.log(`📝 响应: ${data.choices?.[0]?.message?.content || '无内容'}`);
      return true;
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ OpenRouter API 调用失败:');
      console.error('状态码:', response.status);
      console.error('错误信息:', errorData.error?.message || response.statusText);
      
      if (response.status === 401) {
        console.error('🚨 API 密钥无效或未授权');
      } else if (response.status === 429) {
        console.error('🚨 请求频率过高或配额不足');
      }
      
      return false;
    }
    
  } catch (error) {
    console.error('❌ OpenRouter API 调用失败:');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 开始测试 API 密钥有效性...\n');
  
  const geminiValid = await testGeminiAPIKey();
  const openrouterValid = await testOpenRouterAPIKey();
  
  console.log('\n📊 测试结果总结:');
  console.log(`Gemini API: ${geminiValid ? '✅ 有效' : '❌ 无效'}`);
  console.log(`OpenRouter API: ${openrouterValid ? '✅ 有效' : '❌ 无效'}`);
  
  if (!geminiValid && !openrouterValid) {
    console.log('\n🚨 所有 API 密钥都无效，请检查配置');
  } else if (geminiValid) {
    console.log('\n✅ 建议使用 Gemini API');
  } else if (openrouterValid) {
    console.log('\n✅ 建议使用 OpenRouter API');
  }
}

main().catch(console.error);