# LINE用户仓库地址User Code修复

## 问题描述
LINE用户登录后，复制的仓库地址中没有显示用户的专属ID（User Code），导致包裹无法正确归属到用户。

## 根本原因

### 1. 后端问题：LINE用户没有生成 user_code
- LINE用户在创建时，`createUser()` 方法没有生成 `user_code` 字段
- 数据库中LINE用户的 `user_code` 字段为 NULL
- 后端API `getStorageFirst` 依赖 `user_code` 来生成包含用户标识的仓库地址

### 2. 前端问题：字段名不匹配
- 前端使用 `warehouse.name` 和 `warehouse.code`
- 后端返回 `linkman` 和 `post`
- 导致即使后端返回了正确数据，前端也无法正确显示

## 系统逻辑说明

### 后台设置 `usercode_mode`
```php
'usercode_mode' => [
    'is_show' => 1,  // 0=只显示UID, 1=只显示CODE, 2=同时显示
    'mode' => 30,    // 10=纯数字, 20=纯字母, 30=字母+数字
    '30' => [
        'char' => 'Y',    // 前缀字母
        'number' => 5     // 数字位数
    ]
]
```

### User Code生成规则
- **模式10（纯数字）**: 生成指定位数的随机数字，如 `12345`
- **模式20（纯字母）**: 生成指定位数的随机字母，如 `ABCDE`
- **模式30（混合）**: 字母前缀 + 数字，如 `Y34311`

### 仓库地址格式
根据 `is_show` 设置：
- `is_show=0`: 地址包含 `UID:31966`
- `is_show=1`: 地址包含 `Y34311室`（当前设置）
- `is_show=2`: 地址包含 `UID:31966-CODE:Y34311`

## 解决方案

### 1. 后端修复

#### 修改文件：`Lineminiapp/source/application/api/service/passport/Login.php`

**添加 user_code 生成逻辑到 `createUser()` 方法：**

```php
private function createUser(string $mobile,$isParty, array $partyData = []): void
{
    // 获取系统设置
    $setting = SettingModel::getItem('store', (new UserModel)->getWxappid());
    
    // 生成 user_code（如果需要）
    $user_code = '';
    if ($setting['usercode_mode']['is_show'] == 1 || $setting['usercode_mode']['is_show'] == 2) {
        $user_code = $this->generateUserCode($setting);
    }
    
    // 用户信息
    $data = [
        'mobile' => $mobile,
        'nickName' => $partyData['nickName']?$partyData['nickName']:hide_mobile($mobile),
        'open_id'=> $mobile,
        'platform' => getPlatform(),
        'last_login_time' => date('Y-m-d H:i:s'),
        'birthday' => date('Y-m-d H:i:s'),
        'wxapp_id' =>(new UserModel)->getWxappid(),
        'user_code' => $user_code,  // ✅ 添加 user_code
    ];
    
    // 如果是 LINE 登录，只设置 line_openid
    if (isset($partyData['oauth']) && $partyData['oauth'] === 'LINE') {
        $data['line_openid'] = $partyData['oauth_id'];
        $data['open_id'] = '';
    }
    
    // ... 其余代码
}

/**
 * 生成用户编码
 */
private function generateUserCode(array $setting): string
{
    switch ($setting['usercode_mode']['mode']) {
        case '10':
            $num = $setting['usercode_mode'][10]['number'];
            return $this->createNum($num);
        case '20':
            $num = $setting['usercode_mode'][20]['char'];
            return $this->createChar($num);
        case '30':
            $zimu = $setting['usercode_mode'][30]['char'];
            $num = $setting['usercode_mode'][30]['number'];
            return $this->createCharNum($num, $zimu);
        default:
            $num = $setting['usercode_mode'][10]['number'] ?? 5;
            return $this->createNum($num);
    }
}
```

#### 为现有LINE用户生成 user_code

执行脚本：`Lineminiapp/web/generate_line_user_code.php`

```bash
cd Lineminiapp/web
php generate_line_user_code.php
```

