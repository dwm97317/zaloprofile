#!/bin/bash

# 服务器同步脚本
# 将修复的越南地址功能文件同步到生产服务器

# 服务器配置
SERVER_IP="160.191.53.56"
SERVER_PORT="4433"
SERVER_USER="root"
SERVER_PATH="/www/wwwroot/zalonew.itaoth.com"
FILE_OWNER="www"

echo "🚀 开始同步越南地址修复文件到服务器..."
echo "服务器: $SERVER_IP"
echo "目标路径: $SERVER_PATH"
echo ""

# 1. 同步后端PHP文件
echo "📤 同步后端PHP文件..."

# GoongAddress控制器
scp -P $SERVER_PORT -r source/application/api/controller/GoongAddress.php root@$SERVER_IP:$SERVER_PATH/source/application/api/controller/
echo "✅ GoongAddress.php 已同步"

# GoongApi类库
scp -P $SERVER_PORT -r source/application/common/library/GoongApi/ root@$SERVER_IP:$SERVER_PATH/source/application/common/library/
echo "✅ GoongApi类库 已同步"

# API路由配置
scp -P $SERVER_PORT source/route/api.php root@$SERVER_IP:$SERVER_PATH/source/route/
echo "✅ API路由配置 已同步"

# 测试脚本
scp -P $SERVER_PORT test_goong_api.php root@$SERVER_IP:$SERVER_PATH/
echo "✅ API测试脚本 已同步"

echo ""

# 2. 同步前端文件
echo "📤 同步前端React文件..."

# GoongAddressPicker组件
ssh -p $SERVER_PORT root@$SERVER_IP "mkdir -p $SERVER_PATH/zalo_mini_app-master/src/components/GoongAddressPicker"
scp -P $SERVER_PORT zalo_mini_app-master/src/components/GoongAddressPicker/* root@$SERVER_IP:$SERVER_PATH/zalo_mini_app-master/src/components/GoongAddressPicker/
echo "✅ GoongAddressPicker组件 已同步"

# AddressApi工具类
scp -P $SERVER_PORT zalo_mini_app-master/src/utils/addressApi.js root@$SERVER_IP:$SERVER_PATH/zalo_mini_app-master/src/utils/
echo "✅ AddressApi工具类 已同步"

# 修复后的Create.jsx
scp -P $SERVER_PORT zalo_mini_app-master/src/pages/Address/Create.jsx root@$SERVER_IP:$SERVER_PATH/zalo_mini_app-master/src/pages/Address/
echo "✅ 地址创建页面 已同步"

echo ""

# 3. 同步文档文件
echo "📤 同步文档和指南..."

scp -P $SERVER_PORT GOONG_ADDRESS_FIX_GUIDE.md root@$SERVER_IP:$SERVER_PATH/
scp -P $SERVER_PORT VIETNAMESE_ADDRESS_INTEGRATION_GUIDE.md root@$SERVER_IP:$SERVER_PATH/
echo "✅ 文档文件 已同步"

echo ""

# 4. 设置正确的文件权限
echo "🔧 设置文件权限..."

ssh -p $SERVER_PORT root@$SERVER_IP << EOF
cd $SERVER_PATH

# 设置PHP文件权限
chown -R $FILE_OWNER:$FILE_OWNER source/
chmod -R 755 source/

# 设置前端文件权限
chown -R $FILE_OWNER:$FILE_OWNER zalo_mini_app-master/
chmod -R 755 zalo_mini_app-master/

# 设置文档权限
chown $FILE_OWNER:$FILE_OWNER *.md
chmod 644 *.md

# 设置测试脚本权限
chown $FILE_OWNER:$FILE_OWNER test_goong_api.php
chmod 755 test_goong_api.php

echo "✅ 文件权限设置完成"
EOF

echo ""
echo "🎉 文件同步完成！"
echo ""
echo "📋 同步清单："
echo "  ✅ GoongAddress控制器"
echo "  ✅ GoongApi类库"
echo "  ✅ API路由配置"
echo "  ✅ GoongAddressPicker组件"
echo "  ✅ AddressApi工具类"
echo "  ✅ 地址创建页面"
echo "  ✅ 文档和测试文件"
echo ""
echo "🔧 后续步骤："
echo "1. 测试API功能: ssh -p $SERVER_PORT root@$SERVER_IP 'php $SERVER_PATH/test_goong_api.php'"
echo "2. 重建前端: ssh -p $SERVER_PORT root@$SERVER_IP 'cd $SERVER_PATH/zalo_mini_app-master && npm run build'"
echo "3. 重启web服务器"
echo ""