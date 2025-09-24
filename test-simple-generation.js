// 简单的图片生成测试
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

async function testImageGeneration() {
    try {
        console.log('测试图片生成...');
        
        const requestBody = JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [
                {
                    role: 'user',
                    content: '生成一张美丽的风景图片，包含山脉和湖泊'
                }
            ],
            modalities: ['image', 'text'],
            max_tokens: 1000
        });

        console.log('请求体:', requestBody);

        const response = await makeRequest('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'http://localhost:3000',
                'X-Title': 'AI Image Platform',
                'Content-Length': Buffer.byteLength(requestBody)
            },
            body: requestBody
        });

        console.log('响应状态:', response.status);
        console.log('响应状态文本:', response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('图片生成成功！');
            console.log('完整响应:', JSON.stringify(data, null, 2));
            
            // 检查响应中的图片
            if (data.choices && data.choices[0]) {
                const choice = data.choices[0];
                console.log('第一个选择:', JSON.stringify(choice, null, 2));
                
                if (choice.message && choice.message.content) {
                    console.log('消息内容:', choice.message.content);
                }
            }
        } else {
            const errorText = await response.text();
            console.log('图片生成失败!');
            console.log('错误响应:', errorText);
        }
    } catch (error) {
        console.error('测试过程中出错:', error.message);
    }
}

testImageGeneration();