# 前端部署完整指南

## 问题说明

你有两个项目文件夹：
- `zalo_mini_app-master/` - **前端项目** (React + Vite)
- `Lineminiapp/` - **后端项目** (PHP ThinkPHP)

## 一、前端部署步骤

### 1. 在宝塔面板创建前端网站

#### 选项 A: 独立域名部署（推荐）

如果你有独立的前端域名（如 `app.longthai.itaoth.com`）：

1. **宝塔面板** → **网站** → **添加站点**
2. 填写信息：
   - **域名**: `app.longthai.itaoth.com`
   - **根目录**: `/www/wwwroot/app.longthai.itaoth.com`
   - **PHP版本**: 纯静态（不需要PHP）
3. 点击 **提交**

#### 选项 B: 子目录部署

如果使用后端域名的子目录（如 `longthai.itaoth.com/app`）：

1. 直接使用后端网站的目录
2. 在 `/www/wwwroot/longthai.itaoth.com/` 下创建 `app/` 文件夹
3. 前端访问地址：`https://longthai.itaoth.com/app/`

---

### 2. 本地构建前端项目

在 **本地电脑** 的 `zalo_mini_app-master/` 目录：

```bash
# 1. 确保环境设置为 production
# 编辑 src/config/env.js，确保：
# export const appEnv = "production";

# 2. 构建项目
npm run build

# 3. 构建完成后，会生成 dist/ 文件夹
```

---

### 3. 上传到服务器

#### 方法 A: 使用宝塔面板上传

1. **宝塔面板** → **文件** → 进入网站根目录
   - 独立域名：`/www/wwwroot/app.longthai.itaoth.com/`
   - 子目录：`/www/wwwroot/longthai.itaoth.com/app/`

2. 上传 `dist/` 文件夹内的**所有文件**（不是上传 dist 文件夹本身）
   - 压缩 `dist/` 内容为 `frontend.zip`
   - 上传 `frontend.zip` 到服务器
   - 在宝塔面板解压

3. 最终目录结构应该是：
   ```
   /www/wwwroot/app.longthai.itaoth.com/
   ├── index.html
   ├── assets/
   │   ├── index-xxx.js
   │   ├── index-xxx.css
   │   └── ...
   └── ...
   ```

#### 方法 B: 使用 FTP/SFTP

使用 FileZilla 或其他 FTP 工具上传 `dist/` 内的所有文件。

---

### 4. 配置 HTTPS（重要）

LINE Mini App **必须使用 HTTPS**！

1. **宝塔面板** → **网站** → 找到你的前端网站 → **设置**
2. **SSL** 标签
3. 选择以下之一：
   - **Let's Encrypt** 免费证书（推荐）
   - **其他证书** 上传你的证书
4. 点击 **申请** 或 **部署**
5. 开启 **强制HTTPS**

---

## 二、后端 open_basedir 错误修复

你看到的错误：
```
open_basedir restriction in effect. 
File(/www/wwwroot/longthai.itaoth.com/source/thinkphp/start.php) 
is not within the allowed path(s): (/www/wwwroot/longthai.itaoth.com/web/:/tmp/)
```

### 解决方案（推荐）

1. **登录宝塔面板**

2. **网站** → 找到 `longthai.itaoth.com` → 点击 **设置**

3. **网站目录** 标签

4. 找到 **防跨站攻击(open_basedir)**

5. **修改为**:
   ```
   /www/wwwroot/longthai.itaoth.com/:/tmp/:/proc/
   ```
   
   **重要**: 从 `/www/wwwroot/longthai.itaoth.com/web/` 改为 `/www/wwwroot/longthai.itaoth.com/`
   
   这样就允许访问整个项目目录，包括 `source/` 文件夹。

6. **保存**

7. **重启 PHP-FPM**
   - **软件商店** → **PHP 7.2** → **服务** → **重启**

---

## 三、验证部署

### 1. 测试后端 API

在浏览器访问：
```
https://longthai.itaoth.com/web/index.php?s=api/user/index
```

应该返回 JSON 数据，而不是错误。

### 2. 测试前端

访问你的前端地址：
- 独立域名：`https://app.longthai.itaoth.com`
- 子目录：`https://longthai.itaoth.com/app/`

应该能看到 LINE Mini App 登录界面。

---

## 四、常见问题

### Q1: 前端显示空白页？

**A**: 检查浏览器控制台（F12），查看是否有以下错误：
- **404 错误**: 文件路径不对，检查 `vite.config.js` 的 `base` 配置
- **CORS 错误**: 后端需要配置允许前端域名跨域访问

### Q2: API 请求失败？

**A**: 检查：
1. `src/config/env.js` 是否设置为 `production`
2. `src/config/config.js` 的 `proBaseURL` 是否正确
3. 后端 API 是否正常运行（访问上面的测试链接）

### Q3: LINE 登录失败？

**A**: 
1. 确保使用 HTTPS
2. 检查 LINE Developers 控制台的 LIFF 配置
3. Endpoint URL 应该指向你的前端地址

### Q4: 子目录部署时资源加载失败？

**A**: 修改 `vite.config.js`：
```javascript
export default defineConfig({
  base: '/app/', // 添加这一行，路径要和你的子目录一致
  // ... 其他配置
})
```

然后重新构建：`npm run build`

---

## 五、完整部署检查清单

### 后端部署
- [ ] 后端代码上传到 `/www/wwwroot/longthai.itaoth.com/`
- [ ] 修改 `open_basedir` 为 `/www/wwwroot/longthai.itaoth.com/:/tmp/:/proc/`
- [ ] 重启 PHP-FPM
- [ ] 测试 API 访问正常

### 前端部署
- [ ] 修改 `src/config/env.js` 为 `production`
- [ ] 确认 `src/config/config.js` 的 `proBaseURL` 正确
- [ ] 运行 `npm run build` 构建
- [ ] 上传 `dist/` 内容到服务器
- [ ] 配置 HTTPS 证书
- [ ] 开启强制 HTTPS
- [ ] 测试前端访问正常
- [ ] 测试 LINE 登录功能

---

## 六、推荐的目录结构

### 服务器目录结构

```
/www/wwwroot/
├── longthai.itaoth.com/          # 后端项目
│   ├── source/                    # PHP 源代码
│   │   ├── application/
│   │   └── thinkphp/
│   ├── web/                       # 后端入口
│   │   ├── index.php
│   │   └── static/
│   └── runtime/
│
└── app.longthai.itaoth.com/      # 前端项目（独立域名）
    ├── index.html
    ├── assets/
    └── ...
```

或者（子目录部署）：

```
/www/wwwroot/longthai.itaoth.com/
├── source/                        # PHP 源代码
├── web/                           # 后端入口
└── app/                           # 前端项目（子目录）
    ├── index.html
    ├── assets/
    └── ...
```

---

## 七、快速命令参考

### 本地构建
```bash
cd zalo_mini_app-master
npm run build
```

### 服务器命令（SSH）
```bash
# 重启 PHP-FPM
systemctl restart php-fpm

# 检查 open_basedir 配置
php -r "echo ini_get('open_basedir');"

# 查看 PHP 错误日志
tail -f /www/wwwlogs/longthai.itaoth.com.log
```

---

## 需要帮助？

如果遇到问题，请提供：
1. 错误截图或错误信息
2. 浏览器控制台（F12）的错误日志
3. 你选择的部署方式（独立域名 or 子目录）
4. 前端访问地址

---

**最后更新**: 2026-01-15
