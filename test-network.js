// 测试网络连接和API可达性
const https = require('https');

async function testNetworkConnection() {
  console.log('🔍 测试网络连接...');
  
  // 测试基本网络连接
  try {
    console.log('🔄 测试 Google 连接...');
    await testHttpsRequest('https://www.google.com');
    console.log('✅ Google 连接正常');
  } catch (error) {
    console.error('❌ Google 连接失败:', error.message);
  }
  
  // 测试 Gemini API 端点
  try {
    console.log('🔄 测试 Gemini API 端点...');
    await testHttpsRequest('https://generativelanguage.googleapis.com');
    console.log('✅ Gemini API 端点可达');
  } catch (error) {
    console.error('❌ Gemini API 端点不可达:', error.message);
  }
  
  // 测试具体的API调用
  try {
    console.log('🔄 测试 Gemini API 调用...');
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': 'AIzaSyCQSQgP7VrfAByK2goPh3wvBQShl5rYK-w'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "Hello"
          }]
        }]
      })
    });
    
    console.log('📊 响应状态:', response.status);
    console.log('📊 响应头:', Object.fromEntries(response.headers.entries()));
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ API 调用成功:', data);
    } else {
      const errorText = await response.text();
      console.error('❌ API 调用失败:', errorText);
    }
    
  } catch (error) {
    console.error('❌ API 调用异常:', error.message);
  }
}

function testHttpsRequest(url) {
  return new Promise((resolve, reject) => {
    const request = https.get(url, (response) => {
      if (response.statusCode >= 200 && response.statusCode < 400) {
        resolve(response.statusCode);
      } else {
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    });
    
    request.on('error', reject);
    request.setTimeout(10000, () => {
      request.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

testNetworkConnection();