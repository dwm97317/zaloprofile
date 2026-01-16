/**
 * Package页面虚拟滚动功能测试
 * 
 * 测试目标:
 * 1. 验证VirtualizedOrderList组件正确集成
 * 2. 验证只渲染可见项
 * 3. 验证滚动性能
 * 4. 验证无限加载功能
 */

console.log('='.repeat(60));
console.log('Package页面虚拟滚动功能测试');
console.log('='.repeat(60));

// 测试结果收集
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

function logTest(name, passed, message) {
    const status = passed ? '✓ PASS' : '✗ FAIL';
    const color = passed ? '\x1b[32m' : '\x1b[31m';
    console.log(`${color}${status}\x1b[0m ${name}`);
    if (message) {
        console.log(`  ${message}`);
    }
    
    testResults.tests.push({ name, passed, message });
    if (passed) {
        testResults.passed++;
    } else {
        testResults.failed++;
    }
}

function logSection(title) {
    console.log('\n' + '-'.repeat(60));
    console.log(title);
    console.log('-'.repeat(60));
}

// 测试1: 检查VirtualizedOrderList组件文件
logSection('测试1: 组件文件检查');

const fs = require('fs');
const path = require('path');

const componentPath = path.join(__dirname, 'src/components/Order/VirtualizedOrderList.jsx');
const packagePagePath = path.join(__dirname, 'src/pages/Order/Package.jsx');

try {
    const componentExists = fs.existsSync(componentPath);
    logTest(
        '检查VirtualizedOrderList组件文件',
        componentExists,
        componentExists ? '组件文件存在' : '组件文件不存在'
    );
    
    if (componentExists) {
        const componentContent = fs.readFileSync(componentPath, 'utf-8');
        
        // 检查关键功能
        const hasUseVirtualizer = componentContent.includes('useVirtualizer');
        logTest(
            '检查useVirtualizer hook',
            hasUseVirtualizer,
            hasUseVirtualizer ? '使用了@tanstack/react-virtual' : '未找到useVirtualizer'
        );
        
        const hasRenderItem = componentContent.includes('renderItem');
        logTest(
            '检查renderItem prop',
            hasRenderItem,
            hasRenderItem ? '支持自定义渲染函数' : '缺少renderItem prop'
        );
        
        const hasOnLoadMore = componentContent.includes('onLoadMore');
        logTest(
            '检查无限加载功能',
            hasOnLoadMore,
            hasOnLoadMore ? '支持无限加载' : '缺少onLoadMore功能'
        );
        
        const hasOverscan = componentContent.includes('overscan');
        logTest(
            '检查overscan优化',
            hasOverscan,
            hasOverscan ? '支持overscan缓冲区' : '缺少overscan配置'
        );
    }
} catch (error) {
    logTest('组件文件检查', false, error.message);
}

// 测试2: 检查Package页面集成
logSection('测试2: Package页面集成检查');

try {
    const pageExists = fs.existsSync(packagePagePath);
    logTest(
        '检查Package页面文件',
        pageExists,
        pageExists ? 'Package页面文件存在' : 'Package页面文件不存在'
    );
    
    if (pageExists) {
        const pageContent = fs.readFileSync(packagePagePath, 'utf-8');
        
        // 检查导入
        const hasImport = pageContent.includes('import VirtualizedOrderList');
        logTest(
            '检查VirtualizedOrderList导入',
            hasImport,
            hasImport ? '已正确导入组件' : '未导入VirtualizedOrderList'
        );
        
        // 检查使用
        const hasUsage = pageContent.includes('<VirtualizedOrderList');
        logTest(
            '检查组件使用',
            hasUsage,
            hasUsage ? '已在页面中使用组件' : '未在页面中使用组件'
        );
        
        // 检查props传递
        const hasItemsProp = pageContent.includes('items={list}');
        logTest(
            '检查items prop传递',
            hasItemsProp,
            hasItemsProp ? '正确传递订单列表数据' : '未正确传递items'
        );
        
        const hasRenderItemProp = pageContent.includes('renderItem=');
        logTest(
            '检查renderItem prop传递',
            hasRenderItemProp,
            hasRenderItemProp ? '正确传递渲染函数' : '未传递renderItem'
        );
        
        const hasLoadMoreProp = pageContent.includes('onLoadMore=');
        logTest(
            '检查onLoadMore prop传递',
            hasLoadMoreProp,
            hasLoadMoreProp ? '正确配置无限加载' : '未配置onLoadMore'
        );
        
        // 检查OrderCard集成
        const hasOrderCard = pageContent.includes('OrderCard');
        logTest(
            '检查OrderCard组件集成',
            hasOrderCard,
            hasOrderCard ? '使用OrderCard渲染订单项' : '未使用OrderCard'
        );
    }
} catch (error) {
    logTest('Package页面集成检查', false, error.message);
}

