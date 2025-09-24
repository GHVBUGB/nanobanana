const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function updateApiKey() {
  console.log('🔧 API密钥配置工具\n');
  
  const envPath = path.join(__dirname, '.env.local');
  let envContent = '';
  
  // 读取现有的环境变量文件
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    console.log('✅ 找到现有的 .env.local 文件');
  } else {
    console.log('📝 将创建新的 .env.local 文件');
  }
  
  console.log('\n请选择要配置的API服务：');
  console.log('1. Google Gemini API');
  console.log('2. OpenRouter API');
  console.log('3. 两个都配置');
  
  const choice = await question('\n请输入选择 (1/2/3): ');
  
  let newEnvContent = envContent;
  
  if (choice === '1' || choice === '3') {
    console.log('\n🔑 配置 Google Gemini API');
    const geminiKey = await question('请输入 Gemini API 密钥 (AIzaSy...): ');
    
    if (geminiKey.trim()) {
      // 更新或添加 Gemini API 密钥
      if (newEnvContent.includes('GEMINI_API_KEY=')) {
        newEnvContent = newEnvContent.replace(/GEMINI_API_KEY=.*/, `GEMINI_API_KEY=${geminiKey.trim()}`);
      } else {
        newEnvContent += `\n# Google Gemini API 配置\nGEMINI_API_KEY=${geminiKey.trim()}\n`;
      }
      console.log('✅ Gemini API 密钥已配置');
    }
  }
  
  if (choice === '2' || choice === '3') {
    console.log('\n🌐 配置 OpenRouter API');
    const openrouterKey = await question('请输入 OpenRouter API 密钥 (sk-or-v1-...): ');
    
    if (openrouterKey.trim()) {
      // 更新或添加 OpenRouter API 配置
      const openrouterConfig = `
# OpenRouter API 配置
OPENROUTER_API_KEY=${openrouterKey.trim()}
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_IMAGE_MODEL=google/gemini-2.0-flash
OPENROUTER_MODEL=google/gemini-2.0-flash
OPENROUTER_HTTP_REFERER=http://localhost:3000
OPENROUTER_X_TITLE=AI Image Platform
OPENROUTER_IMAGE_SIZE=1024x1024
`;
      
      if (newEnvContent.includes('OPENROUTER_API_KEY=')) {
        // 替换现有配置
        newEnvContent = newEnvContent.replace(/OPENROUTER_API_KEY=.*/, `OPENROUTER_API_KEY=${openrouterKey.trim()}`);
      } else {
        newEnvContent += openrouterConfig;
      }
      console.log('✅ OpenRouter API 密钥已配置');
    }
  }
  
  // 确保有开发环境配置
  if (!newEnvContent.includes('NODE_ENV=')) {
    newEnvContent += '\n# 开发环境配置\nNODE_ENV=development\n';
  }
  
  // 写入文件
  fs.writeFileSync(envPath, newEnvContent);
  console.log('\n✅ 配置已保存到 .env.local 文件');
  
  // 询问是否测试API
  const testApi = await question('\n是否立即测试API连接？ (y/n): ');
  
  if (testApi.toLowerCase() === 'y' || testApi.toLowerCase() === 'yes') {
    console.log('\n🧪 开始测试API连接...');
    rl.close();
    
    // 运行测试脚本
    const { spawn } = require('child_process');
    const testProcess = spawn('node', ['test-api-key-validity.js'], {
      stdio: 'inherit'
    });
    
    testProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n🎉 API测试完成！');
        console.log('💡 提示：如果API有效，请重启开发服务器 (npm run dev)');
      } else {
        console.log('\n❌ API测试失败，请检查密钥是否正确');
      }
    });
  } else {
    console.log('\n💡 提示：');
    console.log('1. 重启开发服务器以加载新配置: npm run dev');
    console.log('2. 运行测试脚本验证API: node test-api-key-validity.js');
    rl.close();
  }
}

// 处理错误
process.on('unhandledRejection', (error) => {
  console.error('❌ 发生错误:', error.message);
  rl.close();
  process.exit(1);
});

// 处理 Ctrl+C
process.on('SIGINT', () => {
  console.log('\n\n👋 配置已取消');
  rl.close();
  process.exit(0);
});

updateApiKey().catch(console.error);