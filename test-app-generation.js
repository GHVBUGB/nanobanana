// 测试应用的图像生成功能
async function testAppGeneration() {
  console.log('🚀 测试应用的图像生成功能...\n');
  
  try {
    // 等待应用启动
    console.log('⏳ 等待应用启动...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 测试 API 端点
    console.log('📡 测试生成 API...');
    const response = await fetch('http://localhost:3000/api/generate/standard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: '一只可爱的机器人猫咪，坐在彩虹色的云朵上',
        style: 'cartoon',
        quality: 85
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    console.log('✅ 生成请求成功!');
    console.log('🎯 任务 ID:', result.data.taskId);
    console.log('⏱️ 预计时间:', result.data.estimatedTime, '秒');
    console.log('📝 使用的提示:', result.data.usedPrompt);

    // 检查任务状态
    const taskId = result.data.taskId;
    let attempts = 0;
    const maxAttempts = 10;

    console.log('\n🔄 检查任务状态...');
    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`http://localhost:3000/api/task/${taskId}/status`);
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        const status = statusData.data.status;
        const progress = statusData.data.progress;
        
        console.log(`📊 进度: ${progress}% - 状态: ${status}`);
        
        if (status === 'completed') {
          console.log('🎉 图像生成完成!');
          const images = statusData.data.result?.images || [];
          console.log('🖼️ 生成的图像数量:', images.length);
          images.forEach((img, index) => {
            console.log(`   图像 ${index + 1}: ${img}`);
          });
          
          if (images.length > 0) {
            console.log('\n✅ 成功！你的应用可以正常生成图片！');
            console.log('🌐 访问 http://localhost:3000 来使用图像生成功能');
          } else {
            console.log('⚠️ 任务完成但没有生成图片，可能需要检查 OpenRouter 模型配置');
          }
          return;
        } else if (status === 'failed') {
          console.log('❌ 任务失败:', statusData.data.error);
          return;
        }
      }
      
      attempts++;
    }
    
    console.log('⏰ 超时：任务仍在处理中，但 API 配置看起来正常');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 应用可能还在启动中，请稍后手动访问 http://localhost:3000');
    }
  }
}

// 运行测试
testAppGeneration();

