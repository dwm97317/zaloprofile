-- 修改用户地址表字段长度以支持完整的越南地址
-- 执行时间: 2025-01-25

USE zalo_itaoth_com;

-- 修改 street 字段长度从 varchar(50) 到 varchar(255)
ALTER TABLE `yoshop_user_address` 
MODIFY COLUMN `street` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT '' COMMENT '街道地址';

-- 验证修改结果
DESCRIBE `yoshop_user_address`;

-- 显示修改后的表结构
SHOW CREATE TABLE `yoshop_user_address`;
