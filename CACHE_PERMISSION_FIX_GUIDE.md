# 缓存权限问题修复指南

## 问题概述
PHP应用无法写入cache文件到runtime目录，导致`file_put_contents(): failed to open stream: Permission denied`错误。

## 快速修复（生产环境）

```bash
# 1. 进入项目目录
cd /www/wwwroot/zalonew.itaoth.com

# 2. 设置正确的目录权限
chmod -R 755 source/runtime/
chmod -R 775 source/runtime/cache/
chmod -R 775 source/runtime/temp/
chmod -R 775 source/runtime/log/

# 3. 设置正确的所有者（根据你的web服务器）
# 对于Nginx:
chown -R nginx:nginx source/runtime/
# 对于Apache:
chown -R www-data:www-data source/runtime/
# 对于其他web服务器，请替换为相应的用户名
```

## 权限设置说明

| 目录 | 建议权限 | 说明 |
|-----|---------|------|
| `source/runtime/` | 755 | 基础runtime目录 |
| `source/runtime/cache/` | 775 | 缓存文件目录，需要写入权限 |
| `source/runtime/temp/` | 775 | 临时文件目录 |
| `source/runtime/log/` | 775 | 日志文件目录 |

## 长期解决方案

### 1. 使用Redis缓存（推荐）

编辑 `source/application/config.php`：

```php
'cache' => [
    'type' => 'Redis',
    'host' => '127.0.0.1',
    'port' => 6379,
    'password' => '',
    'select' => 0,
    'timeout' => 0,
    'expire' => 0,
    'persistent' => false,
    'prefix' => 'zalo_cache_',
],
```

### 2. 使用Memcache缓存

```php
'cache' => [
    'type' => 'Memcache',
    'host' => '127.0.0.1',
    'port' => 11211,
    'prefix' => 'zalo_cache_',
    'expire' => 0,
],
```

## 部署脚本

创建部署脚本 `scripts/fix_permissions.sh`：

```bash
#!/bin/bash
# 缓存权限修复脚本

PROJECT_ROOT="/www/wwwroot/zalonew.itaoth.com"
WEB_USER="nginx"  # 根据实际情况修改

echo "开始修复缓存权限..."

# 设置目录权限
chmod -R 755 ${PROJECT_ROOT}/source/runtime/
chmod -R 775 ${PROJECT_ROOT}/source/runtime/cache/
chmod -R 775 ${PROJECT_ROOT}/source/runtime/temp/
chmod -R 775 ${PROJECT_ROOT}/source/runtime/log/

# 设置所有者
chown -R ${WEB_USER}:${WEB_USER} ${PROJECT_ROOT}/source/runtime/

echo "权限修复完成！"

# 验证权限
echo "当前权限状态："
ls -la ${PROJECT_ROOT}/source/runtime/
```

## 监控和检查

### 检查当前权限
```bash
ls -la source/runtime/
ls -la source/runtime/cache/
```

### 检查web服务器用户
```bash
ps aux | grep nginx  # 或 apache
```

### 测试缓存写入
在PHP中测试：
```php
<?php
$testFile = '/www/wwwroot/zalonew.itaoth.com/source/runtime/cache/test.txt';
if (file_put_contents($testFile, 'test') !== false) {
    echo "缓存目录可写入";
    unlink($testFile);
} else {
    echo "缓存目录无法写入";
}
?>
```

## 注意事项

1. **安全性**: 不要使用777权限，这会带来安全风险
2. **备份**: 修改权限前先备份重要数据
3. **环境一致**: 确保开发、测试、生产环境权限配置一致
4. **定期检查**: 定期检查权限设置，避免因系统更新导致权限变化

## 常见问题

**Q: 修改权限后仍然报错怎么办？**
A: 检查SELinux状态，可能需要设置SELinux策略或临时禁用

**Q: 使用Redis缓存需要什么条件？**
A: 服务器需要安装Redis服务和PHP Redis扩展

**Q: 如何确定web服务器用户？**
A: 使用 `ps aux | grep nginx` 或查看web服务器配置文件