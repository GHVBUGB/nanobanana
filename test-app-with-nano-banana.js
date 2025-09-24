// 测试应用的图像生成功能（使用 nano banana API）
require('dotenv').config({ path: '.env.local' });

const API_BASE_URL = 'http://localhost:3000';

console.log('🧪 测试应用的图像生成功能...\n');

async function testAppImageGeneration() {
  try {
    console.log('📡 发送图像生成请求到应用...');
    
    const requestBody = {
      description: '生成一张可爱的机器人猫咪图片，坐在彩虹云朵上，卡通风格',
      style: '卡通',
      quality: '高质量'
    };
    
    // 测试标准图像生成接口
    const response = await fetch(`${API_BASE_URL}/api/generate/standard`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    
    console.log(`📊 响应状态: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ 请求失败:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ 初始响应成功!');
    console.log('📝 任务ID:', data.data?.taskId);
    console.log('📝 使用的提示词:', data.data?.usedPrompt);
    console.log('⏱️ 预估时间:', data.data?.estimatedTime, '秒');
    
    const taskId = data.data?.taskId;
    if (!taskId) {
      console.error('❌ 未获取到任务ID');
      return;
    }
    
    // 轮询任务状态
    console.log('\n🔄 开始轮询任务状态...');
    let attempts = 0;
    const maxAttempts = 20;
    
    while (attempts < maxAttempts) {
      attempts++;
      console.log(`\n📊 第 ${attempts} 次查询任务状态...`);
      
      try {
        const statusResponse = await fetch(`${API_BASE_URL}/api/generate/standard?taskId=${taskId}`);
        
        if (!statusResponse.ok) {
          console.error('❌ 状态查询失败:', statusResponse.status);
          break;
        }
        
        const statusData = await statusResponse.json();
        const status = statusData.data;
        
        console.log(`📈 任务状态: ${status.status}`);
        console.log(`📊 进度: ${status.progress}%`);
        
        if (status.status === 'completed') {
          console.log('\n🎉 任务完成!');
          console.log('🖼️ 生成的图像数量:', status.result?.images?.length || 0);
          
          if (status.result?.images && status.result.images.length > 0) {
            console.log('📸 生成的图像URL:');
            status.result.images.forEach((url, index) => {
              console.log(`   ${index + 1}. ${url}`);
            });
            
            // 检查是否是真实的图像URL还是占位符
            const realImages = status.result.images.filter(url => 
              !url.includes('placeholder') && 
              (url.startsWith('http') || url.startsWith('https'))
            );
            
            if (realImages.length > 0) {
              console.log('\n✅ 成功生成真实图像!');
              console.log('🎯 真实图像数量:', realImages.length);
              console.log('🔗 真实图像URL:');
              realImages.forEach((url, index) => {
                console.log(`   ${index + 1}. ${url}`);
              });
            } else {
              console.log('\n⚠️ 生成的是占位符图像');
              console.log('💡 这可能表示 nano banana API 配置需要进一步调整');
            }
          } else {
            console.log('❌ 未生成任何图像');
          }
          
          break;
        } else if (status.status === 'failed') {
          console.log('\n❌ 任务失败!');
          console.log('错误信息:', status.error || '未知错误');
          break;
        } else {
          console.log('⏳ 任务进行中，等待 2 秒后继续查询...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
      } catch (error) {
        console.error('❌ 状态查询出错:', error.message);
        break;
      }
    }
    
    if (attempts >= maxAttempts) {
      console.log('\n⏰ 查询超时，任务可能仍在进行中');
    }
    
  } catch (error) {
    console.error('❌ 测试过程中发生错误:', error.message);
  }
}

// 运行测试
testAppImageGeneration();