**结果：**
```
✅ User ID: 31960 - Generated code: Y37709
✅ User ID: 31966 - Generated code: Y34311
```

### 2. 前端修复

#### 修改文件：`zalo_mini_app-master/src/pages/Home/Index.jsx`

**修复字段名映射：**

```javascript
// 修复复制地址函数
const handleCopyAddress = (type) => {
  if (!warehouse) return;
  
  // 后端返回的字段：linkman, phone, address, post
  const name = warehouse.linkman || warehouse.name || '';
  const phone = warehouse.phone || '';
  const address = warehouse.address || '';
  const postCode = warehouse.post || warehouse.code || '';
  
  const addressText = type === 'sea' 
    ? `${name}|${phone}|${address} SEA|${postCode}`
    : `${name}|${phone}|${address}|${postCode}`;
  
  copy(addressText);
  toast.success(t("common.copy_success", "คัดลอกสำเร็จ"));
};
```

**修复显示部分：**

```jsx
<div className="space-y-1 text-xs">
  <div className="flex">
    <span className="text-gray-500 w-16">{t("guide.step1.name", "ชื่อ")}:</span>
    <span className="text-gray-800 font-medium">{warehouse.linkman || warehouse.name}</span>
  </div>
  <div className="flex">
    <span className="text-gray-500 w-16">{t("guide.step1.phone", "โทร")}:</span>
    <span className="text-gray-800 font-medium">{warehouse.phone}</span>
  </div>
  <div className="flex">
    <span className="text-gray-500 w-16">{t("guide.step1.address", "ที่อยู่")}:</span>
    <span className="text-gray-800 font-medium">{warehouse.address}</span>
  </div>
  <div className="flex">
    <span className="text-gray-500 w-16">{t("guide.step1.zipcode", "รหัสไปรษณีย์")}:</span>
    <span className="text-gray-800 font-medium">{warehouse.post || warehouse.code}</span>
  </div>
</div>
```

## 测试验证

### 后端API测试

```bash
cd Lineminiapp/web
php create_test_token.php
```

**测试结果：**
```
✅ Token saved to cache
HTTP Code: 200

Warehouse Address Details:
Shop Name: 武汉
Linkman: TLLCARGO ไทย-ลาว-Y34311室
Phone: 18989898989
Address: gggY34311室室
Post Code: 

✅ User CODE (Y34311) found in warehouse address!
```

### 前端测试

1. 访问 `https://localhost:9000`
2. LINE登录
3. 查看首页仓库地址信息
4. 点击"复制地址"按钮

**预期结果：**
- 显示：`TLLCARGO ไทย-ลาว-Y34311室 | 18989898989 | gggY34311室室`
- 复制的文本包含用户CODE `Y34311`

## 数据库验证

```sql
SELECT user_id, nickName, line_openid, user_code 
FROM yoshop_user 
WHERE line_openid IS NOT NULL AND line_openid != '';
```

**结果：**
```
User ID: 31960, Code: Y37709
User ID: 31966, Code: Y34311
```

## 相关文件

### 后端
- `Lineminiapp/source/application/api/service/passport/Login.php` - 添加user_code生成逻辑
- `Lineminiapp/source/application/api/controller/Page.php` - 仓库地址API（已有逻辑，无需修改）
- `Lineminiapp/web/generate_line_user_code.php` - 为现有用户生成code的脚本

### 前端
- `zalo_mini_app-master/src/pages/Home/Index.jsx` - 修复字段名映射

### 数据库
- `yoshop_user` 表的 `user_code` 字段

## 注意事项

1. **新用户自动生成**：修复后，新注册的LINE用户会自动生成 `user_code`
2. **现有用户需要手动生成**：使用 `generate_line_user_code.php` 脚本
3. **唯一性检查**：生成的 `user_code` 会自动检查唯一性，避免重复
4. **后台设置依赖**：user_code的格式取决于后台 `usercode_mode` 设置

## 日期
2026年1月13日
