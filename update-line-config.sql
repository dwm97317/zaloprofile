-- LINE Mini App 配置更新脚本
-- 使用方法：将下面的值替换为你从 LINE Developers Console 获取的实际值

-- 1. 更新 LINE 配置
UPDATE yoshop_setting 
SET `values` = '{
  "is_enable": 1,
  "liff_id": "YOUR_LIFF_ID_HERE",
  "liff_size": "full",
  "scopes": ["openid", "profile"],
  "bot_link": "Normal",
  "channel_id": "YOUR_CHANNEL_ID_HERE",
  "channel_secret": "YOUR_CHANNEL_SECRET_HERE",
  "google_maps_key": ""
}'
WHERE `key` = 'line_config';

-- 2. 更新 LINE Pay 配置（如果需要）
UPDATE yoshop_setting 
SET `values` = '{
  "is_enable": 0,
  "channel_id": "YOUR_LINE_PAY_CHANNEL_ID",
  "channel_secret": "YOUR_LINE_PAY_CHANNEL_SECRET",
  "sandbox": 1
}'
WHERE `key` = 'line_pay';

-- 3. 验证配置
SELECT `key`, `values` FROM yoshop_setting WHERE `key` IN ('line_config', 'line_pay');

-- 配置说明：
-- 
-- liff_id: 从 LINE Developers Console 的 LIFF 设置中获取
--   格式示例: "2008873580-2xOUaLCU"
--
-- liff_size: LIFF 应用显示大小
--   - "full": 全屏（推荐）
--   - "tall": 75% 屏幕高度
--   - "compact": 50% 屏幕高度
--
-- scopes: 权限范围
--   - "openid": 获取用户 ID（必需）
--   - "profile": 获取用户资料（推荐）
--   - "email": 获取用户邮箱（可选）
--
-- bot_link: 添加好友按钮
--   - "Normal": 显示添加好友按钮
--   - "Aggressive": 强制添加好友
--   - "Off": 不显示
--
-- channel_id: LINE Login Channel ID
--   从 Basic settings 页面获取
--
-- channel_secret: LINE Login Channel Secret
--   从 Basic settings 页面获取（需要先 Issue）
--
-- LINE Pay 配置：
-- sandbox: 沙盒模式
--   - 1: 测试环境
--   - 0: 生产环境
