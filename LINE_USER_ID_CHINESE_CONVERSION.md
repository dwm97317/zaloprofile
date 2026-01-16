# LINE用户ID中文转换完整实现

## 需求
1. LINE新用户默认使用 `is_show=0`（只显示User ID，不生成user_code）
2. 仓库地址根据这个默认设置变化（显示User ID而不是User Code）
3. 前端将数字User ID转换成中文数字（如 `31966` → `三一九六六`）
4. 只在仓库地址中转换，不影响其他页面

## 实现方案

### 1. 后端修改

#### 文件：`Lineminiapp/source/application/api/service/passport/Login.php`

**修改 `createUser()` 方法**：LINE用户默认不生成user_code

```php
private function createUser(string $mobile,$isParty, array $partyData = []): void
{
    // 获取系统设置
    $setting = SettingModel::getItem('store', (new UserModel)->getWxappid());
    
    // LINE用户默认不生成user_code（使用User ID模式）
    // 其他平台用户根据后台设置生成
    $user_code = '';
    $isLineUser = isset($partyData['oauth']) && $partyData['oauth'] === 'LINE';
    
    if (!$isLineUser && ($setting['usercode_mode']['is_show'] == 1 || $setting['usercode_mode']['is_show'] == 2)) {
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
        'user_code' => $user_code,  // LINE用户为空
    ];
    
    // 如果是 LINE 登录，只设置 line_openid
    if ($isLineUser) {
        $data['line_openid'] = $partyData['oauth_id'];
        $data['open_id'] = '';
    }
    
    // ... 其余代码
}
```

#### 文件：`Lineminiapp/source/application/api/controller/Page.php`

**添加Fallback逻辑到 `storageDetails()` 方法**：

```php
public function storageDetails($id){
   $this->user = $this->getUser(); 
   $data = (new Shop())->getDetails($id);
   
   // ... 省略部分代码
   
   $setting = CommonSetting::getItem('store',input('wxapp_id'));
    
   // ✅ Fallback: 如果user_code为空且is_show=1，自动切换到is_show=0（使用User ID）
   if($setting['usercode_mode']['is_show']==1 && empty(($this->user)['user_code'])){
       $setting['usercode_mode']['is_show'] = 0;
   }
   
   if($setting['is_change_uid']==1){
      ($this->user)['user_code'] = ($this->user)['user_code'].'室';
      ($this->user)['user_id'] = ($this->user)['user_id'].'室';
   }
   
   // ... 后续逻辑会根据is_show=0生成包含User ID的地址
}
```

### 2. 数据库操作

#### 清空现有LINE用户的user_code

```bash
cd Lineminiapp/web
php clear_line_user_code.php
```

**结果：**
```
User ID: 31960 - Cleared user_code
User ID: 31966 - Cleared user_code
```

### 3. 前端修改

#### 文件：`zalo_mini_app-master/src/pages/Home/Index.jsx`

**添加数字转中文函数**：

```javascript
// 将数字转换为中文数字
const convertNumberToChinese = (num) => {
  const chineseNumbers = {
    '0': '零', '1': '一', '2': '二', '3': '三', '4': '四',
    '5': '五', '6': '六', '7': '七', '8': '八', '9': '九'
  };
  return String(num).split('').map(digit => chineseNumbers[digit] || digit).join('');
};
```

**修改 `handleCopyAddress()` 函数**：

```javascript
const handleCopyAddress = (type) => {
  if (!warehouse) return;
  
  let name = warehouse.linkman || warehouse.name || '';
  const phone = warehouse.phone || '';
  let address = warehouse.address || '';
  const postCode = warehouse.post || warehouse.code || '';
  
  // 将地址和联系人中的数字ID转换为中文
  const convertIdToChinese = (text) => {
    return text.replace(/(\d+)/g, (match) => {
      // 只转换4-6位数字（用户ID格式）
      if (match.length >= 4 && match.length <= 6) {
        return convertNumberToChinese(match);
      }
      return match;
    });
  };
  
  name = convertIdToChinese(name);
  address = convertIdToChinese(address);
  
  // 将"UID"替换为中文"用户ID"
  address = address.replace(/UID:/g, '用户ID:').replace(/UID /g, '用户ID ');
  name = name.replace(/UID:/g, '用户ID:').replace(/UID /g, '用户ID ');
  
  const addressText = type === 'sea' 
    ? `${name}|${phone}|${address} SEA|${postCode}`
    : `${name}|${phone}|${address}|${postCode}`;
  
  copy(addressText);
  toast.success(t("common.copy_success", "คัดลอกสำเร็จ"));
};
```

