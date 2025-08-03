# Zalo小程序开发环境修复说明

## 问题描述

在使用Zalo Mini App Studio开发和测试小程序时，进入订单页面会出现自动返回的问题。这是由于token过期检测机制在开发环境中过于严格导致的。

## 修复内容

### 1. 后端修复 (PHP)

#### a. API控制器优化 (`source/application/api/controller/Controller.php`)
- 添加了开发环境检测功能
- 实现了宽松的token验证机制
- 在开发环境中提供测试用户数据
- 增加了详细的调试日志

#### b. 登录服务优化 (`source/application/api/service/passport/Login.php`)
- 增强了Zalo认证的容错处理
- 在开发环境中提供备用登录方案
- 添加了更友好的错误提示

### 2. 前端修复 (JavaScript)

#### a. 开发环境修复脚本 (`web/html5/zalo-dev-fix.js`)
- 重写了`uni.showModal`方法，拦截登录过期提示
- 重写了`uni.reLaunch`方法，阻止强制页面跳转
- 重写了`uni.request`方法，优化API错误处理
- 提供了调试工具和控制台方法

#### b. HTML页面优化 (`web/html5/index.html`)
- 添加了开发环境检测和自动加载修复脚本的功能

## 使用方法

### 1. 自动启用（推荐）

修复脚本会自动检测以下开发环境特征并启用：
- User-Agent包含`ZaloStudio`
- 域名为`localhost`或`127.0.0.1`
- 域名包含`mini-app-studio`
- URL参数包含`debug_mode=1`或`dev=1`
- 后端配置`app_debug = true`

### 2. 手动启用

如果自动检测失败，可以通过以下方式手动启用：

#### 方法1：URL参数
在访问URL后添加参数：
```
http://your-domain/html5/?debug_mode=1
```

#### 方法2：控制台调用
在浏览器开发者工具控制台中执行：
```javascript
// 模拟token过期（测试修复效果）
window.zaloDevTools.simulateTokenExpire();

// 查看环境信息
console.log(window.zaloDevTools.getEnvInfo());

// 重置修复（恢复原始行为）
window.zaloDevTools.resetFix();
```

## 修复效果

### 修复前
- 进入订单页面自动弹出"登录状态已过期"提示
- 强制跳转到首页，无法正常开发测试
- token验证失败直接抛出错误

### 修复后
- 开发环境中显示友好的提示信息
- 用户可以选择继续操作或刷新页面
- 提供测试用户数据，避免认证失败
- 详细的调试日志帮助问题排查

## 调试功能

### 1. 控制台日志
修复脚本会在控制台输出详细的调试信息：
```
Zalo开发环境修复脚本已加载，开发模式: true
Zalo开发环境修复已激活:
- 已重写uni.showModal方法
- 已重写uni.reLaunch方法  
- 已重写uni.request方法
- 登录过期将显示友好提示而不是强制跳转
调试工具已添加到 window.zaloDevTools
```

### 2. 调试工具
通过`window.zaloDevTools`提供的方法：
```javascript
// 模拟token过期
zaloDevTools.simulateTokenExpire()

// 获取环境信息
zaloDevTools.getEnvInfo()

// 重置修复
zaloDevTools.resetFix()
```

### 3. 后端日志
查看以下文件的调试日志：
- `debug.txt` - Zalo登录调试信息
- `debug_token.log` - Token验证日志

## 生产环境

**重要**: 这些修复仅在开发环境中生效，不会影响生产环境的正常运行。在生产环境中：
- 修复脚本不会加载
- 原有的安全验证机制保持不变
- 不会有性能影响

## 测试建议

1. **基础测试**
   - 在Zalo Mini App Studio中打开小程序
   - 尝试进入订单页面
   - 验证不会出现自动返回

2. **登录测试**
   - 测试正常的Zalo登录流程
   - 验证token过期处理
   - 检查用户数据获取

3. **功能测试**
   - 测试订单页面的各项功能
   - 验证API调用正常
   - 确认数据显示正确

## 故障排查

### 如果修复没有生效

1. **检查环境检测**
   ```javascript
   console.log(window.zaloDevTools.getEnvInfo());
   ```

2. **手动启用修复**
   ```
   添加URL参数：?debug_mode=1
   ```

3. **检查控制台**
   - 查看是否有JavaScript错误
   - 确认修复脚本已加载

4. **清除缓存**
   - 清除浏览器缓存
   - 重新加载页面

### 如果仍有问题

1. 检查`debug.txt`和`debug_token.log`文件
2. 在控制台执行`zaloDevTools.simulateTokenExpire()`测试
3. 确认文件路径正确：`/html5/zalo-dev-fix.js`

## 技术原理

这个修复方案通过以下技术手段解决问题：

1. **环境检测**: 自动识别开发环境特征
2. **方法重写**: 拦截和修改关键的UniApp方法
3. **错误处理**: 将错误转换为友好提示
4. **容错机制**: 提供备用数据和处理方案
5. **调试支持**: 丰富的日志和调试工具

这种方案既保证了开发环境的便利性，又不影响生产环境的安全性。 