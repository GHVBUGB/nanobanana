// 测试用户提供的 Gemini API 密钥
const https = require('https');

const API_KEY = 'AIzaSyCQSQgP7VrfAByK2goPh3wvBQShl5rYK-w';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

async function testGeminiAPI() {
  console.log('🚀 开始测试 Gemini API 密钥...');
  console.log('🔑 API 密钥:', API_KEY.substring(0, 10) + '...');
  
  const postData = JSON.stringify({
    "contents": [
      {
        "parts": [
          {
            "text": "Explain how AI works in a few words"
          }
        ]
      }
    ]
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': API_KEY,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(API_URL, options, (res) => {
      let data = '';
      
      console.log('📊 响应状态码:', res.statusCode);
      console.log('📋 响应头:', res.headers);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ API 调用成功!');
            console.log('📝 响应内容:', JSON.stringify(response, null, 2));
            
            if (response.candidates && response.candidates.length > 0) {
              const text = response.candidates[0].content.parts[0].text;
              console.log('🤖 AI 回答:', text);
              resolve({ success: true, response: text });
            } else {
              console.log('⚠️  响应中没有找到内容');
              resolve({ success: false, error: '响应中没有找到内容' });
            }
          } else {
            console.log('❌ API 调用失败');
            console.log('🔍 错误详情:', JSON.stringify(response, null, 2));
            resolve({ success: false, error: response.error || '未知错误' });
          }
        } catch (parseError) {
          console.log('❌ 解析响应失败:', parseError.message);
          console.log('📄 原始响应:', data);
          resolve({ success: false, error: '解析响应失败: ' + parseError.message });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ 请求失败:', error.message);
      resolve({ success: false, error: '请求失败: ' + error.message });
    });
    
    req.write(postData);
    req.end();
  });
}

// 测试图片生成模型是否可用
async function testImageGeneration() {
  console.log('\n🖼️  测试图片生成模型...');
  
  const imageAPI = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent';
  
  const postData = JSON.stringify({
    "contents": [
      {
        "parts": [
          {
            "text": "Generate an image of a cute cat playing in a garden"
          }
        ]
      }
    ]
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-goog-api-key': API_KEY,
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(imageAPI, options, (res) => {
      let data = '';
      
      console.log('📊 图片生成响应状态码:', res.statusCode);
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 200) {
            console.log('✅ 图片生成 API 可用!');
            resolve({ success: true, response });
          } else {
            console.log('❌ 图片生成 API 不可用');
            console.log('🔍 错误详情:', JSON.stringify(response, null, 2));
            resolve({ success: false, error: response.error || '图片生成不可用' });
          }
        } catch (parseError) {
          console.log('❌ 解析图片生成响应失败:', parseError.message);
          resolve({ success: false, error: '解析响应失败: ' + parseError.message });
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ 图片生成请求失败:', error.message);
      resolve({ success: false, error: '请求失败: ' + error.message });
    });
    
    req.write(postData);
    req.end();
  });
}

// 运行所有测试
async function runAllTests() {
  try {
    // 测试文本生成
    const textResult = await testGeminiAPI();
    
    // 测试图片生成
    const imageResult = await testImageGeneration();
    
    console.log('\n📋 测试总结:');
    console.log('📝 文本生成:', textResult.success ? '✅ 可用' : '❌ 不可用');
    console.log('🖼️  图片生成:', imageResult.success ? '✅ 可用' : '❌ 不可用');
    
    if (textResult.success || imageResult.success) {
      console.log('\n🎉 API 密钥有效! 可以开始配置项目了。');
    } else {
      console.log('\n⚠️  API 密钥可能有问题，请检查密钥或权限设置。');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error);
  }
}

// 运行测试
runAllTests();