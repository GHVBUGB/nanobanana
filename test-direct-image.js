require('dotenv').config({ path: '.env.local' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_IMAGE_MODEL = process.env.OPENROUTER_IMAGE_MODEL || 'google/gemini-2.5-flash-image-preview';

console.log('🧪 测试直接图片生成接口...');
console.log(`🔑 API Key 状态: ${OPENROUTER_API_KEY ? '已设置' : '未设置'}`);
console.log(`🎨 图片模型: ${OPENROUTER_IMAGE_MODEL}`);

async function testDirectImageGeneration() {
  if (!OPENROUTER_API_KEY) {
    console.error('❌ API Key 未设置');
    return;
  }

  try {
    console.log('\n📸 测试图片生成接口...');
    
    const requestBody = {
      model: OPENROUTER_IMAGE_MODEL,
      prompt: "A beautiful sunset over mountains",
      n: 1,
      size: "1024x1024"
    };

    console.log('📤 请求参数:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Image Platform',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`📥 响应状态: ${response.status} ${response.statusText}`);

    const responseText = await response.text();
    console.log('📄 响应内容:', responseText);

    if (response.ok) {
      try {
        const json = JSON.parse(responseText);
        console.log('✅ 图片生成接口成功!');
        console.log('🖼️ 生成的图片数量:', json.data?.length || 0);
        if (json.data && json.data.length > 0) {
          json.data.forEach((img, index) => {
            console.log(`   图片 ${index + 1}: ${img.url || img.b64_json ? '有数据' : '无数据'}`);
          });
        }
        return true;
      } catch (parseError) {
        console.log('⚠️ 响应不是有效的JSON，但状态码正常');
        return true;
      }
    } else {
      console.log('❌ 图片生成接口失败');
      return false;
    }

  } catch (error) {
    console.error('💥 请求过程中发生错误:', error.message);
    return false;
  }
}

// 运行测试
testDirectImageGeneration().then(success => {
  if (success) {
    console.log('\n🎉 图片生成接口可以直接工作，不需要依赖文本生成!');
  } else {
    console.log('\n⚠️ 图片生成接口无法直接工作，需要修改代码逻辑');
  }
});