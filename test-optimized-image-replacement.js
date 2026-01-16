/**
 * OptimizedImage组件替换验证测试
 * 
 * 验证所有图片组件都已替换为OptimizedImage
 */

const fs = require('fs');
const path = require('path');

console.log('='.repeat(60));
console.log('OptimizedImage组件替换验证测试');
console.log('='.repeat(60));

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

// 需要检查的文件列表
const filesToCheck = [
    {
        path: 'src/pages/Order/Package.jsx',
        description: 'Package页面',
        shouldHaveOptimizedImage: true,
        shouldNotHaveImg: true // 图片模态框应该使用OptimizedImage
    },
    {
        path: 'src/components/Order/OrderCard.jsx',
        description: 'OrderCard组件',
        shouldHaveOptimizedImage: true,
        shouldNotHaveImg: false // 仓库图标也应该使用OptimizedImage
    },
    {
        path: 'src/pages/Order/OrderDetail.jsx',
        description: 'OrderDetail页面',
        shouldHaveOptimizedImage: true,
        shouldNotHaveImg: true // 路线图片应该使用OptimizedImage
    },
    {
        path: 'src/pages/Package/PackagePackSelect.jsx',
        description: 'PackagePackSelect页面',
        shouldHaveOptimizedImage: true,
        shouldNotHaveImg: true // 包裹图片和模态框应该使用OptimizedImage
    }
];

logSection('测试1: 检查OptimizedImage导入');

filesToCheck.forEach(file => {
    try {
        const filePath = path.join(__dirname, file.path);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        const hasImport = content.includes('import OptimizedImage from');
        logTest(
            `${file.description} - 导入OptimizedImage`,
            hasImport,
            hasImport ? '已正确导入OptimizedImage' : '未导入OptimizedImage'
        );
    } catch (error) {
        logTest(`${file.description} - 导入检查`, false, error.message);
    }
});

logSection('测试2: 检查OptimizedImage使用');

filesToCheck.forEach(file => {
    try {
        const filePath = path.join(__dirname, file.path);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        if (file.shouldHaveOptimizedImage) {
            const hasUsage = content.includes('<OptimizedImage');
            logTest(
                `${file.description} - 使用OptimizedImage`,
                hasUsage,
                hasUsage ? '已使用OptimizedImage组件' : '未使用OptimizedImage组件'
            );
        }
    } catch (error) {
        logTest(`${file.description} - 使用检查`, false, error.message);
    }
});

logSection('测试3: 检查是否还有未替换的img标签');

filesToCheck.forEach(file => {
    try {
        const filePath = path.join(__dirname, file.path);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 检查是否还有<img标签（排除注释）
        const lines = content.split('\n');
        const imgTags = [];
        
        lines.forEach((line, index) => {
            // 跳过注释行
            if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                return;
            }
            
            if (line.includes('<img') && !line.includes('OptimizedImage')) {
                imgTags.push({
                    line: index + 1,
                    content: line.trim()
                });
            }
        });
        
        if (file.shouldNotHaveImg) {
            const hasNoImg = imgTags.length === 0;
            logTest(
                `${file.description} - 无未替换的img标签`,
                hasNoImg,
                hasNoImg 
                    ? '所有img标签已替换' 
                    : `发现${imgTags.length}个未替换的img标签:\n    ${imgTags.map(t => `行${t.line}: ${t.content.substring(0, 80)}...`).join('\n    ')}`
            );
        }
    } catch (error) {
        logTest(`${file.description} - img标签检查`, false, error.message);
    }
});

logSection('测试4: 检查OptimizedImage组件功能');

try {
    const componentPath = path.join(__dirname, 'src/components/Common/OptimizedImage.jsx');
    const content = fs.readFileSync(componentPath, 'utf-8');
    
    // 检查关键功能
    const hasLazyLoad = content.includes('LazyLoadImage');
    logTest(
        '检查懒加载功能',
        hasLazyLoad,
        hasLazyLoad ? '使用了LazyLoadImage组件' : '未使用LazyLoadImage'
    );
    
    const hasBlurEffect = content.includes('effect="blur"');
    logTest(
        '检查模糊效果',
        hasBlurEffect,
        hasBlurEffect ? '配置了blur效果' : '未配置blur效果'
    );
    
    const hasThreshold = content.includes('threshold={100}');
    logTest(
        '检查视口阈值',
        hasThreshold,
        hasThreshold ? '设置了100px阈值' : '未设置正确的阈值'
    );
    
    const hasErrorHandling = content.includes('onError') && content.includes('fallbackSrc');
    logTest(
        '检查错误处理',
        hasErrorHandling,
        hasErrorHandling ? '实现了错误处理和fallback' : '缺少错误处理'
    );
    
    const hasPlaceholder = content.includes('placeholder') && content.includes('animate-pulse');
    logTest(
        '检查占位符动画',
        hasPlaceholder,
        hasPlaceholder ? '实现了脉冲动画占位符' : '缺少占位符动画'
    );
} catch (error) {
    logTest('OptimizedImage组件功能检查', false, error.message);
}

logSection('测试5: 检查性能优化特性');

filesToCheck.forEach(file => {
    try {
        const filePath = path.join(__dirname, file.path);
        const content = fs.readFileSync(filePath, 'utf-8');
        
        // 检查是否正确传递了props
        const optimizedImageUsages = content.match(/<OptimizedImage[^>]*>/g) || [];
        
        let hasProperProps = true;
        let issues = [];
        
        optimizedImageUsages.forEach((usage, index) => {
            if (!usage.includes('src=')) {
                hasProperProps = false;
                issues.push(`使用${index + 1}缺少src属性`);
            }
            if (!usage.includes('alt=')) {
                hasProperProps = false;
                issues.push(`使用${index + 1}缺少alt属性`);
            }
            if (!usage.includes('className=')) {
                hasProperProps = false;
                issues.push(`使用${index + 1}缺少className属性`);
            }
        });
        
        if (optimizedImageUsages.length > 0) {
            logTest(
                `${file.description} - Props完整性`,
                hasProperProps,
                hasProperProps 
                    ? `所有${optimizedImageUsages.length}个OptimizedImage使用都有完整的props` 
                    : `发现问题: ${issues.join(', ')}`
            );
        }
    } catch (error) {
        logTest(`${file.description} - Props检查`, false, error.message);
    }
});

logSection('测试总结');

const totalTests = testResults.passed + testResults.failed;
const passRate = ((testResults.passed / totalTests) * 100).toFixed(1);

console.log(`\n总测试数: ${totalTests}`);
console.log(`\x1b[32m通过: ${testResults.passed}\x1b[0m`);
console.log(`\x1b[31m失败: ${testResults.failed}\x1b[0m`);
console.log(`通过率: ${passRate}%`);

if (testResults.failed === 0) {
    console.log('\n\x1b[32m✓ 所有测试通过！OptimizedImage组件已成功替换所有图片。\x1b[0m');
    console.log('\n优化效果:');
    console.log('  • 懒加载: 只加载可见区域的图片');
    console.log('  • 模糊效果: 加载时显示模糊效果');
    console.log('  • 错误处理: 加载失败时显示fallback图片');
    console.log('  • 占位符: 加载前显示脉冲动画');
    console.log('  • 性能提升: 减少初始加载时间和带宽使用');
} else {
    console.log('\n\x1b[33m⚠ 部分测试失败，请检查上述失败项。\x1b[0m');
}

console.log('\n' + '='.repeat(60));

// 输出详细建议
if (testResults.failed > 0) {
    console.log('\n需要修复的问题:');
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