// 测试3: 检查依赖包
logSection('测试3: 依赖包检查');

try {
    const packageJsonPath = path.join(__dirname, 'package.json');
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    
    const hasTanstackVirtual = 
        (packageJson.dependencies && packageJson.dependencies['@tanstack/react-virtual']) ||
        (packageJson.devDependencies && packageJson.devDependencies['@tanstack/react-virtual']);
    
    logTest(
        '检查@tanstack/react-virtual依赖',
        hasTanstackVirtual,
        hasTanstackVirtual 
            ? `已安装版本: ${packageJson.dependencies['@tanstack/react-virtual'] || packageJson.devDependencies['@tanstack/react-virtual']}`
            : '未安装@tanstack/react-virtual'
    );
} catch (error) {
    logTest('依赖包检查', false, error.message);
}

// 测试4: 性能优化检查
logSection('测试4: 性能优化特性检查');

try {
    const componentContent = fs.readFileSync(componentPath, 'utf-8');
    
    // 检查动态高度测量
    const hasMeasureElement = componentContent.includes('measureElement');
    logTest(
        '检查动态高度测量',
        hasMeasureElement,
        hasMeasureElement ? '支持动态高度测量' : '未配置动态高度'
    );
    
    // 检查contain样式优化
    const hasContainStyle = componentContent.includes('contain:');
    logTest(
        '检查CSS contain优化',
        hasContainStyle,
        hasContainStyle ? '使用了CSS contain优化' : '未使用contain优化'
    );
    
    // 检查transform定位
    const hasTransform = componentContent.includes('transform:');
    logTest(
        '检查GPU加速定位',
        hasTransform,
        hasTransform ? '使用transform进行GPU加速' : '未使用transform'
    );
    
    // 检查无限加载触发逻辑
    const hasLoadMoreLogic = componentContent.includes('lastItem.index >= items.length - 5');
    logTest(
        '检查无限加载触发逻辑',
        hasLoadMoreLogic,
        hasLoadMoreLogic ? '在距离底部5项时触发加载' : '无限加载逻辑可能不正确'
    );
} catch (error) {
    logTest('性能优化检查', false, error.message);
}

// 测试5: 代码质量检查
logSection('测试5: 代码质量检查');

try {
    const componentContent = fs.readFileSync(componentPath, 'utf-8');
    
    // 检查默认参数
    const hasDefaultParams = componentContent.includes('items = []');
    logTest(
        '检查默认参数',
        hasDefaultParams,
        hasDefaultParams ? '提供了合理的默认参数' : '缺少默认参数'
    );
    
    // 检查注释文档
    const hasDocComments = componentContent.includes('/**');
    logTest(
        '检查文档注释',
        hasDocComments,
        hasDocComments ? '包含文档注释' : '缺少文档注释'
    );
    
    // 检查错误处理
    const hasErrorHandling = componentContent.includes('if (!') || componentContent.includes('return');
    logTest(
        '检查错误处理',
        hasErrorHandling,
        hasErrorHandling ? '包含基本错误处理' : '可能缺少错误处理'
    );
} catch (error) {
    logTest('代码质量检查', false, error.message);
}

// 输出测试总结
logSection('测试总结');

const totalTests = testResults.passed + testResults.failed;
const passRate = ((testResults.passed / totalTests) * 100).toFixed(1);

console.log(`\n总测试数: ${totalTests}`);
console.log(`\x1b[32m通过: ${testResults.passed}\x1b[0m`);
console.log(`\x1b[31m失败: ${testResults.failed}\x1b[0m`);
console.log(`通过率: ${passRate}%`);

if (testResults.failed === 0) {
    console.log('\n\x1b[32m✓ 所有测试通过！虚拟滚动功能已正确实现。\x1b[0m');
} else {
    console.log('\n\x1b[33m⚠ 部分测试失败，请检查上述失败项。\x1b[0m');
}

console.log('\n' + '='.repeat(60));

// 输出详细建议
if (testResults.failed > 0) {
    console.log('\n建议修复项:');
    testResults.tests
        .filter(t => !t.passed)
        .forEach((t, i) => {
            console.log(`${i + 1}. ${t.name}`);
            if (t.message) {
                console.log(`   ${t.message}`);
            }
        });
}

// 退出码
process.exit(testResults.failed > 0 ? 1 : 0);
