# 设计文档: 社区拼团配送系统

**功能分支**: `group-buying-system`
**创建日期**: 2026-01-16
**状态**: 设计中

## 概述

社区拼团配送系统是一个基于社区的包裹集运优化方案,通过"团长"角色组织本地用户拼团,实现运费优惠和配送效率提升。系统包含三个主要应用:用户端(LINE Mini App)、团长端(LINE Mini App + Web)和后台管理系统。

### 核心价值主张

- **用户**: 通过拼团享受更低运费,通过本地团长获得更快配送
- **团长**: 通过提供包裹分发服务获得收益,建立本地服务品牌
- **平台**: 提升用户粘性,创造新的收益模式,优化物流成本

### 技术栈选择

**后端**: ThinkPHP 5.x
- 与现有系统一致,可复用现有基础设施
- 成熟的 MVC 架构,便于团队协作
- 丰富的扩展库支持

**前端**: React 18 + Vite 4 + Tailwind CSS
- 用户端和团长端共享组件库
- 快速的开发体验和构建速度
- 响应式设计,适配多端

**团长端部署**:
- LINE Mini App: 使用 LIFF SDK,与用户端共享代码
- Web 应用: 独立部署,支持桌面端操作

## 架构设计

### 系统架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         用户层                               │
├──────────────┬──────────────┬──────────────┬────────────────┤
│  用户端      │  团长端      │  团长端      │  后台管理      │
│ (LINE Mini)  │ (LINE Mini)  │   (Web)      │   (Web)        │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                      │
              ┌───────▼────────┐
              │   API Gateway   │
              │  (ThinkPHP)     │
              └───────┬────────┘
                      │
       ┌──────────────┼──────────────┐
       │              │              │
   ┌───▼───┐     ┌───▼───┐     ┌───▼───┐
   │ 拼团   │     │ 用户   │     │ 订单   │
   │ 服务   │     │ 服务   │     │ 服务   │
   └───┬───┘     └───┬───┘     └───┬───┘
       │              │              │
       └──────────────┼──────────────┘
                      │
              ┌───────▼────────┐
              │   MySQL 数据库  │
              └────────────────┘
```

### 模块划分

#### 1. 用户端模块
- 拼团广场(浏览/筛选/搜索)
- 拼团详情(查看/加入)
- 我的拼团(订单管理)
- 团长申请
- 评价系统

#### 2. 团长端模块
- 拼团管理(创建/查看)
- 包裹接收(扫码入库)
- 包裹分发(扫码出库)
- 收益查看
- 团员管理

#### 3. 后台管理模块
- 团长审核
- 拼团配置(保证金/收益/订单模式)
- 数据统计
- 异常处理

## 组件与接口设计

### 核心组件

#### 1. 拼团服务 (GroupBuyingService)

**职责**: 管理拼团订单的完整生命周期

**主要方法**:
```php
class GroupBuyingService
{
    // 创建拼团
    public function createGroup($leaderId, $params)
    
    // 加入拼团
    public function joinGroup($groupId, $userId, $packageId)
    
    // 退出拼团
    public function leaveGroup($groupId, $userId)
    
    // 拼团成团
    public function completeGroup($groupId)
    
    // 拼团取消
    public function cancelGroup($groupId, $reason)
    
    // 获取拼团列表
    public function getGroupList($filters, $page, $pageSize)
}
```

#### 2. 团长服务 (LeaderService)

**职责**: 管理团长资格、等级和权限

**主要方法**:
```php
class LeaderService
{
    // 申请成为团长
    public function applyLeader($userId, $application)
    
    // 审核团长申请
    public function reviewApplication($applicationId, $status, $reason)
    
    // 更新团长等级
    public function updateLeaderLevel($leaderId)
    
    // 验证团长权限
    public function checkLeaderPermission($leaderId, $groupId)
    