**修改显示部分**：

```jsx
<div className="flex">
  <span className="text-gray-500 w-16">{t("guide.step1.name", "ชื่อ")}:</span>
  <span className="text-gray-800 font-medium">
    {(() => {
      const chineseNumbers = {
        '0': '零', '1': '一', '2': '二', '3': '三', '4': '四',
        '5': '五', '6': '六', '7': '七', '8': '八', '9': '九'
      };
      const text = warehouse.linkman || warehouse.name || '';
      return text.replace(/(\d+)/g, (match) => {
        if (match.length >= 4 && match.length <= 6) {
          return match.split('').map(d => chineseNumbers[d] || d).join('');
        }
        return match;
      }).replace(/UID:/g, '用户ID:').replace(/UID /g, '用户ID ');
    })()}
  </span>
</div>
```

## 测试验证

### 后端API测试

```bash
cd Lineminiapp/web
php create_test_token.php
```

**结果：**
```
✅ Token saved to cache
HTTP Code: 200

Warehouse Address Details:
Shop Name: 武汉
Linkman: TLLCARGO ไทย-ลาว31966室
Phone: 18989898989
Address: ggg31966室
Post Code: 

✅ User ID (31966) found in warehouse address!
```

### 前端Playwright测试

**测试步骤：**
1. 访问 `https://localhost:9000`
2. LINE登录
3. 查看首页仓库地址信息

**验证结果：**
```
✅ 显示内容：
   ชื่อ: TLLCARGO ไทย-ลาว三一九六六室
   ที่อยู่: ggg三一九六六室

✅ 复制内容：
   TLLCARGO ไทย-ลาว三一九六六室|18989898989|ggg三一九六六室|
```

## 数字转换规则

| 原始数字 | 中文数字 |
|---------|---------|
| 0 | 零 |
| 1 | 一 |
| 2 | 二 |
| 3 | 三 |
| 4 | 四 |
| 5 | 五 |
| 6 | 六 |
| 7 | 七 |
| 8 | 八 |
| 9 | 九 |

**示例：**
- `31966` → `三一九六六`
- `12345` → `一二三四五`

## 转换范围

### ✅ 会转换
- 仓库地址页面的联系人姓名中的用户ID
- 仓库地址页面的地址中的用户ID
- 复制到剪贴板的地址文本

### ❌ 不会转换
- 其他页面的UID显示
- 电话号码
- 邮政编码
- 少于4位或多于6位的数字

## 系统流程

```
LINE用户登录
    ↓
后端创建用户（user_code = NULL）
    ↓
后端API检测到user_code为空
    ↓
自动fallback到is_show=0（User ID模式）
    ↓
返回包含User ID的地址（如：ggg31966室）
    ↓
前端接收数据
    ↓
将数字ID转换为中文（31966 → 三一九六六）
    ↓
显示：ggg三一九六六室
```

## 相关文件

### 后端
- `Lineminiapp/source/application/api/service/passport/Login.php` - 用户创建逻辑
- `Lineminiapp/source/application/api/controller/Page.php` - 仓库地址API
- `Lineminiapp/web/clear_line_user_code.php` - 清空user_code脚本

### 前端
- `zalo_mini_app-master/src/pages/Home/Index.jsx` - 首页仓库地址显示

### 数据库
- `yoshop_user` 表：LINE用户的 `user_code` 字段为 NULL
- `yoshop_setting` 表：`is_show` 设置（可以是0或1，LINE用户都会使用User ID）

## 注意事项

1. **只转换用户ID**：只转换4-6位的数字，避免误转换电话号码等
2. **不影响其他页面**：转换逻辑只在首页仓库地址部分
3. **后端Fallback**：即使后台设置 `is_show=1`，LINE用户也会自动使用User ID模式
4. **缓存清理**：修改后端代码后需要清除 `runtime/cache/*`

## 日期
2026年1月13日
