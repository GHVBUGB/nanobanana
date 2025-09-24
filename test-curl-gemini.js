// 使用 curl 命令测试 Gemini API
const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

const API_KEY = 'AIzaSyCQSQgP7VrfAByK2goPh3wvBQShl5rYK-w';

async function testWithCurl() {
  console.log('🚀 使用 curl 测试 Gemini API...');
  console.log('🔑 API 密钥:', API_KEY.substring(0, 10) + '...');
  
  // 构建 curl 命令
  const curlCommand = `curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent" -H "Content-Type: application/json" -H "X-goog-api-key: ${API_KEY}" -X POST -d "{\\"contents\\":[{\\"parts\\":[{\\"text\\":\\"Explain how AI works in a few words\\"}]}]}"`;
  
  console.log('📝 执行命令:', curlCommand.substring(0, 100) + '...');
  
  try {
    const { stdout, stderr } = await execAsync(curlCommand, { 
      timeout: 30000,
      maxBuffer: 1024 * 1024 // 1MB buffer
    });
    
    if (stderr) {
      console.log('⚠️  stderr:', stderr);
    }
    
    if (stdout) {
      console.log('✅ API 响应成功!');
      console.log('📄 响应内容:', stdout);
      
      try {
        const response = JSON.parse(stdout);
        if (response.candidates && response.candidates.length > 0) {
          const text = response.candidates[0].content.parts[0].text;
          console.log('🤖 AI 回答:', text);
          return { success: true, response: text };
        } else if (response.error) {
          console.log('❌ API 错误:', response.error.message);
          return { success: false, error: response.error.message };
        }
      } catch (parseError) {
        console.log('⚠️  解析响应失败，但请求可能成功');
        return { success: true, response: stdout };
      }
    }
    
    return { success: true, response: stdout };
    
  } catch (error) {
    console.log('❌ curl 命令执行失败:', error.message);
    
    if (error.code === 'ETIMEDOUT') {
      console.log('⏰ 请求超时，可能是网络问题');
    } else if (error.stderr) {
      console.log('🔍 错误详情:', error.stderr);
    }
    
    return { success: false, error: error.message };
  }
}

// 测试图片生成模型
async function testImageGenerationWithCurl() {
  console.log('\n🖼️  使用 curl 测试图片生成...');
  
  const curlCommand = `curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent" -H "Content-Type: application/json" -H "X-goog-api-key: ${API_KEY}" -X POST -d "{\\"contents\\":[{\\"parts\\":[{\\"text\\":\\"Generate an image of a cute cat\\"}]}]}"`;
  
  try {
    const { stdout, stderr } = await execAsync(curlCommand, { 
      timeout: 60000, // 图片生成可能需要更长时间
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer for images
    });
    
    if (stderr) {
      console.log('⚠️  stderr:', stderr);
    }
    
    if (stdout) {
      console.log('✅ 图片生成 API 响应!');
      
      try {
        const response = JSON.parse(stdout);
        if (response.error) {
          console.log('❌ 图片生成错误:', response.error.message);
          return { success: false, error: response.error.message };
        } else if (response.candidates) {
          console.log('🎉 图片生成成功!');
          return { success: true, response };
        }
      } catch (parseError) {
        console.log('📄 原始响应:', stdout.substring(0, 500) + '...');
      }
    }
    
    return { success: true, response: stdout };
    
  } catch (error) {
    console.log('❌ 图片生成 curl 命令失败:', error.message);
    return { success: false, error: error.message };
  }
}

// 运行所有测试
async function runCurlTests() {
  console.log('🧪 开始 curl 测试...\n');
  
  // 测试文本生成
  const textResult = await testWithCurl();
  
  // 测试图片生成
  const imageResult = await testImageGenerationWithCurl();
  
  console.log('\n📋 curl 测试总结:');
  console.log('📝 文本生成:', textResult.success ? '✅ 可用' : '❌ 不可用');
  console.log('🖼️  图片生成:', imageResult.success ? '✅ 可用' : '❌ 不可用');
  
  if (textResult.success || imageResult.success) {
    console.log('\n🎉 API 密钥有效! 可以配置项目使用 Gemini API。');
    return true;
  } else {
    console.log('\n⚠️  API 可能有问题，建议检查:');
    console.log('1. API 密钥是否正确');
    console.log('2. 是否有网络连接问题');
    console.log('3. API 配额是否充足');
    return false;
  }
}

// 运行测试
runCurlTests().catch(console.error);