    // 获取团长统计
    public function getLeaderStats($leaderId)
}
```

#### 3. 包裹管理服务 (PackageManagementService)

**职责**: 处理包裹接收和分发

**主要方法**:
```php
class PackageManagementService
{
    // 团长接收包裹
    public function receivePackage($leaderId, $packageBarcode)
    
    // 团长分发包裹
    public function deliverPackage($leaderId, $memberQRCode)
    
    // 生成团员取货二维码
    public function generatePickupQRCode($groupId, $memberId)
    
    // 标记异常
    public function markException($packageId, $type, $description)
    
    // 提醒团员取货
    public function remindMember($packageId)
}
```

#### 4. 订单模式适配器 (OrderModeAdapter)

**职责**: 根据配置的订单模式执行不同的订单处理逻辑

**主要方法**:
```php
interface OrderModeInterface
{
    // 创建拼团订单
    public function createGroupOrder($groupId, $packages);
    
    // 更新收货地址
    public function updateShippingAddress($packages, $leaderAddress);
    
    // 处理退出拼团
    public function handleLeaveGroup($packageId);
    
    // 完成订单
    public function completeOrder($groupId);
}

class VirtualModeAdapter implements OrderModeInterface { }
class CombinedModeAdapter implements OrderModeInterface { }
class HybridModeAdapter implements OrderModeInterface { }
```

#### 5. 收益计算服务 (EarningsCalculator)

**职责**: 根据配置计算团长收益

**主要方法**:
```php
class EarningsCalculator
{
    // 计算收益
    public function calculate($groupId, $leaderId)
    
    // 结算收益
    public function settle($groupId, $leaderId)
    
    // 获取收益配置
    private function getEarningsConfig($leaderLevel)
}
```

### API 接口设计

#### 用户端 API

**拼团广场**
```
GET /api/group/list
参数: {
  type: 'international|local|integrated',
  destination: string,
  leaderLevel: 'junior|middle|senior',
  sortBy: 'time|discount',
  page: number,
  pageSize: number
}
响应: {
  code: 200,
  data: {
    list: GroupOrder[],
    total: number,
    hasMore: boolean
  }
}
```

**加入拼团**
```
POST /api/group/join
参数: {
  groupId: number,
  packageId: number
}
响应: {
  code: 200,
  data: {
    groupOrder: GroupOrder,
    payment: {
      originalFee: number,
      discountFee: number,
      actualFee: number
    }
  }
}
```

**我的拼团**
```
GET /api/group/my-groups
参数: {
  status: 'pending|active|completed|cancelled',
  role: 'leader|member',
  page: number
}
响应: {
  code: 200,
  data: {
    list: GroupOrder[],
    stats: {
      active: number,
      completed: number,
      totalSaved: number
    }
  }
}
```

#### 团长端 API

**扫码接收包裹**
```
POST /api/leader/receive-package
参数: {
  barcode: string
}
响应: {
  code: 200,
  data: {
    package: Package,
    group: GroupOrder,
    receivedCount: number,
    totalCount: number
  }
}
```

**扫码分发包裹**
```
POST /api/leader/deliver-package
参数: {
  qrCode: string
}
响应: {
  code: 200,
  data: {
    package: Package,
    member: User,
    remainingCount: number
  }
}
```

**团长拼团列表**
```
GET /api/leader/my-groups
参数: {
  status: 'pending|active|delivering|completed'
}
响应: {
  code: 200,
  data: {
    list: GroupOrder[],
    stats: {
      totalEarnings: number,
      pendingEarnings: number,
      completedOrders: number
    }
  }
}
```

#### 后台管理 API

**团长审核**
```
POST /api/admin/leader/review
参数: {
  applicationId: number,
  status: 'approved|rejected',
  reason: string
}
```

**拼团配置**
```
POST /api/admin/config/group-buying
参数: {
  depositConfig: {
    junior: number,
    middle: number,
    senior: number
  },
  earningsConfig: {
    mode: 'fixed|percentage|hybrid',
    junior: object,
    middle: object,
    senior: object
  },
  orderMode: 'virtual|combined|hybrid'
}
```

## 数据模型设计

### 数据库表结构

#### 1. 团长表 (group_leader)
```sql
CREATE TABLE `group_leader` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL COMMENT '用户ID',
  `level` enum('junior','middle','senior') DEFAULT 'junior' COMMENT '等级',
  `service_area` json COMMENT '服务范围(地理坐标)',
  `service_types` set('international','local','integrated') COMMENT '服务类型',
  `deposit_balance` decimal(10,2) DEFAULT '0.00' COMMENT '保证金余额',
  `total_orders` int(11) DEFAULT '0' COMMENT '累计完成单数',
  `rating` decimal(3,2) DEFAULT '5.00' COMMENT '好评率',
  `credit_score` int(11) DEFAULT '100' COMMENT '信用评分',
  `status` enum('normal','suspended','disabled') DEFAULT 'normal',
  `audit_status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`,`audit_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='团长表';
```

