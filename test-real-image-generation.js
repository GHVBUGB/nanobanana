// 测试真实图片生成功能
async function testImageGeneration() {
  const headers = {
    'Authorization': 'Bearer sk-or-v1-8fe80115f590f34c9db8d3969fae79649e7272f50063e7c01843a5e60684640',
    'Content-Type': 'application/json',
    'HTTP-Referer': 'http://localhost:3000',
    'X-Title': 'AI Image Platform'
  };

  const body = {
    model: 'google/gemini-2.5-flash-image-preview',
    messages: [
      {
        role: 'user',
        content: 'Generate a beautiful sunset over mountains'
      }
    ],
    modalities: ['image', 'text']
  };

  console.log('发送请求...');
  console.log('请求体:', JSON.stringify(body, null, 2));

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(body)
    });

    console.log('响应状态:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('响应内容长度:', responseText.length);
    console.log('响应内容前500字符:', responseText.substring(0, 500));

    if (response.ok) {
      try {
        const json = JSON.parse(responseText);
        console.log('成功解析JSON');
        
        if (json.choices && json.choices[0] && json.choices[0].message) {
          const message = json.choices[0].message;
          console.log('消息内容:', message.content);
          
          if (message.images) {
            console.log('找到图片数量:', message.images.length);
            message.images.forEach((img, index) => {
              console.log(`图片 ${index + 1}:`, img.image_url?.url?.substring(0, 100) + '...');
            });
          } else {
            console.log('未找到images字段');
          }
        }
      } catch (parseError) {
        console.error('JSON解析错误:', parseError.message);
      }
    } else {
      console.error('请求失败:', responseText);
    }
  } catch (error) {
    console.error('请求错误:', error.message);
  }
}

testImageGeneration();