# LINE 重复用户问题修复

## 问题描述

1. **每次登录都创建新用户**：用户每次登录都会在数据库中创建一个新的用户记录，导致同一个 LINE 用户有多个 user_id
2. **无法复制仓库地址**：主页显示"请登录"，无法复制默认仓库地址

## 根本原因

### 问题 1：重复用户创建

**错误代码** (`Lineminiapp/source/application/api/service/passport/Login.php`):
```php
// 错误：使用 OauthService 查询 user_binding 表
$userId = OauthService::getUserIdByOauthId($lineProfile['sub'], 'LINE');
$userInfo = !empty($userId) ? UserModel::detail($userId) : null;
```

**问题分析**:
- `OauthService::getUserIdByOauthId()` 查询的是 `yoshop_user_binding` 表
- 但 LINE 用户的 openid 存储在 `yoshop_user` 表的 `line_openid` 字段中
- 因此每次都查不到现有用户，导致创建新用户

**修复方案**:
```php
// 正确：直接查询 user 表的 line_openid 字段
$userInfo = UserModel::detail(['line_openid' => $lineProfile['sub']]);
```

### 问题 2：Token 未正确保存

**可能原因**:
- 前端 localStorage 保存失败
- 后端返回的数据结构不正确
- Token 验证失败

## 修复内容

### 1. 后端修复 (`Lineminiapp/source/application/api/service/passport/Login.php`)

```php
public function loginMpLine(array $form): bool
{
    // ... 验证 token ...
    
    // 修复：直接查询 user 表的 line_openid 字段
    $userInfo = UserModel::detail(['line_openid' => $lineProfile['sub']]);
    
    // 用户信息存在, 更新登录信息
    if (!empty($userInfo)) {
        $this->updateUser($userInfo, true, $form['partyData'] ?? []);
        return $this->setSession();
    }
    
    // 用户不存在：创建新用户
    $this->createUser($lineProfile['sub'], true, $form['partyData']);
    return $this->setSession();
}
```

### 2. 前端修复 (`zalo_mini_app-master/src/utils/liff.js`)

添加更详细的日志和错误处理：

```javascript
if (loginRes.data && loginRes.data.code === 1) {
    const { token, userId, nickname } = loginRes.data.data;
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId.toString());
    console.log("✅ LINE login successful");
    console.log("   User:", nickname);
    console.log("   Token:", token.substring(0, 20) + "...");
    console.log("   Token saved to localStorage");
} else {
    console.error("❌ Backend authentication failed:", loginRes.data?.msg || "Unknown error");
}
```

## 数据库清理

### 查看重复用户

```sql
SELECT 
    line_openid,
    COUNT(*) as count,
    MIN(user_id) as first_user_id,
    MIN(create_time) as first_create_time
FROM yoshop_user
WHERE line_openid IS NOT NULL AND line_openid != ''
GROUP BY line_openid
HAVING COUNT(*) > 1;
```

### 查看特定用户的所有记录

```sql
SELECT 
    user_id,
    nickName,
    line_openid,
    open_id,
    mobile,
    create_time,
    last_login_time
FROM yoshop_user
WHERE line_openid = 'Ud4e37d68c438cc70350957039add98d8'
ORDER BY create_time ASC;
```

### 删除重复记录（保留最早的）

**⚠️ 警告：执行前请先备份数据库！**

```sql
-- 保留 user_id 最小的记录，删除其他重复的
DELETE FROM yoshop_user 
WHERE line_openid = 'Ud4e37d68c438cc70350957039add98d8' 
AND user_id != (
    SELECT min_id FROM (
        SELECT MIN(user_id) as min_id 
        FROM yoshop_user 
        WHERE line_openid = 'Ud4e37d68c438cc70350957039add98d8'
    ) AS temp
);
```

## 测试步骤

### 1. 清理现有重复数据

```bash
# 连接数据库
mysql -h 103.119.1.84 -u xinsuju -p xinsuju

# 执行清理脚本
source cleanup_duplicate_line_users.sql
```

### 2. 重启后端服务器

```bash
cd Lineminiapp
# 停止现有服务器 (Ctrl+C)
# 重新启动
php -S localhost:8080 -t web
```

### 3. 测试登录流程

1. 清除浏览器 localStorage
2. 访问 https://localhost:9000
3. 等待 LIFF 初始化和自动登录
4. 检查控制台日志：
   - ✅ `LIFF ID Token obtained`
   - ✅ `LINE login successful`
   - ✅ `Token saved to localStorage`
5. 检查主页是否可以复制仓库地址

### 4. 验证数据库

```sql
-- 确认只有一条记录
SELECT COUNT(*) FROM yoshop_user 
WHERE line_openid = 'Ud4e37d68c438cc70350957039add98d8';
-- 应该返回 1

-- 查看用户信息
SELECT user_id, nickName, line_openid, last_login_time 
FROM yoshop_user 
WHERE line_openid = 'Ud4e37d68c438cc70350957039add98d8';
```

### 5. 多次登录测试

1. 刷新页面 3-5 次
2. 每次都应该使用同一个 user_id
3. 检查数据库，确认没有创建新用户

## 预期结果

✅ **修复后的行为**:
1. 首次登录：创建新用户
2. 后续登录：使用现有用户，更新 `last_login_time`
3. 主页可以正常复制仓库地址
4. 数据库中每个 LINE 用户只有一条记录

## 相关文件

- 后端登录服务：`Lineminiapp/source/application/api/service/passport/Login.php`
- 前端 LIFF 工具：`zalo_mini_app-master/src/utils/liff.js`
- 清理脚本：`Lineminiapp/cleanup_duplicate_line_users.sql`
- 主页组件：`zalo_mini_app-master/src/pages/Guide/QuickStart.jsx`

## 注意事项

1. **数据备份**：删除重复用户前务必备份数据库
2. **关联数据**：检查是否有订单、包裹等数据关联到要删除的 user_id
3. **测试环境**：建议先在测试环境验证修复效果
4. **监控日志**：修复后持续监控登录日志，确保不再创建重复用户
