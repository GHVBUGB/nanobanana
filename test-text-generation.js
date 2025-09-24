// 文本生成测试脚本
const apiKey = 'sk-or-v1-8fe80115f590f34c9db8d3969fae79649e7272f50063e7c01843a5e60684640';

async function testTextGeneration() {
  try {
    console.log('🔍 详细测试文本生成功能...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'AI Image Platform Test',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.2-3b-instruct:free',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert at creating detailed prompts for AI image generation.' 
          },
          { 
            role: 'user', 
            content: '请为以下主题创建一个详细的AI图像生成提示: 一只可爱的机器人猫咪' 
          },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    console.log('📊 响应状态:', response.status);
    console.log('📋 响应头:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 响应内容:', responseText);
    
    if (response.ok) {
      const data = JSON.parse(responseText);
      console.log('✅ 解析成功:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ 请求失败');
      
      // 尝试解析错误信息
      try {
        const errorData = JSON.parse(responseText);
        console.log('🔍 错误详情:', JSON.stringify(errorData, null, 2));
      } catch (parseError) {
        console.log('🔍 原始错误响应:', responseText);
      }
    }
    
  } catch (error) {
    console.error('❌ 网络或其他错误:', error.message);
    console.error('📋 完整错误:', error);
  }
}

// 测试不同的模型
async function testDifferentModels() {
  const models = [
    'meta-llama/llama-3.2-3b-instruct:free',
    'google/gemini-flash-1.5',
    'openai/gpt-3.5-turbo',
    'anthropic/claude-3-haiku'
  ];
  
  for (const model of models) {
    console.log(`\n🧪 测试模型: ${model}`);
    
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'AI Image Platform Test',
        },
        body: JSON.stringify({
          model: model,
          messages: [
            { 
              role: 'user', 
              content: 'Hello, can you respond with just "OK"?' 
            },
          ],
          max_tokens: 10,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${model}: 工作正常`);
      } else {
        const errorText = await response.text();
        console.log(`❌ ${model}: 失败 (${response.status}) - ${errorText.substring(0, 100)}`);
      }
    } catch (error) {
      console.log(`❌ ${model}: 网络错误 - ${error.message}`);
    }
  }
}

console.log('🚀 开始文本生成测试...\n');

// 运行测试
testTextGeneration().then(() => {
  console.log('\n🔄 测试不同模型的可用性...');
  return testDifferentModels();
}).then(() => {
  console.log('\n✅ 所有测试完成');
});