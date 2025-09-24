// 简单测试 Gemini API 连接
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  console.log('🔍 开始测试 Gemini API...');
  
  const API_KEY = 'AIzaSyCQSQgP7VrfAByK2goPh3wvBQShl5rYK-w';
  
  if (!API_KEY) {
    console.error('❌ API 密钥未找到');
    return;
  }
  
  console.log('✅ API 密钥已找到');
  
  try {
    // 初始化客户端
    const genAI = new GoogleGenerativeAI(API_KEY);
    console.log('✅ GoogleGenerativeAI 客户端初始化成功');
    
    // 获取模型
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log('✅ 模型获取成功');
    
    // 测试文本生成
    console.log('🔄 开始测试文本生成...');
    const result = await model.generateContent("Say hello in Chinese");
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ 文本生成成功:', text);
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    console.error('详细错误:', error);
  }
}

testGeminiAPI();