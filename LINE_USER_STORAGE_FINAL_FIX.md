# LINE 用户存储最终修复方案

## 问题说明

LINE 用户应该使用 `line_openid` 字段存储，而不是 `open_id` 字段。`open_id` 字段应该保留给其他平台（如微信）使用。

## 修复方案

### 1. 数据库字段使用规则

| 平台 | 字段 | 说明 |
|------|------|------|
| 微信 | `open_id` | 微信 openid |
| LINE | `line_openid` | LINE 用户 ID，`open_id` 为空 |
| ZALO | `open_id` | ZALO openid |

### 2. 后端修复

#### 2.1 UserModel::getUser() - 支持 LINE 用户查询

**文件**: `Lineminiapp/source/application/api/model/User.php`

```php
public static function getUser($token)
{
    $cacheData = Cache::get($token);
    
    // 优先使用 line_openid（LINE 用户）
    if (!empty($cacheData['line_openid'])) {
        return self::detail(['line_openid' => $cacheData['line_openid']], 
            ['address', 'addressDefault', 'grade','userimage','service']);
    }
    
    // 其他平台使用 open_id
    $openId = $cacheData['openid'];
    return self::detail(['open_id' => $openId], 
        ['address', 'addressDefault', 'grade','userimage','service']);
}
```

#### 2.2 Login::setSession() - 缓存 LINE 用户信息

**文件**: `Lineminiapp/source/application/api/service/passport/Login.php`

```php
private function setSession(): bool
{
    // ...
    
    // 构建缓存数据
    $cacheData = [
        'user' => $this->userInfo,
        'openid' => $this->userInfo->open_id,
        'store_id' => (new UserModel)->getWxappid(),
        'is_login' => true,
    ];
    
    // 如果是 LINE 用户，添加 line_openid
    if (!empty($this->userInfo->line_openid)) {
        $cacheData['line_openid'] = $this->userInfo->line_openid;
    }
    
    // 记录缓存, 30天
    Cache::set($token, $cacheData, 86400 * 30);
    
    return true;
}
```

#### 2.3 Login::createUser() - LINE 用户只设置 line_openid

**文件**: `Lineminiapp/source/application/api/service/passport/Login.php`

```php
private function createUser(string $mobile,$isParty, array $partyData = []): void
{
    $data = [
        'mobile' => $mobile,
        'nickName' => $partyData['nickName']?$partyData['nickName']:hide_mobile($mobile),
        'open_id'=> $mobile,  // 默认使用 mobile
        'platform' => getPlatform(),
        'last_login_time' => date('Y-m-d H:i:s'),
        'birthday' => date('Y-m-d H:i:s'),
        'wxapp_id' =>(new UserModel)->getWxappid() ,
    ];
    
    // 如果是 LINE 登录，只设置 line_openid，open_id 保持为空
    if (isset($partyData['oauth']) && $partyData['oauth'] === 'LINE') {
        $data['line_openid'] = $partyData['oauth_id'];
        $data['open_id'] = '';  // LINE 用户的 open_id 为空
    }
    
    // ...
}
```

#### 2.4 Login::loginMpLine() - 使用 line_openid 查询用户

**文件**: `Lineminiapp/source/application/api/service/passport/Login.php`

```php
public function loginMpLine(array $form): bool
{
    // ...
    
    // LINE 用户直接查询 user 表的 line_openid 字段
    $userInfo = UserModel::detail(['line_openid' => $lineProfile['sub']]);
    
    // ...
}
```

### 3. 数据库清理

#### 3.1 清理现有 LINE 用户的 open_id

**执行脚本**: `Lineminiapp/web/cleanup_line_openid.php`

```sql
UPDATE yoshop_user
SET open_id = ''
WHERE line_openid IS NOT NULL 
  AND line_openid != ''
  AND open_id != '';
```

**执行结果**:
```
清理 LINE 用户的 open_id 字段
=====================================

需要清理的用户数量: 2
-------------------------------------
User ID: 31960, Nick: TLLCARGO ไทย-ลาว
  line_openid: Ud4e37d68c438cc70350957039add98d8
  当前 open_id: Ud4e37d68c438cc70350957039add98d8 (将被清空)
User ID: 31966, Nick: TLLCARGO ไทย-ลาว
  line_openid: Ud4e37d68c438cc70350957039add98d8
  当前 open_id: Ud4e37d68c438cc70350957039add98d8 (将被清空)
-------------------------------------

开始清理...
✓ 清理完成！更新了 2 条记录

验证清理结果:
-------------------------------------
User ID: 31960, Nick: TLLCARGO ไทย-ลาว
  line_openid: Ud4e37d68c438cc70350957039add98d8
  open_id: (空) - ✓ 正确
User ID: 31966, Nick: TLLCARGO ไทย-ลาว
  line_openid: Ud4e37d68c438cc70350957039add98d8
  open_id: (空) - ✓ 正确
-------------------------------------
总计: 2 个 LINE 用户
正确: 2, 错误: 0
```

## 工作流程

### LINE 用户登录流程

1. **前端**: LIFF 获取 ID Token
2. **前端**: 发送 ID Token 到后端 `passport/login_mp_line`
3. **后端**: 验证 ID Token，获取 LINE 用户 ID (`sub`)
4. **后端**: 查询 `yoshop_user` 表的 `line_openid` 字段
5. **后端**: 如果用户存在，更新登录信息；否则创建新用户
6. **后端**: 生成 token，缓存用户信息（包含 `line_openid`）
7. **后端**: 返回 token 给前端
8. **前端**: 保存 token 到 localStorage

### API 调用流程

1. **前端**: 发送请求，携带 token 参数
2. **后端**: `Controller::getUser($token)` 获取用户信息
3. **后端**: `UserModel::getUser($token)` 从 Cache 获取数据
4. **后端**: 检查 `line_openid`，如果存在则用 `line_openid` 查询
5. **后端**: 返回用户信息

## 验证步骤

### 1. 清除浏览器缓存和 localStorage

### 2. 重新登录

访问 https://localhost:9000，等待 LIFF 初始化和登录

### 3. 检查控制台日志

应该看到：
```
✅ LINE login successful
   User: TLLCARGO ไทย-ลาว
   Token: xxx...
   Token saved to localStorage
```

### 4. 检查数据库

```sql
-- 查看 LINE 用户
SELECT user_id, nickName, line_openid, open_id
FROM yoshop_user
WHERE line_openid = 'Ud4e37d68c438cc70350957039add98d8';

-- 应该看到：
-- open_id 为空
-- line_openid 有值
```

### 5. 测试 API 调用

访问主页，应该能够看到仓库地址并复制。

## 相关文件

- `Lineminiapp/source/application/api/model/User.php` - 用户模型
- `Lineminiapp/source/application/api/service/passport/Login.php` - 登录服务
- `Lineminiapp/web/cleanup_line_openid.php` - 数据库清理脚本
- `zalo_mini_app-master/src/utils/liff.js` - 前端 LIFF 工具

## 总结

✅ **已完成**:
1. LINE 用户只使用 `line_openid` 字段
2. `open_id` 字段为空，保留给其他平台
3. `UserModel::getUser()` 支持 LINE 用户查询
4. `setSession()` 缓存 LINE 用户的 `line_openid`
5. 数据库中现有 LINE 用户的 `open_id` 已清空

✅ **预期效果**:
1. LINE 用户登录后可以正常使用所有 API
2. 不会创建重复用户
3. 数据库结构清晰，不同平台使用不同字段
