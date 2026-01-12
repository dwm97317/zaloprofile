-- 修改 user_address 表的 street 字段长度为 255
-- 数据库连接信息：
-- 主机: 160.191.53.56
-- 端口: 3306
-- 用户名: zalo_itaoth_com
-- 密码: 2Kwi7STcaJ2R78Np
-- 数据库: zalo_itaoth_com

USE zalo_itaoth_com;

-- 查看当前 street 字段的结构
DESCRIBE user_address;

-- 修改 street 字段长度为 255
ALTER TABLE user_address MODIFY COLUMN street VARCHAR(255) DEFAULT '' COMMENT '街道地址';

-- 验证修改结果
DESCRIBE user_address;

-- 查看一些示例数据
SELECT address_id, name, street, detail FROM user_address LIMIT 10;
