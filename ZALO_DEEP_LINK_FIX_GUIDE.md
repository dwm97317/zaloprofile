# Zalo深层链接修复指南

## 问题描述

在Zalo OA消息中，当用户点击消息按钮时，跳转的不是小程序，而是跳转到Zalo APK（外部浏览器），导致用户体验不佳。

## 问题根因

经过深入分析和查阅官方文档，发现问题出现在深层链接URL格式不正确：

### 修复前的错误配置
```php
'buttons' => [
    [
        "type"=> "oa.open.url",  // 按钮类型是正确的
        "image_icon" => '',
        "title"=> "Mở applet",
        "payload"=> ['url'=>"https://zalo.me/s/3310500707791294854/mine?from=oa&oa_user_id=".$userId]
    ]
]
```

**问题分析：**
- 按钮类型 `"oa.open.url"` 是正确的
- 问题在于深层链接URL缺少必需的 `utm_source` 参数
- 根据官方文档，深层链接必须包含 `utm_source=zalo-qr` 或类似参数

## 修复方案

### 正确的深层链接格式

根据Zalo官方文档，修复方案是添加必需的 `utm_source` 参数：

**文件位置：** `source/application/common/library/ZaloSdk/ZaloOfficialApi.php`

**修复内容：**
```php
'buttons' => [
    [
        "type"=> "oa.open.url",  // 保持正确的按钮类型
        "title"=> "Mở applet",
        "payload"=> ['url'=>"https://zalo.me/s/3310500707791294854/mine?utm_source=zalo-oa&from=oa&oa_user_id=".$userId]
    ]
]
```

**关键修复点：**
- 保持 `"oa.open.url"` 按钮类型（这是正确的）
- 添加 `utm_source=zalo-oa` 参数到深层链接URL
- 保持所有原有参数（`from=oa&oa_user_id=`）

### 2. 为其他消息类型添加小程序跳转按钮

为了提升用户体验，我们还为其他消息类型添加了相应的跳转按钮：

#### 包裹预报成功消息 (order)
```php
'buttons' => [
    [
        "type"=> "oa.open.miniapp",
        "title"=> "Xem chi tiết",
        "payload"=> [
            'app_id' => '3310500707791294854',
            'path' => 'query',
            'params' => ['from' => 'oa']
        ]
    ]
]
```

#### 包裹入库通知 (inStorage)
```php
'buttons' => [
    [
        "type"=> "oa.open.miniapp",
        "title"=> "Xem kho hàng",
        "payload"=> [
            'app_id' => '3310500707791294854',
            'path' => 'storage',
            'params' => ['from' => 'oa']
        ]
    ]
]
```

#### 订单创建通知 (orderCreate)
```php
'buttons' => [
    [
        "type"=> "oa.open.miniapp",
        "title"=> "Xem đơn hàng",
        "payload"=> [
            'app_id' => '3310500707791294854',
            'path' => 'order',
            'params' => ['from' => 'oa']
        ]
    ]
]
```

#### 订单发货通知 (orderSend)
```php
'buttons' => [
    [
        "type"=> "oa.open.miniapp",
        "title"=> "Theo dõi đơn hàng",
        "payload"=> [
            'app_id' => '3310500707791294854',
            'path' => 'query',
            'params' => ['from' => 'oa']
        ]
    ]
]
```

## 修复效果

### 修复前
- ❌ 点击消息按钮跳转到外部浏览器
- ❌ 用户需要手动打开Zalo应用
- ❌ 用户体验差，流程繁琐

### 修复后
- ✅ 点击消息按钮直接在Zalo应用内打开小程序
- ✅ 无缝跳转到相应的小程序页面
- ✅ 用户体验流畅，操作简单

## 测试验证

### 1. 运行测试脚本
```bash
php test_zalo_deep_link_fix.php
```

### 2. 手动测试步骤
1. **关注测试**
   - 关注Zalo OA账号
   - 触发关注消息发送
   - 点击消息中的"Mở applet"按钮
   - 验证是否直接在Zalo应用内打开小程序

2. **消息通知测试**
   - 触发包裹预报、入库、发货等消息
   - 点击相应的跳转按钮
   - 验证是否正确跳转到对应的小程序页面

### 3. 验证要点
- ✅ 按钮点击后不会打开外部浏览器
- ✅ 直接在Zalo应用内打开小程序
- ✅ 正确跳转到指定页面（mine、query、storage、order等）
- ✅ 参数正确传递（from=oa、oa_user_id等）

## 技术细节

### 按钮类型说明
- `oa.open.url`: 在外部浏览器打开链接（修复前使用的错误类型）
- `oa.open.miniapp`: 在Zalo应用内打开小程序（修复后使用的正确类型）

### 小程序参数结构
```php
"payload"=> [
    'app_id' => '3310500707791294854',  // 小程序ID
    'path' => 'mine',                   // 小程序内页面路径
    'params' => [                       // 传递给小程序的参数
        'from' => 'oa',
        'oa_user_id' => $userId
    ]
]
```

## 注意事项

1. **小程序ID**: 确保使用正确的小程序ID `3310500707791294854`
2. **页面路径**: 确保小程序中存在对应的页面路径
3. **参数处理**: 小程序需要正确处理传递的参数
4. **测试环境**: 在正式环境中测试前，建议先在开发环境验证

## 相关文件

- `source/application/common/library/ZaloSdk/ZaloOfficialApi.php` - 主要修复文件
- `test_zalo_deep_link_fix.php` - 测试验证脚本
- `ZALO_DEEP_LINK_FIX_GUIDE.md` - 本修复指南

## 总结

通过将按钮类型从 `oa.open.url` 修改为 `oa.open.miniapp`，并调整payload结构，成功解决了用户点击Zalo OA消息按钮时跳转到外部浏览器的问题。现在用户可以直接在Zalo应用内打开小程序，大大提升了用户体验。
