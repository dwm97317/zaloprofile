// 测试前端 API 调用的脚本
const https = require('https');
const http = require('http');

function simpleTest(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        }).on('error', reject);
    });
}

async function testFrontendAPI() {
    console.log('🚀 开始测试前端和后端 API...\n');

    // 测试1: 前端页面加载
    console.log('📝 测试1: 前端页面加载');
    try {
        const result = await simpleTest('http://localhost:3000/');
        if (result.status === 200) {
            console.log('✅ 前端页面加载成功 (状态码: 200)');

            // 检查页面内容
            if (result.data.includes('zalo-frame')) {
                console.log('✅ 页面包含 Zalo 框架结构');
            }
            if (result.data.includes('app-config.json')) {
                console.log('✅ 页面包含应用配置加载');
            }
        } else {
            console.log('❌ 前端页面加载失败，状态码:', result.status);
        }
    } catch (error) {
        console.log('❌ 前端页面测试失败:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 测试2: 后端 getSiteUrl API
    console.log('📝 测试2: 后端 getSiteUrl API');
    try {
        const result = await simpleTest('https://zalonew.itaoth.com/index.php?s=api/user/getSiteUrl');
        console.log('后端 API 响应状态:', result.status);
        if (result.data) {
            try {
                const jsonData = JSON.parse(result.data);
                console.log('后端 API 响应:', JSON.stringify(jsonData, null, 2));

                if (jsonData.code === 1) {
                    console.log('✅ getSiteUrl API 调用成功');
                } else {
                    console.log('❌ getSiteUrl API 调用失败:', jsonData.msg);
                }
            } catch (e) {
                console.log('后端 API 响应 (非JSON):', result.data.substring(0, 200));
            }
        }
    } catch (error) {
        console.log('❌ 后端 getSiteUrl API 测试失败:', error.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // 测试3: 后端 OAuth API
    console.log('📝 测试3: 后端 OAuth API');
    try {
        const result = await testPostAPI(
            'https://zalonew.itaoth.com/index.php?s=api/passport/getZaloOAuthUrl',
            { wxapp_id: '10001' }
        );
        console.log('OAuth API 响应状态:', result.status);
        if (result.data) {
            try {
                const jsonData = JSON.parse(result.data);
                console.log('OAuth API 响应:', JSON.stringify(jsonData, null, 2));

                if (jsonData.code === 1) {
                    console.log('✅ OAuth API 调用成功');
                } else {
                    console.log('❌ OAuth API 调用失败:', jsonData.msg);
                }
            } catch (e) {
                console.log('OAuth API 响应 (非JSON):', result.data.substring(0, 200));
            }
        }
    } catch (error) {
        console.log('❌ 后端 OAuth API 测试失败:', error.message);
    }

    console.log('\n🏁 前端和后端 API 测试完成');
}

function testPostAPI(url, data) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;

        const postData = JSON.stringify(data);
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                'User-Agent': 'Node.js Test Client'
            }
        };

        const req = client.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            res.on('end', () => {
                resolve({
                    status: res.statusCode,
                    data: responseData
                });
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// 运行测试
testFrontendAPI().catch(console.error);
