# 余额显示为0的调试指南

## 问题描述
用户页面显示余额为0，但实际应该有余额数据。

## 快速诊断步骤

### 步骤1: 使用测试工具检查API
1. 打开浏览器访问: `http://localhost:9000/test-balance-api.html`
2. 点击"从LocalStorage加载Token"按钮
3. 点击"测试 user/detail"按钮
4. 查看返回的余额数据

**预期结果**:
```json
{
  "code": 1,
  "data": {
    "userInfo": {
      "balance": "实际余额值",
      "recharge_money": "累计充值",
      "pay_money": "累计消费"
    }
  }
}
```

### 步骤2: 检查浏览器Console日志
1. 打开浏览器开发者工具 (F12)
2. 切换到Console标签
3. 刷新用户页面 (`/mine`)
4. 查找以下日志:

```
📊 用户详情API响应: {...}
💰 余额数据: {
  原始balance: "xxx",
  解析后balance: xxx,
  类型: "string" 或 "number"
}
```

### 步骤3: 检查Network请求
1. 在开发者工具中切换到Network标签
2. 刷新页面
3. 找到 `user/detail` 请求
4. 查看Response内容

**检查点**:
- ✅ 请求状态码是否为200
- ✅ 响应中 `code` 是否为1
- ✅ `data.userInfo.balance` 是否存在
- ✅ `balance` 的值是什么

## 常见问题和解决方案

### 问题1: API返回balance为"0.00"或0
**原因**: 数据库中用户余额确实为0

**解决方案**:
1. 检查后端数据库中用户的balance字段
2. 如果需要测试，可以手动更新数据库:
```sql
UPDATE yoshop_user SET balance = 100.00 WHERE user_id = YOUR_USER_ID;
```

### 问题2: API返回balance为null或undefined
**原因**: 数据库字段不存在或查询有问题

**解决方案**:
1. 检查后端 `User.php` 的 `detail()` 方法
2. 确认SQL查询包含balance字段
3. 检查数据库表结构

### 问题3: API返回balance为字符串"0"
**原因**: 数据库返回字符串类型，前端解析有问题

**解决方案**:
前端已添加 `parseFloat()` 处理，应该能正确转换。如果还是0，说明原始值就是"0"。

### 问题4: Token过期或无效
**症状**: API返回 `code: -1` 或 `msg: "请先登录"`

**解决方案**:
1. 重新登录系统
2. 检查localStorage中的token是否有效
3. 清除缓存后重新登录

### 问题5: 前端显示逻辑错误
**症状**: Console显示正确的余额，但页面显示0

**检查点**:
```javascript
// Mine/Index.jsx 第277行
{ 
  label: t("mine.balance"), 
  val: typeof assets.balance === 'number' ? assets.balance.toFixed(2) : '0.00',
  unit: '฿',
  route: "/mine/balance" 
}
```

确认 `assets.balance` 的值和类型。

## 调试代码已添加

### Mine/Index.jsx
```javascript
console.log('📊 用户详情API响应:', res);
console.log('💰 余额数据:', {
  原始balance: u.balance,
  解析后balance: balance,
  类型: typeof u.balance
});
```

### Mine/Balance.jsx
```javascript
console.log('💰 Balance页面 - API响应:', res);
console.log('💰 余额详情:', {
  原始数据: {...},
  解析后: {...}
});
```

## 测试流程

### 1. 前端测试
```bash
# 启动开发服务器
cd zalo_mini_app-master
npm run dev

# 访问测试页面
http://localhost:9000/test-balance-api.html
```

### 2. 后端测试
创建测试文件 `Lineminiapp/test_user_balance.php`:
```php
<?php
require __DIR__ . '/source/application/api/controller/User.php';

// 测试获取用户余额
$userId = YOUR_USER_ID; // 替换为实际用户ID

$db = \think\Db::connect();
$user = $db->table('yoshop_user')
    ->where('user_id', $userId)
    ->find();

echo "用户余额信息:\n";
echo "user_id: " . $user['user_id'] . "\n";
echo "balance: " . $user['balance'] . "\n";
echo "balance类型: " . gettype($user['balance']) . "\n";
echo "recharge_money: " . ($user['recharge_money'] ?? '字段不存在') . "\n";
echo "pay_money: " . ($user['pay_money'] ?? '字段不存在') . "\n";
echo "expend_money: " . ($user['expend_money'] ?? '字段不存在') . "\n";
```

运行:
```bash
cd Lineminiapp
php test_user_balance.php
```

## 数据库检查

### 检查用户余额
```sql
-- 查看特定用户的余额
SELECT user_id, nickName, balance, recharge_money, pay_money, expend_money 
FROM yoshop_user 
WHERE user_id = YOUR_USER_ID;

-- 查看所有用户的余额统计
SELECT 
    COUNT(*) as 总用户数,
    SUM(CAST(balance AS DECIMAL(10,2))) as 总余额,
    AVG(CAST(balance AS DECIMAL(10,2))) as 平均余额,
    MAX(CAST(balance AS DECIMAL(10,2))) as 最高余额
FROM yoshop_user;
```

### 检查余额变动记录
```sql
-- 查看用户的余额变动记录
SELECT * FROM yoshop_user_balance_log 
WHERE user_id = YOUR_USER_ID 
ORDER BY create_time DESC 
LIMIT 10;
```

## 解决方案总结

### 如果API返回正确但前端显示0:
1. 检查 `assets` state 的值
2. 检查 `assets.balance` 的类型
3. 确认 `toFixed(2)` 调用正常

### 如果API返回balance为0:
1. 检查数据库中的实际值
2. 检查后端查询逻辑
3. 手动更新测试数据

### 如果API请求失败:
1. 检查token是否有效
2. 检查网络请求
3. 检查后端日志

## 快速修复命令

如果确认是数据库问题，可以手动设置测试余额:
```sql
-- 设置测试余额
UPDATE yoshop_user 
SET 
    balance = 100.00,
    recharge_money = 500.00,
    pay_money = 400.00
WHERE user_id = YOUR_USER_ID;
```

## 验证修复

修复后，按以下步骤验证:
1. ✅ 刷新用户页面，查看余额是否正确显示
2. ✅ 点击余额，进入余额详情页，查看数据是否正确
3. ✅ 查看Console日志，确认没有错误
4. ✅ 使用测试工具再次验证API返回

---

**创建时间**: 2026-01-16  
**状态**: 调试中  
**下一步**: 使用测试工具检查API返回数据
