// 测试OpenRouter API密钥有效性
const https = require('https');

const API_KEY = 'sk-or-v1-8fe80115f590f34c9db8d3969fae79649e7272f50063e7c01843a5e60684640';

function makeRequest(url, options) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    statusText: res.statusMessage,
                    ok: res.statusCode >= 200 && res.statusCode < 300,
                    text: () => Promise.resolve(data),
                    json: () => Promise.resolve(JSON.parse(data))
                });
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

async function testAPIKey() {
    try {
        console.log('测试API密钥有效性...');
        
        // 使用简单的模型列表端点测试认证
        const response = await makeRequest('https://openrouter.ai/api/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'AI Image Platform'
            }
        });

        console.log('响应状态:', response.status);
        console.log('响应状态文本:', response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('API密钥有效！');
            console.log('可用模型数量:', data.data ? data.data.length : 0);
            
            // 检查是否有图像生成模型
            if (data.data) {
                const imageModels = data.data.filter(model => 
                    model.id.includes('image') || 
                    model.id.includes('vision') ||
                    model.id.includes('gemini-2.5-flash-image-preview')
                );
                console.log('图像相关模型数量:', imageModels.length);
                
                const targetModel = data.data.find(model => 
                    model.id === 'google/gemini-2.5-flash-image-preview'
                );
                if (targetModel) {
                    console.log('找到目标模型:', targetModel.id);
                    console.log('模型详情:', JSON.stringify(targetModel, null, 2));
                } else {
                    console.log('未找到目标模型: google/gemini-2.5-flash-image-preview');
                }
            }
        } else {
            const errorText = await response.text();
            console.log('API密钥验证失败!');
            console.log('错误响应:', errorText);
        }
    } catch (error) {
        console.error('测试过程中出错:', error.message);
    }
}

async function testAccountStatus() {
    try {
        console.log('\n测试账户状态...');
        
        // 测试账户信息端点
        const response = await makeRequest('https://openrouter.ai/api/v1/auth/key', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'AI Image Platform'
            }
        });

        console.log('账户状态响应:', response.status);
        
        if (response.ok) {
            const data = await response.json();
            console.log('账户信息:', JSON.stringify(data, null, 2));
        } else {
            const errorText = await response.text();
            console.log('账户状态检查失败:', errorText);
        }
    } catch (error) {
        console.error('账户状态检查出错:', error.message);
    }
}

async function runTests() {
    await testAPIKey();
    await testAccountStatus();
}

runTests();