#### 2. 拼团订单表 (group_order)
```sql
CREATE TABLE `group_order` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `order_no` varchar(32) NOT NULL COMMENT '拼团订单号',
  `leader_id` int(11) unsigned NOT NULL COMMENT '团长ID',
  `group_type` enum('international','local','integrated') NOT NULL COMMENT '拼团类型',
  `order_mode` enum('virtual','combined','hybrid') NOT NULL COMMENT '订单模式',
  `destination_area` varchar(255) NOT NULL COMMENT '目的地区域',
  `leader_address_id` int(11) unsigned NOT NULL COMMENT '团长收货地址ID',
  `max_members` int(11) DEFAULT '10' COMMENT '最大人数',
  `min_members` int(11) DEFAULT '2' COMMENT '最低人数',
  `current_members` int(11) DEFAULT '0' COMMENT '当前人数',
  `discount_rate` decimal(5,2) DEFAULT '0.80' COMMENT '优惠运费比例',
  `deadline` datetime NOT NULL COMMENT '截止时间',
  `status` enum('pending','active','delivering','completed','cancelled') DEFAULT 'pending',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_order_no` (`order_no`),
  KEY `idx_leader_id` (`leader_id`),
  KEY `idx_status` (`status`),
  KEY `idx_deadline` (`deadline`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='拼团订单表';
```

#### 3. 拼团包裹表 (group_package)
```sql
CREATE TABLE `group_package` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `group_order_id` int(11) unsigned NOT NULL COMMENT '拼团订单ID',
  `member_user_id` int(11) unsigned NOT NULL COMMENT '团员用户ID',
  `original_order_id` int(11) unsigned COMMENT '原始订单ID',
  `package_id` int(11) unsigned NOT NULL COMMENT '包裹ID',
  `original_fee` decimal(10,2) NOT NULL COMMENT '原运费',
  `discount_fee` decimal(10,2) NOT NULL COMMENT '优惠运费',
  `actual_fee` decimal(10,2) NOT NULL COMMENT '实付运费',
  `status` enum('joined','received','delivered','cancelled') DEFAULT 'joined',
  `joined_at` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '加入时间',
  `received_at` datetime COMMENT '接收时间',
  `delivered_at` datetime COMMENT '交付时间',
  `pickup_qrcode` varchar(255) COMMENT '取货二维码',
  PRIMARY KEY (`id`),
  KEY `idx_group_order` (`group_order_id`),
  KEY `idx_member` (`member_user_id`),
  KEY `idx_package` (`package_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='拼团包裹表';
```

#### 4. 团长操作日志表 (leader_operation_log)
```sql
CREATE TABLE `leader_operation_log` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `leader_id` int(11) unsigned NOT NULL,
  `group_order_id` int(11) unsigned,
  `package_id` int(11) unsigned,
  `operation_type` enum('receive','deliver','mark_exception','remind') NOT NULL,
  `operation_detail` json COMMENT '操作详情',
  `device_info` varchar(255) COMMENT '设备信息',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_leader` (`leader_id`),
  KEY `idx_group_order` (`group_order_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='团长操作日志表';
```

#### 5. 收益记录表 (earnings_record)
```sql
CREATE TABLE `earnings_record` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `leader_id` int(11) unsigned NOT NULL,
  `group_order_id` int(11) unsigned NOT NULL,
  `base_earnings` decimal(10,2) DEFAULT '0.00' COMMENT '基础收益',
  `commission_earnings` decimal(10,2) DEFAULT '0.00' COMMENT '提成收益',
  `bonus_earnings` decimal(10,2) DEFAULT '0.00' COMMENT '奖励收益',
  `total_earnings` decimal(10,2) NOT NULL COMMENT '总收益',
  `status` enum('pending','settled','withdrawn') DEFAULT 'pending',
  `settled_at` datetime COMMENT '结算时间',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_leader` (`leader_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='收益记录表';
```

#### 6. 系统配置表 (group_buying_config)
```sql
CREATE TABLE `group_buying_config` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `config_key` varchar(50) NOT NULL COMMENT '配置键',
  `config_value` json NOT NULL COMMENT '配置值',
  `description` varchar(255) COMMENT '配置说明',
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='拼团配置表';
```

### 数据关系图

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│ group_leader│1─────n│ group_order  │1─────n│group_package│
└─────────────┘       └──────────────┘       └─────────────┘
       │                      │                      │
       │                      │                      │
       │              ┌───────▼────────┐            │
       │              │earnings_record │            │
       │              └────────────────┘            │
       │                                            │
       └──────────────┬────────────────────────────┘
                      │
              ┌───────▼────────┐
              │leader_operation│
              │     _log       │
              └────────────────┘
```

## 正确性属性

### 什么是正确性属性?

正确性属性是对系统行为的形式化描述,它定义了系统在所有有效输入下都应该满足的规则。通过将需求转化为可测试的属性,我们可以使用属性测试(Property-Based Testing)来验证系统的正确性。

每个属性都以"对于任何(For any)"开头,表示这是一个普遍规则,而不是针对特定输入的测试用例。

### 核心正确性属性

#### 属性 1: 团长资格验证
*对于任何*用户,如果该用户满足团长申请条件(会员等级金卡以上、历史订单10单以上、已实名认证),则系统应该允许其提交团长申请并创建待审核记录。

**验证需求**: 1.1

#### 属性 2: 审核状态一致性
*对于任何*待审核的团长申请,审核通过后用户的团长状态应该变为"已通过",保证金应该被锁定,审核拒绝后保证金应该退回到用户账户。

**验证需求**: 1.2, 1.3

#### 属性 3: 拼团创建权限
*对于任何*团长,只有当拼团的目的地区域在该团长的服务范围内,且拼团类型在该团长的服务类型中时,系统才应该允许创建拼团。

**验证需求**: 2.1, 2.2, 2.3

#### 属性 4: 拼团自动取消
*对于任何*拼团订单,如果到达截止时间时当前人数小于最低人数,系统应该自动取消该拼团,并退还所有已加入团员的运费。

**验证需求**: 2.4

#### 属性 5: 包裹目的地匹配
*对于任何*用户尝试加入拼团的操作,只有当包裹的目的地与拼团的目的地区域匹配时,系统才应该允许加入。

**验证需求**: 3.3, 3.5

#### 属性 6: 拼团人数上限
*对于任何*拼团订单,当当前人数达到最大人数时,系统应该自动锁定该拼团,不再接受新成员加入,并通知团长准备接收包裹。

**验证需求**: 3.4

#### 属性 7: 运费计算正确性
*对于任何*用户加入拼团的操作,实付运费应该等于原运费乘以拼团的优惠运费比例,且该金额应该从用户账户中扣除。

**验证需求**: 3.3

#### 属性 8: 筛选结果准确性
*对于任何*拼团广场的筛选条件(目的地、团长等级、拼团类型),返回的所有拼团订单都应该满足该筛选条件。

**验证需求**: 4.1, 4.2

#### 属性 9: 排序结果正确性
*对于任何*拼团列表的排序请求(按时间或优惠幅度),返回的列表应该按照指定字段正确排序。

**验证需求**: 4.3, 4.4

#### 属性 10: 团长权限隔离
*对于任何*团长,该团长只能查看和操作自己创建的拼团订单,任何尝试访问其他团长拼团的操作都应该被拒绝并返回权限错误。

**验证需求**: 9.1, 9.4, 11.1, 11.2, 11.3

#### 属性 11: 包裹接收验证
*对于任何*团长扫描包裹条码的操作,只有当该包裹属于该团长管理的拼团时,系统才应该允许接收,并记录接收时间、更新包裹状态为"已到达"、发送通知给相关团员。

**验证需求**: 5.1, 9.2, 9.3

#### 属性 12: 包裹交付验证
*对于任何*团长扫描团员取货二维码的操作,只有当该二维码有效(未过期、未使用、属于该拼团)时,系统才应该允许交付,并记录交付时间、更新包裹状态为"已取货"。

**验证需求**: 5.2, 10.1, 10.2

#### 属性 13: 订单自动完成
*对于任何*拼团订单,当该订单的所有包裹都已交付时,系统应该自动将订单状态更新为"已完成",并触发团长收益结算。

**验证需求**: 5.3, 10.3

#### 属性 14: 超时包裹提醒
*对于任何*包裹,如果接收时间距离当前时间超过7天且包裹状态仍为"已到达",系统应该标记为超时并发送提醒给团员和团长。

**验证需求**: 5.4, 10.4

#### 属性 15: 团长等级晋升
*对于任何*团长,如果累计完成订单数和好评率满足晋升条件(中级:20单且>95%,高级:100单且>98%),系统应该自动晋升该团长等级。

**验证需求**: 6.2, 6.3

#### 属性 16: 团长等级降级
*对于任何*团长,如果好评率低于80%,系统应该降级或暂停该团长资格。

**验证需求**: 6.4

#### 属性 17: 评价更新评分
*对于任何*团员提交的评价,系统应该将该评价记录到数据库,并重新计算团长的总评分和好评率。

**验证需求**: 7.1

#### 属性 18: 评价权限控制
*对于任何*团长,该团长可以查看和回复自己收到的评价,但不能删除或修改评价内容。

**验证需求**: 7.3

#### 属性 19: 退出拼团时间限制
*对于任何*团员申请退出拼团的操作,只有当当前时间距离拼团截止时间大于24小时时,系统才应该允许退出并退还运费。

**验证需求**: 8.3, 8.4

#### 属性 20: 订单查询权限
*对于任何*用户查询拼团订单的操作,系统应该只返回该用户作为团长或团员参与的订单,不应该返回其他用户的订单。

**验证需求**: 8.1

#### 属性 21: 账号状态验证
*对于任何*团长,如果该团长的状态为"暂停"或"禁用",则该团长不应该能够登录团长端或执行任何团长操作。

**验证需求**: 11.4

#### 属性 22: 收益计算正确性
*对于任何*完成的拼团订单,团长的收益应该根据后台配置的收益模式和团长等级正确计算,包括基础收益、提成收益和奖励收益。

**验证需求**: 6.1

#### 属性 23: 异常标记暂停结算
*对于任何*被标记为异常的拼团订单,系统应该暂停该订单的收益结算,直到异常被处理完毕。

**验证需求**: 10.5

### 属性反思与优化

在编写上述属性时,我们进行了以下优化:

1. **合并冗余属性**: 将多个相似的权限验证属性合并为"属性10:团长权限隔离",覆盖所有权限相关的需求
2. **提取通用规则**: 将包裹接收和交付的验证逻辑分别提取为独立属性,避免重复
3. **简化筛选属性**: 将多个筛选条件合并为一个通用的"筛选结果准确性"属性
4. **统一排序属性**: 将不同排序字段合并为一个通用的"排序结果正确性"属性

这样我们得到了23个核心属性,每个属性都提供独特的验证价值,没有逻辑冗余。

## 错误处理

### 错误分类

#### 1. 业务错误
- 用户不满足团长申请条件
- 包裹目的地与拼团不匹配
- 拼团已满员或已截止
- 团长权限不足

#### 2. 系统错误
- 数据库连接失败
- 第三方服务不可用
- 并发冲突

#### 3. 数据错误
- 包裹条码无效
- 二维码过期或伪造
- 订单状态异常

### 错误处理策略

**用户端**:
- 友好的错误提示
- 提供解决方案引导
- 关键操作支持重试

**团长端**:
- 扫码失败立即反馈
- 异常情况提供标记功能
- 离线操作支持(本地缓存)

**后台**:
- 详细的错误日志
- 异常告警机制
- 数据回滚能力

## 测试策略

### 双重测试方法

本系统采用**单元测试**和**属性测试**相结合的策略,两者互补:

- **单元测试**: 验证特定示例、边界条件和错误场景
- **属性测试**: 验证普遍规则在大量随机输入下的正确性

### 属性测试配置

**测试框架**: PHPUnit + Faker (用于生成随机测试数据)

**测试配置**:
- 每个属性测试运行最少 **100次迭代**
- 使用随机种子确保可重现性
- 失败时保存反例用于调试

**属性测试标记格式**:
```php
/**
 * @test
 * Feature: group-buying-system, Property 10: 团长权限隔离
 * 对于任何团长,该团长只能查看和操作自己创建的拼团订单
 */
public function test_leader_permission_isolation()
{
    // 运行100次随机测试
    for ($i = 0; $i < 100; $i++) {
        // 生成随机团长和拼团数据
        // 验证权限隔离
    }
}
```

### 单元测试

**覆盖范围**:
- 所有服务类的公共方法
- 订单模式适配器的各种场景
- 收益计算的各种配置组合
- 权限验证逻辑
- 边界条件(如截止时间边界、人数上限等)
- 错误场景(如无效条码、过期二维码等)

**示例**:
```php
public function test_join_group_with_invalid_package()
{
    // 测试用无效包裹ID加入拼团应该失败
    $result = $this->groupService->joinGroup(1, 999, 9999);
    $this->assertFalse($result['success']);
    $this->assertEquals('PACKAGE_NOT_FOUND', $result['error_code']);
}
```

### 集成测试

**关键流程**:
1. **完整拼团流程**: 创建→加入→成团→接收→分发→完成→结算
2. **团长申请流程**: 申请→审核→通过/拒绝
3. **退出拼团流程**: 加入→退出→退款
4. **异常处理流程**: 标记异常→客服介入→处理完成

**测试数据**:
- 使用测试数据库
- 每次测试前重置数据
- 使用工厂模式创建测试数据

### 端到端测试

**用户场景**:
- 用户浏览拼团广场并加入拼团
- 团长创建拼团并管理包裹
- 后台管理员审核和配置

**工具**: 
- Playwright (前端UI测试)
- Postman (API测试)

### 性能测试

**关键指标**:
- 拼团广场列表加载时间 < 1秒
- 扫码响应时间 < 2秒
- 支持1000+并发用户
- 支持10000+活跃拼团订单

**工具**: Apache JMeter

### 测试优先级

**P0 (必须测试)**:
- 所有23个正确性属性
- 团长权限隔离
- 运费计算正确性
- 包裹接收和分发流程

**P1 (重要测试)**:
- 筛选和排序功能
- 等级晋升和降级
- 超时处理
- 异常标记

**P2 (可选测试)**:
- UI交互细节
- 通知发送
- 日志记录

## 部署方案

### 环境配置

**开发环境**:
- 本地 MySQL 数据库
- 本地 Redis 缓存
- Vite 开发服务器

**测试环境**:
- 独立的测试数据库
- 模拟的第三方服务
- HTTPS 支持(LIFF 要求)

**生产环境**:
- 主从数据库配置
- Redis 集群
- CDN 加速
- 负载均衡

### 发布流程

1. **数据库迁移**: 执行 SQL 脚本创建新表
2. **后端部署**: 上传 ThinkPHP 代码,更新配置
3. **前端构建**: 构建 React 应用,上传到 CDN
4. **配置初始化**: 设置默认的拼团配置
5. **功能验证**: 执行冒烟测试
6. **灰度发布**: 先开放给部分用户测试

### 监控告警

**监控指标**:
- API 响应时间
- 错误率
- 拼团成功率
- 团长活跃度
- 用户满意度

**告警规则**:
- API 错误率 > 5%
- 响应时间 > 3秒
- 数据库连接失败
- 关键业务流程异常

## 安全考虑

### 权限控制

**团长权限**:
- 只能查看和操作自己管理的拼团
- API 层面验证 leaderId 与 groupId 的关联
- 前端隐藏无权限的操作按钮

**数据隔离**:
- 所有查询都带上用户ID或团长ID过滤
- 使用 ThinkPHP 的模型作用域
- 敏感操作记录日志

### 数据安全

**敏感信息**:
- 用户手机号脱敏显示
- 地址信息加密存储
- 支付信息不存储明文

**防刷机制**:
- 接口限流(每分钟最多10次)
- 验证码保护关键操作
- 异常行为检测

### 扫码安全

**二维码防伪**:
- 包含时间戳和签名
- 设置有效期(24小时)
- 一次性使用(扫码后失效)

**条码验证**:
- 验证包裹归属
- 验证拼团状态
- 防止重复扫描

## 性能优化

### 数据库优化

**索引策略**:
- 高频查询字段建立索引
- 复合索引优化多条件查询
- 定期分析慢查询

**查询优化**:
- 避免 N+1 查询
- 使用 JOIN 减少查询次数
- 分页查询大数据集

### 缓存策略

**Redis 缓存**:
- 拼团列表缓存(5分钟)
- 团长信息缓存(30分钟)
- 配置信息缓存(1小时)

**前端缓存**:
- 静态资源 CDN 缓存
- API 响应缓存(SWR 策略)
- 图片懒加载

### 并发处理

**乐观锁**:
- 拼团人数更新使用版本号
- 库存扣减使用 CAS

**队列异步**:
- 通知发送异步处理
- 收益结算异步计算
- 日志记录异步写入

## 扩展性设计

### 插件化配置

**订单模式插件**:
- 新增订单模式只需实现接口
- 通过配置切换不同模式
- 支持 A/B 测试

**收益计算插件**:
- 支持自定义计算公式
- 支持多种奖励机制
- 灵活的配置界面

### 多租户支持

**未来扩展**:
- 支持多个商户独立运营
- 数据隔离
- 配置独立
- 品牌定制

## 迁移计划

### 现有系统集成

**用户系统**:
- 复用现有用户表
- 扩展用户角色(增加"团长"角色)
- 共享登录态

**订单系统**:
- 根据订单模式关联现有订单
- 扩展订单状态
- 共享物流追踪

**支付系统**:
- 复用钱包余额系统
- 扩展交易类型
- 共享支付流程

### 数据迁移

**初始化数据**:
- 导入现有用户数据
- 设置默认配置
- 创建测试团长账号

**增量同步**:
- 订单状态实时同步
- 包裹信息实时更新
- 用户余额实时同步

---

**设计文档状态**: 初稿完成,等待审核
**下一步**: 进行正确性属性分析(prework),然后完成正确性属性部分
