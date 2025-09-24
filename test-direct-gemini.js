const https = require('https');
const http = require('http');

// 测试用的API密钥
const API_KEY = 'AIzaSyDyPa9I8NiiMYSk-lBd5ERmba6YWNGVhh0';

async function testDirectGeminiAPI() {
  console.log('🔍 直接测试 Gemini API 连接...\n');
  
  // 测试数据
  const requestData = JSON.stringify({
    contents: [{
      parts: [{
        text: "Say hello in one word"
      }]
    }]
  });
  
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    port: 443,
    path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(requestData)
    },
    timeout: 10000
  };
  
  return new Promise((resolve, reject) => {
    console.log('🌐 发送请求到:', `https://${options.hostname}${options.path}`);
    console.log('📝 请求数据:', requestData);
    
    const req = https.request(options, (res) => {
      console.log('📊 响应状态码:', res.statusCode);
      console.log('📋 响应头:', JSON.stringify(res.headers, null, 2));
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📄 响应内容:', data);
        
        if (res.statusCode === 200) {
          try {
            const response = JSON.parse(data);
            if (response.candidates && response.candidates[0]) {
              const text = response.candidates[0].content.parts[0].text;
              console.log('✅ API 调用成功!');
              console.log('🎉 生成的文本:', text);
              resolve(true);
            } else {
              console.log('⚠️ 响应格式异常');
              resolve(false);
            }
          } catch (error) {
            console.log('❌ 解析响应失败:', error.message);
            resolve(false);
          }
        } else {
          console.log('❌ API 调用失败，状态码:', res.statusCode);
          try {
            const errorResponse = JSON.parse(data);
            console.log('错误详情:', JSON.stringify(errorResponse, null, 2));
          } catch (e) {
            console.log('原始错误响应:', data);
          }
          resolve(false);
        }
      });
    });
    
    req.on('error', (error) => {
      console.log('❌ 请求错误:', error.message);
      console.log('错误类型:', error.code);
      
      if (error.code === 'ENOTFOUND') {
        console.log('🚨 DNS解析失败，无法找到服务器');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('🚨 连接被拒绝');
      } else if (error.code === 'ETIMEDOUT') {
        console.log('🚨 连接超时');
      }
      
      resolve(false);
    });
    
    req.on('timeout', () => {
      console.log('⏰ 请求超时');
      req.destroy();
      resolve(false);
    });
    
    req.write(requestData);
    req.end();
  });
}

async function testBasicConnectivity() {
  console.log('🔍 测试基础网络连接...\n');
  
  // 测试DNS解析
  const dns = require('dns');
  
  return new Promise((resolve) => {
    dns.lookup('generativelanguage.googleapis.com', (err, address) => {
      if (err) {
        console.log('❌ DNS解析失败:', err.message);
        console.log('🚨 无法解析 generativelanguage.googleapis.com');
        resolve(false);
      } else {
        console.log('✅ DNS解析成功:', address);
        resolve(true);
      }
    });
  });
}

async function main() {
  console.log('🚀 开始 Gemini API 直接连接测试...\n');
  
  // 测试基础连接
  const dnsOk = await testBasicConnectivity();
  
  if (!dnsOk) {
    console.log('\n🚨 基础网络连接失败，无法继续测试');
    console.log('💡 建议：');
    console.log('1. 检查网络连接');
    console.log('2. 检查防火墙设置');
    console.log('3. 尝试使用VPN');
    return;
  }
  
  console.log('\n' + '='.repeat(50));
  
  // 测试API调用
  const apiOk = await testDirectGeminiAPI();
  
  console.log('\n' + '='.repeat(50));
  console.log('📊 测试结果总结:');
  console.log(`DNS解析: ${dnsOk ? '✅ 成功' : '❌ 失败'}`);
  console.log(`API调用: ${apiOk ? '✅ 成功' : '❌ 失败'}`);
  
  if (apiOk) {
    console.log('\n🎉 API密钥有效！可以正常使用');
  } else if (dnsOk) {
    console.log('\n⚠️ 网络连接正常，但API调用失败');
    console.log('可能原因：');
    console.log('1. API密钥无效或过期');
    console.log('2. API配额不足');
    console.log('3. 地区限制');
  }
}

main().catch(console.error);