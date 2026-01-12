-- 包裹层级管理系统数据库迁移脚本
-- 创建时间: 2024-01-15
-- 版本: v1.0

-- =====================================================
-- 1. 创建包(Box)表
-- =====================================================
CREATE TABLE `yoshop_box` (
  `box_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '包ID',
  `box_code` varchar(50) NOT NULL COMMENT '包编码',
  `box_name` varchar(100) DEFAULT NULL COMMENT '包名称',
  `container_id` int(11) UNSIGNED DEFAULT 0 COMMENT '所属箱ID',
  `package_count` int(11) UNSIGNED DEFAULT 0 COMMENT '包裹数量',
  `total_weight` decimal(10,2) DEFAULT 0.00 COMMENT '总重量(kg)',
  `total_volume` decimal(10,2) DEFAULT 0.00 COMMENT '总体积(cm³)',
  `max_weight` decimal(10,2) DEFAULT 10.00 COMMENT '最大承重(kg)',
  `max_volume` decimal(10,2) DEFAULT 50.00 COMMENT '最大体积(cm³)',
  `status` tinyint(3) DEFAULT 1 COMMENT '状态 1待装箱 2已装箱 3已发货',
  `operator_id` int(11) UNSIGNED DEFAULT 0 COMMENT '操作员ID',
  `operator_name` varchar(50) DEFAULT NULL COMMENT '操作员姓名',
  `storage_id` int(11) UNSIGNED DEFAULT 0 COMMENT '仓库ID',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `created_time` int(11) UNSIGNED DEFAULT 0 COMMENT '创建时间',
  `updated_time` int(11) UNSIGNED DEFAULT 0 COMMENT '更新时间',
  `wxapp_id` int(11) UNSIGNED DEFAULT 0 COMMENT '小程序ID',
  `is_delete` tinyint(3) UNSIGNED DEFAULT 0 COMMENT '是否删除',
  PRIMARY KEY (`box_id`),
  UNIQUE KEY `uk_box_code` (`box_code`, `wxapp_id`),
  KEY `idx_container_id` (`container_id`),
  KEY `idx_status` (`status`),
  KEY `idx_storage_id` (`storage_id`),
  KEY `idx_wxapp_id` (`wxapp_id`),
  KEY `idx_created_time` (`created_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='包管理表';

-- =====================================================
-- 2. 创建箱(Container)表
-- =====================================================
CREATE TABLE `yoshop_container` (
  `container_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '箱ID',
  `container_code` varchar(50) NOT NULL COMMENT '箱编码',
  `container_name` varchar(100) DEFAULT NULL COMMENT '箱名称',
  `pallet_id` int(11) UNSIGNED DEFAULT 0 COMMENT '所属托盘ID',
  `box_count` int(11) UNSIGNED DEFAULT 0 COMMENT '包数量',
  `package_count` int(11) UNSIGNED DEFAULT 0 COMMENT '包裹总数',
  `total_weight` decimal(10,2) DEFAULT 0.00 COMMENT '总重量(kg)',
  `total_volume` decimal(10,2) DEFAULT 0.00 COMMENT '总体积(cm³)',
  `max_weight` decimal(10,2) DEFAULT 50.00 COMMENT '最大承重(kg)',
  `max_volume` decimal(10,2) DEFAULT 100.00 COMMENT '最大体积(cm³)',
  `container_type` tinyint(3) DEFAULT 1 COMMENT '箱类型 1标准箱 2加强箱 3特殊箱',
  `status` tinyint(3) DEFAULT 1 COMMENT '状态 1待装托盘 2已装托盘 3已发货',
  `operator_id` int(11) UNSIGNED DEFAULT 0 COMMENT '操作员ID',
  `operator_name` varchar(50) DEFAULT NULL COMMENT '操作员姓名',
  `storage_id` int(11) UNSIGNED DEFAULT 0 COMMENT '仓库ID',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `created_time` int(11) UNSIGNED DEFAULT 0 COMMENT '创建时间',
  `updated_time` int(11) UNSIGNED DEFAULT 0 COMMENT '更新时间',
  `wxapp_id` int(11) UNSIGNED DEFAULT 0 COMMENT '小程序ID',
  `is_delete` tinyint(3) UNSIGNED DEFAULT 0 COMMENT '是否删除',
  PRIMARY KEY (`container_id`),
  UNIQUE KEY `uk_container_code` (`container_code`, `wxapp_id`),
  KEY `idx_pallet_id` (`pallet_id`),
  KEY `idx_status` (`status`),
  KEY `idx_storage_id` (`storage_id`),
  KEY `idx_wxapp_id` (`wxapp_id`),
  KEY `idx_created_time` (`created_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='箱管理表';

-- =====================================================
-- 3. 创建托盘(Pallet)表
-- =====================================================
CREATE TABLE `yoshop_pallet` (
  `pallet_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '托盘ID',
  `pallet_code` varchar(50) NOT NULL COMMENT '托盘编码',
  `pallet_name` varchar(100) DEFAULT NULL COMMENT '托盘名称',
  `batch_id` int(11) UNSIGNED DEFAULT 0 COMMENT '所属批次ID',
  `container_count` int(11) UNSIGNED DEFAULT 0 COMMENT '箱数量',
  `box_count` int(11) UNSIGNED DEFAULT 0 COMMENT '包总数',
  `package_count` int(11) UNSIGNED DEFAULT 0 COMMENT '包裹总数',
  `total_weight` decimal(10,2) DEFAULT 0.00 COMMENT '总重量(kg)',
  `total_volume` decimal(10,2) DEFAULT 0.00 COMMENT '总体积(cm³)',
  `max_weight` decimal(10,2) DEFAULT 1000.00 COMMENT '最大承重(kg)',
  `max_volume` decimal(10,2) DEFAULT 2000.00 COMMENT '最大体积(cm³)',
  `pallet_type` tinyint(3) DEFAULT 1 COMMENT '托盘类型 1标准 2加强 3特殊',
  `status` tinyint(3) DEFAULT 1 COMMENT '状态 1待装批次 2已装批次 3运输中 4已到达',
  `operator_id` int(11) UNSIGNED DEFAULT 0 COMMENT '操作员ID',
  `operator_name` varchar(50) DEFAULT NULL COMMENT '操作员姓名',
  `storage_id` int(11) UNSIGNED DEFAULT 0 COMMENT '仓库ID',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `created_time` int(11) UNSIGNED DEFAULT 0 COMMENT '创建时间',
  `updated_time` int(11) UNSIGNED DEFAULT 0 COMMENT '更新时间',
  `wxapp_id` int(11) UNSIGNED DEFAULT 0 COMMENT '小程序ID',
  `is_delete` tinyint(3) UNSIGNED DEFAULT 0 COMMENT '是否删除',
  PRIMARY KEY (`pallet_id`),
  UNIQUE KEY `uk_pallet_code` (`pallet_code`, `wxapp_id`),
  KEY `idx_batch_id` (`batch_id`),
  KEY `idx_status` (`status`),
  KEY `idx_storage_id` (`storage_id`),
  KEY `idx_wxapp_id` (`wxapp_id`),
  KEY `idx_created_time` (`created_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='托盘管理表';

-- =====================================================
-- 4. 修改现有Package表，添加box_id字段
-- =====================================================
ALTER TABLE `yoshop_package` 
ADD COLUMN `box_id` int(11) UNSIGNED DEFAULT 0 COMMENT '所属包ID' AFTER `batch_id`,
ADD KEY `idx_box_id` (`box_id`);

-- =====================================================
-- 5. 修改现有Batch表，添加层级统计字段
-- =====================================================
ALTER TABLE `yoshop_batch`
ADD COLUMN `pallet_count` int(11) UNSIGNED DEFAULT 0 COMMENT '托盘数量' AFTER `batch_type`,
ADD COLUMN `container_count` int(11) UNSIGNED DEFAULT 0 COMMENT '箱数量' AFTER `pallet_count`,
ADD COLUMN `box_count` int(11) UNSIGNED DEFAULT 0 COMMENT '包数量' AFTER `container_count`,
ADD COLUMN `package_count` int(11) UNSIGNED DEFAULT 0 COMMENT '包裹数量' AFTER `box_count`;

-- =====================================================
-- 6. 创建层级操作日志表
-- =====================================================
CREATE TABLE `yoshop_hierarchy_log` (
  `log_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '日志ID',
  `operation_type` varchar(50) NOT NULL COMMENT '操作类型',
  `source_type` varchar(20) NOT NULL COMMENT '源类型 package/box/container/pallet',
  `source_id` int(11) UNSIGNED NOT NULL COMMENT '源ID',
  `target_type` varchar(20) NOT NULL COMMENT '目标类型 box/container/pallet/batch',
  `target_id` int(11) UNSIGNED NOT NULL COMMENT '目标ID',
  `operator_id` int(11) UNSIGNED DEFAULT 0 COMMENT '操作员ID',
  `operator_name` varchar(50) DEFAULT NULL COMMENT '操作员姓名',
  `operation_desc` varchar(500) DEFAULT NULL COMMENT '操作描述',
  `before_status` tinyint(3) DEFAULT 0 COMMENT '操作前状态',
  `after_status` tinyint(3) DEFAULT 0 COMMENT '操作后状态',
  `created_time` int(11) UNSIGNED DEFAULT 0 COMMENT '创建时间',
  `wxapp_id` int(11) UNSIGNED DEFAULT 0 COMMENT '小程序ID',
  PRIMARY KEY (`log_id`),
  KEY `idx_source` (`source_type`, `source_id`),
  KEY `idx_target` (`target_type`, `target_id`),
  KEY `idx_operator_id` (`operator_id`),
  KEY `idx_created_time` (`created_time`),
  KEY `idx_wxapp_id` (`wxapp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='层级操作日志表';

-- =====================================================
-- 7. 创建编码生成序列表
-- =====================================================
CREATE TABLE `yoshop_code_sequence` (
  `seq_id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '序列ID',
  `seq_type` varchar(20) NOT NULL COMMENT '序列类型 box/container/pallet',
  `seq_date` varchar(8) NOT NULL COMMENT '日期 YYYYMMDD',
  `seq_number` int(11) UNSIGNED DEFAULT 0 COMMENT '当日序号',
  `wxapp_id` int(11) UNSIGNED DEFAULT 0 COMMENT '小程序ID',
  `created_time` int(11) UNSIGNED DEFAULT 0 COMMENT '创建时间',
  `updated_time` int(11) UNSIGNED DEFAULT 0 COMMENT '更新时间',
  PRIMARY KEY (`seq_id`),
  UNIQUE KEY `uk_seq` (`seq_type`, `seq_date`, `wxapp_id`),
  KEY `idx_wxapp_id` (`wxapp_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='编码生成序列表';

-- =====================================================
-- 8. 插入初始化数据
-- =====================================================

-- 插入新的员工角色权限
INSERT INTO `yoshop_store_role` (`role_name`, `sort`, `wxapp_id`, `create_time`, `update_time`) VALUES
('包装操作员', 70, 10001, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('装箱操作员', 80, 10001, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('托盘操作员', 90, 10001, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- 插入层级管理菜单权限
INSERT INTO `yoshop_store_access` (`access_name`, `parent_id`, `sort`, `create_time`, `update_time`) VALUES
('层级管理', 0, 60, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('包管理', LAST_INSERT_ID(), 10, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('箱管理', LAST_INSERT_ID()-1, 20, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('托盘管理', LAST_INSERT_ID()-2, 30, UNIX_TIMESTAMP(), UNIX_TIMESTAMP()),
('层级统计', LAST_INSERT_ID()-3, 40, UNIX_TIMESTAMP(), UNIX_TIMESTAMP());

-- =====================================================
-- 9. 创建存储过程和函数
-- =====================================================

DELIMITER $$

-- 生成编码的存储过程
CREATE PROCEDURE `sp_generate_code`(
    IN p_type VARCHAR(20),
    IN p_wxapp_id INT,
    OUT p_code VARCHAR(50)
)
BEGIN
    DECLARE v_date VARCHAR(8);
    DECLARE v_seq_number INT DEFAULT 1;
    DECLARE v_prefix VARCHAR(10);
    
    -- 获取当前日期
    SET v_date = DATE_FORMAT(NOW(), '%Y%m%d');
    
    -- 设置前缀
    CASE p_type
        WHEN 'box' THEN SET v_prefix = 'BOX';
        WHEN 'container' THEN SET v_prefix = 'CTN';
        WHEN 'pallet' THEN SET v_prefix = 'PLT';
        ELSE SET v_prefix = 'UNK';
    END CASE;
    
    -- 获取或创建序列号
    INSERT INTO yoshop_code_sequence (seq_type, seq_date, seq_number, wxapp_id, created_time, updated_time)
    VALUES (p_type, v_date, 1, p_wxapp_id, UNIX_TIMESTAMP(), UNIX_TIMESTAMP())
    ON DUPLICATE KEY UPDATE 
        seq_number = seq_number + 1,
        updated_time = UNIX_TIMESTAMP();
    
    -- 获取序列号
    SELECT seq_number INTO v_seq_number 
    FROM yoshop_code_sequence 
    WHERE seq_type = p_type AND seq_date = v_date AND wxapp_id = p_wxapp_id;
    
    -- 生成编码
    SET p_code = CONCAT(v_prefix, v_date, LPAD(v_seq_number, 4, '0'));
    
END$$

-- 更新层级统计的存储过程
CREATE PROCEDURE `sp_update_hierarchy_stats`(
    IN p_level VARCHAR(20),
    IN p_id INT,
    IN p_wxapp_id INT
)
BEGIN
    CASE p_level
        WHEN 'box' THEN
            UPDATE yoshop_box SET 
                package_count = (SELECT COUNT(*) FROM yoshop_package WHERE box_id = p_id),
                total_weight = (SELECT IFNULL(SUM(weight), 0) FROM yoshop_package WHERE box_id = p_id),
                updated_time = UNIX_TIMESTAMP()
            WHERE box_id = p_id;
            
        WHEN 'container' THEN
            UPDATE yoshop_container SET 
                box_count = (SELECT COUNT(*) FROM yoshop_box WHERE container_id = p_id),
                package_count = (SELECT COUNT(*) FROM yoshop_package p JOIN yoshop_box b ON p.box_id = b.box_id WHERE b.container_id = p_id),
                total_weight = (SELECT IFNULL(SUM(p.weight), 0) FROM yoshop_package p JOIN yoshop_box b ON p.box_id = b.box_id WHERE b.container_id = p_id),
                updated_time = UNIX_TIMESTAMP()
            WHERE container_id = p_id;
            
        WHEN 'pallet' THEN
            UPDATE yoshop_pallet SET 
                container_count = (SELECT COUNT(*) FROM yoshop_container WHERE pallet_id = p_id),
                box_count = (SELECT COUNT(*) FROM yoshop_box b JOIN yoshop_container c ON b.container_id = c.container_id WHERE c.pallet_id = p_id),
                package_count = (SELECT COUNT(*) FROM yoshop_package p JOIN yoshop_box b ON p.box_id = b.box_id JOIN yoshop_container c ON b.container_id = c.container_id WHERE c.pallet_id = p_id),
                total_weight = (SELECT IFNULL(SUM(p.weight), 0) FROM yoshop_package p JOIN yoshop_box b ON p.box_id = b.box_id JOIN yoshop_container c ON b.container_id = c.container_id WHERE c.pallet_id = p_id),
                updated_time = UNIX_TIMESTAMP()
            WHERE pallet_id = p_id;
            
        WHEN 'batch' THEN
            UPDATE yoshop_batch SET 
                pallet_count = (SELECT COUNT(*) FROM yoshop_pallet WHERE batch_id = p_id),
                container_count = (SELECT COUNT(*) FROM yoshop_container c JOIN yoshop_pallet p ON c.pallet_id = p.pallet_id WHERE p.batch_id = p_id),
                box_count = (SELECT COUNT(*) FROM yoshop_box b JOIN yoshop_container c ON b.container_id = c.container_id JOIN yoshop_pallet p ON c.pallet_id = p.pallet_id WHERE p.batch_id = p_id),
                package_count = (SELECT COUNT(*) FROM yoshop_package pkg JOIN yoshop_box b ON pkg.box_id = b.box_id JOIN yoshop_container c ON b.container_id = c.container_id JOIN yoshop_pallet p ON c.pallet_id = p.pallet_id WHERE p.batch_id = p_id),
                updated_time = UNIX_TIMESTAMP()
            WHERE batch_id = p_id;
    END CASE;
    
END$$

DELIMITER ;

-- =====================================================
-- 10. 创建触发器
-- =====================================================

-- Package表更新触发器
DELIMITER $$
CREATE TRIGGER `tr_package_hierarchy_update` 
AFTER UPDATE ON `yoshop_package`
FOR EACH ROW
BEGIN
    -- 如果box_id发生变化，更新相关统计
    IF OLD.box_id != NEW.box_id THEN
        -- 更新旧的box统计
        IF OLD.box_id > 0 THEN
            CALL sp_update_hierarchy_stats('box', OLD.box_id, NEW.wxapp_id);
        END IF;
        
        -- 更新新的box统计
        IF NEW.box_id > 0 THEN
            CALL sp_update_hierarchy_stats('box', NEW.box_id, NEW.wxapp_id);
        END IF;
    END IF;
END$$
DELIMITER ;

-- =====================================================
-- 执行完成提示
-- =====================================================
SELECT 'Package Hierarchy Migration Completed Successfully!' as Status;
