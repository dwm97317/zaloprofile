// 测试后端 API 的 Node.js 脚本
const https = require('https');
const http = require('http');

// 测试 API 请求的函数
function testAPI(url, method = 'GET', data = null) {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const isHttps = urlObj.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const options = {
            hostname: urlObj.hostname,
            port: urlObj.port || (isHttps ? 443 : 80),
            path: urlObj.pathname + urlObj.search,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Node.js Test Client'
            }
        };
        
        if (data && method === 'POST') {
            const postData = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(postData);
        }
        
        const req = client.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: jsonData
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData
                    });
                }
            });
        });
        
        req.on('error', (error) => {
            reject(error);
        });
        
        if (data && method === 'POST') {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

// 测试函数
async function runTests() {
    console.log('🚀 开始测试后端 API...\n');
    
    // 测试1: 获取 OAuth URL
    console.log('📝 测试1: 获取 Zalo OAuth URL');
    try {
        const result1 = await testAPI(
            'https://zalonew.itaoth.com/index.php?s=api/passport/getZaloOAuthUrl',
            'POST',
            { wxapp_id: '10001' }
        );
        console.log('状态码:', result1.status);
        console.log('响应:', JSON.stringify(result1.data, null, 2));
        
        if (result1.data.code === 1) {
            console.log('✅ OAuth URL 获取成功');
        } else {
            console.log('❌ OAuth URL 获取失败:', result1.data.msg);
        }
    } catch (error) {
        console.log('❌ 请求失败:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 测试2: 检查登录状态
    console.log('📝 测试2: 检查 OAuth 登录状态');
    try {
        const result2 = await testAPI(
            'https://zalonew.itaoth.com/index.php?s=api/passport/checkZaloOAuthStatus',
            'POST',
            { wxapp_id: '10001', state: 'test_state' }
        );
        console.log('状态码:', result2.status);
        console.log('响应:', JSON.stringify(result2.data, null, 2));
        
        if (result2.data.code === 1) {
            console.log('✅ 状态检查成功');
        } else {
            console.log('❌ 状态检查失败:', result2.data.msg);
        }
    } catch (error) {
        console.log('❌ 请求失败:', error.message);
    }
    
    console.log('\n' + '='.repeat(50) + '\n');
    
    // 测试3: 获取站点 URL (不需要 wxapp_id 验证的接口)
    console.log('📝 测试3: 获取站点 URL');
    try {
        const result3 = await testAPI(
            'https://zalonew.itaoth.com/index.php?s=api/user/getSiteUrl',
            'GET'
        );
        console.log('状态码:', result3.status);
        console.log('响应:', JSON.stringify(result3.data, null, 2));
        
        if (result3.data.code === 1) {
            console.log('✅ 站点 URL 获取成功');
        } else {
            console.log('❌ 站点 URL 获取失败:', result3.data.msg);
        }
    } catch (error) {
        console.log('❌ 请求失败:', error.message);
    }
    
    console.log('\n🏁 测试完成');
}

// 运行测试
runTests().catch(console.error);
