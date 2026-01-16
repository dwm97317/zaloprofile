/**
 * LINE Login Test with Playwright
 * 测试 LINE 登录功能是否正常工作
 */

const { chromium } = require('playwright');

async function testLineLogin() {
    console.log('🚀 Starting LINE Login Test...\n');
    
    const browser = await chromium.launch({ 
        headless: false,
        slowMo: 1000 // 放慢操作以便观察
    });
    
    const context = await browser.newContext({
        viewport: { width: 375, height: 667 }, // iPhone size
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
    });
    
    const page = await context.newPage();
    
    // 监听控制台日志
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        
        if (type === 'error') {
            console.log('❌ Console Error:', text);
        } else if (text.includes('LIFF') || text.includes('LINE') || text.includes('login')) {
            console.log(`📱 ${text}`);
        }
    });
    
    // 监听网络请求
    page.on('response', async response => {
        const url = response.url();
        
        if (url.includes('login_mp_line')) {
            console.log('\n🔐 Login API Request:', url);
            console.log('   Status:', response.status());
            
            try {
                const body = await response.json();
                console.log('   Response:', JSON.stringify(body, null, 2));
                
                if (body.code === 1) {
                    console.log('✅ Login successful!');
                    console.log('   User ID:', body.data.userId);
                    console.log('   Token:', body.data.token.substring(0, 20) + '...');
                } else {
                    console.log('❌ Login failed:', body.msg);
                }
            } catch (e) {
                const text = await response.text();
                console.log('   Response (text):', text.substring(0, 200));
            }
        }
    });
    
    try {
        // 访问应用
        console.log('📱 Opening application at http://localhost:3001\n');
        await page.goto('http://localhost:3001', { 
            waitUntil: 'networkidle',
            timeout: 30000 
        });
        
        // 等待页面加载
        await page.waitForTimeout(3000);
        
        // 检查 localStorage
        const token = await page.evaluate(() => localStorage.getItem('token'));
        const userId = await page.evaluate(() => localStorage.getItem('userId'));
        
        console.log('\n📊 Final State:');
        console.log('   Token:', token ? token.substring(0, 30) + '...' : 'Not set');
        console.log('   User ID:', userId || 'Not set');
        
        // 截图
        await page.screenshot({ 
            path: 'zalo_mini_app-master/line-login-test-result.png',
            fullPage: true 
        });
        console.log('\n📸 Screenshot saved: line-login-test-result.png');
        
        // 检查是否有错误
        const hasError = await page.evaluate(() => {
            return document.body.innerText.includes('Error') || 
                   document.body.innerText.includes('错误');
        });
        
        if (hasError) {
            console.log('\n⚠️  Page contains error messages');
        }
        
        // 等待一段时间以便观察
        console.log('\n⏳ Waiting 5 seconds for observation...');
        await page.waitForTimeout(5000);
        
        if (token && !token.startsWith('dev-token-')) {
            console.log('\n✅ TEST PASSED: Real token obtained');
            return true;
        } else if (token && token.startsWith('dev-token-')) {
            console.log('\n⚠️  TEST WARNING: Using dev token (LINE not configured or failed)');
            return false;
        } else {
            console.log('\n❌ TEST FAILED: No token obtained');
            return false;
        }
        
    } catch (error) {
        console.error('\n❌ Test Error:', error.message);
        
        // 错误截图
        await page.screenshot({ 
            path: 'zalo_mini_app-master/line-login-test-error.png',
            fullPage: true 
        });
        console.log('📸 Error screenshot saved: line-login-test-error.png');
        
        return false;
    } finally {
        await browser.close();
        console.log('\n🏁 Test completed\n');
    }
}

// 运行测试
testLineLogin()
    .then(success => {
        process.exit(success ? 0 : 1);
    })
    .catch(error => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
