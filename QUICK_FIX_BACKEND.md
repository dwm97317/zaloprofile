# 后端 open_basedir 错误快速修复

## 错误原因

你的后端 PHP 无法访问 `source/` 目录，因为宝塔面板的安全限制。

## 快速修复步骤（5分钟）

### 1. 登录宝塔面板
```
http://你的服务器IP:8888
```

### 2. 修改网站配置

1. 点击左侧 **网站**
2. 找到 `longthai.itaoth.com`
3. 点击右侧 **设置** 按钮
4. 点击 **网站目录** 标签

### 3. 修改 open_basedir

找到 **防跨站攻击(open_basedir)** 设置：

**当前值**（错误的）:
```
/www/wwwroot/longthai.itaoth.com/web/:/tmp/
```

**修改为**（正确的）:
```
/www/wwwroot/longthai.itaoth.com/:/tmp/:/proc/
```

**关键变化**: 去掉 `web/`，改为整个项目目录

### 4. 保存并重启

1. 点击 **保存**
2. 点击左侧 **软件商店**
3. 找到 **PHP 7.2**（或你使用的 PHP 版本）
4. 点击 **设置**
5. 点击 **服务** 标签
6. 点击 **重启** 按钮

### 5. 验证修复

在浏览器访问：
```
https://longthai.itaoth.com/web/index.php?s=api/user/index
```

**成功**: 返回 JSON 数据
```json
{
  "code": 1,
  "msg": "success",
  "data": {...}
}
```

**失败**: 仍然显示 `open_basedir restriction` 错误

---

## 如果还是不行

### 方案 A: 检查 .user.ini 文件

1. 宝塔面板 → **文件**
2. 进入 `/www/wwwroot/longthai.itaoth.com/web/`
3. 找到 `.user.ini` 文件（隐藏文件，需要显示隐藏文件）
4. 编辑，找到 `open_basedir` 行
5. 修改为：
   ```ini
   open_basedir=/www/wwwroot/longthai.itaoth.com/:/tmp/:/proc/
   ```
6. 保存
7. 重启 PHP-FPM

### 方案 B: 关闭 open_basedir（不推荐）

如果是独立服务器（不是共享主机），可以临时关闭：

1. 宝塔面板 → 网站 → 设置 → 网站目录
2. **防跨站攻击(open_basedir)** 设置为空或点击 **关闭**
3. 保存
4. 重启 PHP-FPM

---

## 图解步骤

```
宝塔面板
  ↓
网站
  ↓
找到 longthai.itaoth.com
  ↓
点击 "设置"
  ↓
点击 "网站目录" 标签
  ↓
找到 "防跨站攻击(open_basedir)"
  ↓
修改为: /www/wwwroot/longthai.itaoth.com/:/tmp/:/proc/
  ↓
保存
  ↓
软件商店 → PHP 7.2 → 服务 → 重启
  ↓
完成！
```

---

## 修复后前端应该能正常工作

修复后，你的前端错误会消失：
- ❌ `Invalid API response structure: Warning: require(): open_basedir...`
- ✅ 正常显示 LINE Mini App 界面

---

**预计修复时间**: 5 分钟
**难度**: ⭐ 简单
