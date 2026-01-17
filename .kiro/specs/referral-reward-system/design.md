# 推荐奖励系统 - 技术设计

**功能分支**: `referral-reward-system`
**创建日期**: 2026-01-16
**状态**: 设计中

## 设计概述

推荐奖励系统采用高度可配置的架构设计,支持多级推荐、多种奖励类型、灵活的触发条件和双方任务验证机制。

### 核心设计原则

1. **高度可配置**: 所有业务规则由后台配置,无需修改代码
2. **双向激励**: 推荐人和被推荐人都需完成任务,防止刷单
3. **多级裂变**: 支持多级推荐关系,实现病毒式增长
4. **性能优化**: 使用缓存和索引优化多级查询
5. **可扩展性**: 预留扩展接口,支持未来新增奖励类型和触发条件

## 系统架构

### 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端 (React)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 邀请好友页面  │  │ 推荐记录页面  │  │ 排行榜页面    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API 层 (ThinkPHP)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 推荐码生成    │  │ 推荐关系建立  │  │ 奖励发放      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    业务逻辑层 (Service)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 推荐服务      │  │ 奖励服务      │  │ 任务验证服务  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    数据层 (MySQL)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 推荐关系表    │  │ 奖励记录表    │  │ 配置表        │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

## 数据库设计


### 表结构设计

#### 1. 用户推荐码表 (user_referral_code)

存储每个用户的专属推荐码。

```sql
CREATE TABLE `user_referral_code` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `user_id` int(11) unsigned NOT NULL COMMENT '用户ID',
  `referral_code` varchar(8) NOT NULL COMMENT '推荐码(6-8位)',
  `share_count` int(11) DEFAULT 0 COMMENT '分享次数',
  `click_count` int(11) DEFAULT 0 COMMENT '点击次数',
  `register_count` int(11) DEFAULT 0 COMMENT '注册人数',
  `success_count` int(11) DEFAULT 0 COMMENT '成功推荐数',
  `total_reward` decimal(10,2) DEFAULT 0.00 COMMENT '累计奖励金额',
  `create_time` int(11) NOT NULL COMMENT '创建时间',
  `update_time` int(11) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_user_id` (`user_id`),
  UNIQUE KEY `uk_referral_code` (`referral_code`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户推荐码表';
```

#### 2. 推荐关系表 (referral_relation)

存储推荐关系链,支持多级推荐。

```sql
CREATE TABLE `referral_relation` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `referrer_user_id` int(11) unsigned NOT NULL COMMENT '推荐人用户ID',
  `referee_user_id` int(11) unsigned NOT NULL COMMENT '被推荐人用户ID',
  `referral_code` varchar(8) NOT NULL COMMENT '使用的推荐码',
  `level` tinyint(2) DEFAULT 1 COMMENT '推荐级别(1=一级,2=二级...)',
  `parent_relation_id` int(11) unsigned DEFAULT NULL COMMENT '上级推荐关系ID(用于多级)',
  `status` tinyint(2) DEFAULT 1 COMMENT '状态(1=待完成,2=已完成,3=已失效)',
  `referrer_task_status` tinyint(2) DEFAULT 0 COMMENT '推荐人任务状态(0=未完成,1=已完成)',
  `referee_task_status` tinyint(2) DEFAULT 0 COMMENT '被推荐人任务状态(0=未完成,1=已完成)',
  `referrer_task_complete_time` int(11) DEFAULT NULL COMMENT '推荐人任务完成时间',
  `referee_task_complete_time` int(11) DEFAULT NULL COMMENT '被推荐人任务完成时间',
  `reward_issued` tinyint(1) DEFAULT 0 COMMENT '奖励是否已发放(0=否,1=是)',
  `reward_issue_time` int(11) DEFAULT NULL COMMENT '奖励发放时间',
  `expire_time` int(11) DEFAULT NULL COMMENT '失效时间',
  `create_time` int(11) NOT NULL COMMENT '创建时间',
  `update_time` int(11) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_referee` (`referee_user_id`),
  KEY `idx_referrer` (`referrer_user_id`),
  KEY `idx_code` (`referral_code`),
  KEY `idx_status` (`status`),
  KEY `idx_parent` (`parent_relation_id`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推荐关系表';
```


#### 3. 推荐奖励记录表 (referral_reward)

存储每次奖励发放的详细记录。

```sql
CREATE TABLE `referral_reward` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `relation_id` int(11) unsigned NOT NULL COMMENT '推荐关系ID',
  `user_id` int(11) unsigned NOT NULL COMMENT '获得奖励的用户ID',
  `user_type` tinyint(2) NOT NULL COMMENT '用户类型(1=推荐人,2=被推荐人)',
  `reward_type` tinyint(2) NOT NULL COMMENT '奖励类型(1=现金,2=积分,3=优惠券)',
  `reward_amount` decimal(10,2) NOT NULL COMMENT '奖励金额/数量',
  `coupon_id` int(11) DEFAULT NULL COMMENT '优惠券ID(如果是优惠券)',
  `status` tinyint(2) DEFAULT 1 COMMENT '状态(1=待发放,2=已发放,3=已回收)',
  `issue_time` int(11) DEFAULT NULL COMMENT '发放时间',
  `expire_time` int(11) DEFAULT NULL COMMENT '过期时间',
  `recycle_time` int(11) DEFAULT NULL COMMENT '回收时间',
  `recycle_reason` varchar(255) DEFAULT NULL COMMENT '回收原因',
  `create_time` int(11) NOT NULL COMMENT '创建时间',
  `update_time` int(11) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_relation` (`relation_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_create_time` (`create_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推荐奖励记录表';
```

#### 4. 推荐任务配置表 (referral_task_config)

配置推荐人和被推荐人需要完成的任务。

```sql
CREATE TABLE `referral_task_config` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `config_name` varchar(100) NOT NULL COMMENT '配置名称',
  `user_type` tinyint(2) NOT NULL COMMENT '用户类型(1=推荐人,2=被推荐人)',
  `task_type` varchar(50) NOT NULL COMMENT '任务类型(register/first_recharge/first_order/real_name等)',
  `task_params` text COMMENT '任务参数(JSON格式,如最低金额等)',
  `is_required` tinyint(1) DEFAULT 1 COMMENT '是否必须完成(1=是,0=否)',
  `sort_order` int(11) DEFAULT 0 COMMENT '排序',
  `is_enabled` tinyint(1) DEFAULT 1 COMMENT '是否启用',
  `create_time` int(11) NOT NULL COMMENT '创建时间',
  `update_time` int(11) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_type` (`user_type`),
  KEY `idx_enabled` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推荐任务配置表';
```

#### 5. 推荐奖励配置表 (referral_reward_config)

配置不同级别的奖励规则。

```sql
CREATE TABLE `referral_reward_config` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `config_name` varchar(100) NOT NULL COMMENT '配置名称',
  `level` tinyint(2) DEFAULT 1 COMMENT '推荐级别(1=一级,2=二级...)',
  `user_type` tinyint(2) NOT NULL COMMENT '用户类型(1=推荐人,2=被推荐人)',
  `reward_type` tinyint(2) NOT NULL COMMENT '奖励类型(1=现金,2=积分,3=优惠券)',
  `reward_amount` decimal(10,2) NOT NULL COMMENT '奖励金额/数量',
  `reward_ratio` decimal(5,2) DEFAULT 100.00 COMMENT '奖励比例(%,用于多级推荐)',
  `expire_days` int(11) DEFAULT NULL COMMENT '有效期(天数,NULL=永久)',
  `is_enabled` tinyint(1) DEFAULT 1 COMMENT '是否启用',
  `create_time` int(11) NOT NULL COMMENT '创建时间',
  `update_time` int(11) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_level` (`level`),
  KEY `idx_enabled` (`is_enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推荐奖励配置表';
```


#### 6. 推荐系统配置表 (referral_system_config)

全局系统配置。

```sql
CREATE TABLE `referral_system_config` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `config_key` varchar(100) NOT NULL COMMENT '配置键',
  `config_value` text NOT NULL COMMENT '配置值',
  `config_type` varchar(20) DEFAULT 'string' COMMENT '配置类型(string/int/json等)',
  `description` varchar(255) DEFAULT NULL COMMENT '配置说明',
  `is_enabled` tinyint(1) DEFAULT 1 COMMENT '是否启用',
  `create_time` int(11) NOT NULL COMMENT '创建时间',
  `update_time` int(11) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_config_key` (`config_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推荐系统配置表';
```

**配置项示例**:
- `max_referral_levels`: 最大推荐级数(1/2/3等)
- `referral_code_length`: 推荐码长度(6-8)
- `referral_limit_enabled`: 是否启用推荐上限
- `referral_limit_per_month`: 每月推荐上限
- `expire_days`: 推荐关系失效天数
- `leaderboard_enabled`: 是否启用排行榜
- `leaderboard_top_count`: 排行榜显示人数

#### 7. 推荐排行榜表 (referral_leaderboard)

存储排行榜数据(定时任务更新)。

```sql
CREATE TABLE `referral_leaderboard` (
  `id` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `period_type` varchar(20) NOT NULL COMMENT '周期类型(daily/weekly/monthly)',
  `period_date` date NOT NULL COMMENT '周期日期',
  `user_id` int(11) unsigned NOT NULL COMMENT '用户ID',
  `referral_count` int(11) DEFAULT 0 COMMENT '推荐人数',
  `success_count` int(11) DEFAULT 0 COMMENT '成功推荐数',
  `rank` int(11) DEFAULT 0 COMMENT '排名',
  `reward_amount` decimal(10,2) DEFAULT 0.00 COMMENT '排行榜奖励金额',
  `reward_issued` tinyint(1) DEFAULT 0 COMMENT '奖励是否已发放',
  `create_time` int(11) NOT NULL COMMENT '创建时间',
  `update_time` int(11) NOT NULL COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_period_user` (`period_type`,`period_date`,`user_id`),
  KEY `idx_period` (`period_type`,`period_date`),
  KEY `idx_rank` (`rank`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='推荐排行榜表';
```

### 索引优化策略

1. **推荐关系查询**: `idx_referrer` + `idx_status` 组合索引
2. **多级推荐查询**: `idx_parent` 用于递归查询优化
3. **排行榜查询**: `idx_period` + `idx_rank` 组合索引
4. **奖励记录查询**: `idx_user` + `idx_status` 组合索引

## API 设计

### 前端 API

#### 1. 生成推荐码

```
GET /api/referral/code
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "referral_code": "ABC123",
    "share_url": "https://app.example.com?ref=ABC123",
    "qr_code_url": "https://cdn.example.com/qr/ABC123.png",
    "statistics": {
      "share_count": 10,
      "register_count": 5,
      "success_count": 3,
      "total_reward": 150.00
    }
  }
}
```

#### 2. 验证推荐码

```
POST /api/referral/validate
```

**请求**:
```json
{
  "referral_code": "ABC123"
}
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "is_valid": true,
    "referrer_info": {
      "nickname": "张三",
      "avatar": "https://cdn.example.com/avatar.jpg"
    }
  }
}
```


#### 3. 建立推荐关系

```
POST /api/referral/bind
```

**请求**:
```json
{
  "referral_code": "ABC123"
}
```

**响应**:
```json
{
  "code": 200,
  "message": "推荐关系建立成功",
  "data": {
    "relation_id": 12345,
    "referrer_info": {
      "nickname": "张三"
    },
    "tasks": {
      "referrer_tasks": [
        {
          "task_type": "first_recharge",
          "task_name": "完成首次充值",
          "is_completed": false
        }
      ],
      "referee_tasks": [
        {
          "task_type": "first_order",
          "task_name": "完成首次下单",
          "is_completed": false
        }
      ]
    }
  }
}
```

#### 4. 查询推荐记录

```
GET /api/referral/list?page=1&limit=20&status=all
```

**参数**:
- `status`: all/pending/completed/expired

**响应**:
```json
{
  "code": 200,
  "data": {
    "list": [
      {
        "id": 12345,
        "referee_info": {
          "nickname": "李四",
          "avatar": "https://cdn.example.com/avatar2.jpg"
        },
        "level": 1,
        "status": 2,
        "status_text": "已完成",
        "referrer_task_status": 1,
        "referee_task_status": 1,
        "rewards": [
          {
            "reward_type": 1,
            "reward_type_text": "现金",
            "reward_amount": 50.00,
            "status": 2,
            "status_text": "已发放"
          }
        ],
        "create_time": 1705392000,
        "complete_time": 1705478400
      }
    ],
    "total": 100,
    "page": 1,
    "limit": 20
  }
}
```

#### 5. 查询推荐统计

```
GET /api/referral/statistics
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "total_referrals": 100,
    "pending_referrals": 20,
    "completed_referrals": 75,
    "expired_referrals": 5,
    "total_rewards": {
      "cash": 1500.00,
      "points": 5000,
      "coupons": 10
    },
    "level_statistics": [
      {
        "level": 1,
        "count": 80,
        "rewards": 1200.00
      },
      {
        "level": 2,
        "count": 20,
        "rewards": 300.00
      }
    ]
  }
}
```

#### 6. 查询排行榜

```
GET /api/referral/leaderboard?period=monthly&date=2026-01
```

**响应**:
```json
{
  "code": 200,
  "data": {
    "period_type": "monthly",
    "period_date": "2026-01",
    "my_rank": 15,
    "my_count": 8,
    "list": [
      {
        "rank": 1,
        "user_info": {
          "nickname": "王五",
          "avatar": "https://cdn.example.com/avatar3.jpg"
        },
        "referral_count": 50,
        "success_count": 45,
        "reward_amount": 500.00
      }
    ]
  }
}
```

### 后台管理 API

#### 1. 推荐配置管理

```
GET /admin/referral/config
POST /admin/referral/config/save
```

#### 2. 推荐记录管理

```
GET /admin/referral/relations
POST /admin/referral/relation/invalidate
```

#### 3. 奖励管理

```
GET /admin/referral/rewards
POST /admin/referral/reward/recycle
```

## 业务逻辑设计

### 推荐码生成算法

```php
class ReferralCodeGenerator
{
    // 字符集(排除易混淆字符)
    private const CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    
    public function generate(int $userId, int $length = 6): string
    {
        $maxAttempts = 10;
        
        for ($i = 0; $i < $maxAttempts; $i++) {
            // 基于用户ID和时间戳生成种子
            $seed = $userId . microtime(true);
            $hash = hash('sha256', $seed);
            
            // 从哈希中提取字符
            $code = '';
            for ($j = 0; $j < $length; $j++) {
                $index = hexdec(substr($hash, $j * 2, 2)) % strlen(self::CHARSET);
                $code .= self::CHARSET[$index];
            }
            
            // 检查唯一性
            if (!$this->codeExists($code)) {
                return $code;
            }
        }
        
        throw new Exception('无法生成唯一推荐码');
    }
}
```


### 多级推荐关系建立

```php
class ReferralService
{
    /**
     * 建立推荐关系(支持多级)
     */
    public function createRelation(int $refereeUserId, string $referralCode): array
    {
        // 1. 验证推荐码
        $referrerCode = $this->validateCode($referralCode);
        $referrerUserId = $referrerCode['user_id'];
        
        // 2. 防止自己推荐自己
        if ($referrerUserId === $refereeUserId) {
            throw new Exception('不能使用自己的推荐码');
        }
        
        // 3. 检查是否已有推荐关系
        if ($this->hasRelation($refereeUserId)) {
            throw new Exception('您已经有推荐人了');
        }
        
        // 4. 获取最大推荐级数配置
        $maxLevels = $this->getConfig('max_referral_levels', 1);
        
        // 5. 创建一级推荐关系
        $relations = [];
        $relations[] = $this->createRelationRecord(
            $referrerUserId,
            $refereeUserId,
            $referralCode,
            1,
            null
        );
        
        // 6. 创建多级推荐关系
        if ($maxLevels > 1) {
            $currentReferrer = $referrerUserId;
            
            for ($level = 2; $level <= $maxLevels; $level++) {
                // 查找上级推荐人
                $parentRelation = $this->findParentRelation($currentReferrer);
                
                if (!$parentRelation) {
                    break; // 没有更上级了
                }
                
                $relations[] = $this->createRelationRecord(
                    $parentRelation['referrer_user_id'],
                    $refereeUserId,
                    $referralCode,
                    $level,
                    $parentRelation['id']
                );
                
                $currentReferrer = $parentRelation['referrer_user_id'];
            }
        }
        
        return $relations;
    }
}
```

### 双方任务验证机制

```php
class TaskVerificationService
{
    /**
     * 验证任务完成并发放奖励
     */
    public function verifyAndReward(int $userId, string $taskType, array $taskData): void
    {
        // 1. 查找该用户相关的推荐关系
        $relations = $this->findRelationsByUser($userId);
        
        foreach ($relations as $relation) {
            // 2. 判断用户类型(推荐人还是被推荐人)
            $userType = ($relation['referrer_user_id'] === $userId) ? 1 : 2;
            
            // 3. 检查任务是否匹配
            if (!$this->isTaskMatch($relation['id'], $userType, $taskType)) {
                continue;
            }
            
            // 4. 更新任务状态
            $this->updateTaskStatus($relation['id'], $userType, $taskType, $taskData);
            
            // 5. 检查双方任务是否都完成
            if ($this->areBothTasksCompleted($relation['id'])) {
                // 6. 发放奖励
                $this->issueRewards($relation['id']);
                
                // 7. 更新推荐关系状态
                $this->updateRelationStatus($relation['id'], 2); // 已完成
            }
        }
    }
    
    /**
     * 检查双方任务是否都完成
     */
    private function areBothTasksCompleted(int $relationId): bool
    {
        $relation = $this->getRelation($relationId);
        
        return $relation['referrer_task_status'] == 1 
            && $relation['referee_task_status'] == 1;
    }
}
```

### 奖励发放逻辑

```php
class RewardService
{
    /**
     * 发放推荐奖励
     */
    public function issueRewards(int $relationId): void
    {
        $relation = $this->getRelation($relationId);
        
        // 1. 获取奖励配置
        $configs = $this->getRewardConfigs($relation['level']);
        
        foreach ($configs as $config) {
            // 2. 计算实际奖励金额(考虑多级比例)
            $actualAmount = $config['reward_amount'] * ($config['reward_ratio'] / 100);
            
            // 3. 确定接收奖励的用户
            $userId = ($config['user_type'] == 1) 
                ? $relation['referrer_user_id'] 
                : $relation['referee_user_id'];
            
            // 4. 创建奖励记录
            $rewardId = $this->createRewardRecord([
                'relation_id' => $relationId,
                'user_id' => $userId,
                'user_type' => $config['user_type'],
                'reward_type' => $config['reward_type'],
                'reward_amount' => $actualAmount,
                'expire_time' => $this->calculateExpireTime($config['expire_days'])
            ]);
            
            // 5. 发放奖励
            $this->distributeReward($rewardId, $config['reward_type'], $userId, $actualAmount);
            
            // 6. 发送通知
            $this->sendNotification($userId, $config['reward_type'], $actualAmount);
        }
        
        // 7. 更新推荐关系
        $this->updateRelation($relationId, [
            'reward_issued' => 1,
            'reward_issue_time' => time()
        ]);
    }
    
    /**
     * 分发奖励到用户账户
     */
    private function distributeReward(int $rewardId, int $rewardType, int $userId, float $amount): void
    {
        switch ($rewardType) {
            case 1: // 现金
                $this->addBalance($userId, $amount, '推荐奖励');
                break;
            case 2: // 积分
                $this->addPoints($userId, (int)$amount, '推荐奖励');
                break;
            case 3: // 优惠券
                $this->issueCoupon($userId, (int)$amount);
                break;
        }
        
        // 更新奖励状态
        $this->updateRewardStatus($rewardId, 2); // 已发放
    }
}
```


### 失效机制

```php
class ExpirationService
{
    /**
     * 定时任务: 检查并处理失效的推荐关系
     */
    public function checkExpiredRelations(): void
    {
        // 1. 获取失效配置
        $expireDays = $this->getConfig('expire_days', 30);
        $expireTime = time() - ($expireDays * 86400);
        
        // 2. 查找待完成且超时的推荐关系
        $expiredRelations = $this->findExpiredRelations($expireTime);
        
        foreach ($expiredRelations as $relation) {
            // 3. 更新状态为已失效
            $this->updateRelationStatus($relation['id'], 3);
            
            // 4. 如果有已发放的奖励,根据配置决定是否回收
            if ($relation['reward_issued'] && $this->shouldRecycleReward()) {
                $this->recycleRewards($relation['id'], '推荐关系失效');
            }
            
            // 5. 发送通知
            $this->sendExpirationNotification($relation);
        }
    }
    
    /**
     * 回收奖励
     */
    private function recycleRewards(int $relationId, string $reason): void
    {
        $rewards = $this->getRewardsByRelation($relationId);
        
        foreach ($rewards as $reward) {
            if ($reward['status'] != 2) { // 只回收已发放的
                continue;
            }
            
            // 从用户账户扣除
            switch ($reward['reward_type']) {
                case 1: // 现金
                    $this->deductBalance($reward['user_id'], $reward['reward_amount'], $reason);
                    break;
                case 2: // 积分
                    $this->deductPoints($reward['user_id'], (int)$reward['reward_amount'], $reason);
                    break;
                case 3: // 优惠券
                    $this->revokeCoupon($reward['user_id'], $reward['coupon_id']);
                    break;
            }
            
            // 更新奖励状态
            $this->updateRewardStatus($reward['id'], 3, $reason); // 已回收
        }
    }
}
```

## 前端设计

### 页面结构

```
src/pages/Referral/
├── Invite.jsx              # 邀请好友页面
├── MyReferrals.jsx         # 我的推荐页面
├── ReferralDetail.jsx      # 推荐详情页面
├── Leaderboard.jsx         # 排行榜页面
└── RewardHistory.jsx       # 奖励明细页面

src/components/Referral/
├── ReferralCodeCard.jsx    # 推荐码卡片
├── ShareButtons.jsx        # 分享按钮组
├── ReferralListItem.jsx    # 推荐记录项
├── StatisticsPanel.jsx     # 统计面板
├── TaskProgressCard.jsx    # 任务进度卡片
└── LeaderboardItem.jsx     # 排行榜项
```

### 核心组件设计

#### 1. 邀请好友页面 (Invite.jsx)

```jsx
import React, { useState, useEffect } from 'react';
import { getReferralCode, shareToLine } from '@/api/referral';
import ReferralCodeCard from '@/components/Referral/ReferralCodeCard';
import ShareButtons from '@/components/Referral/ShareButtons';
import StatisticsPanel from '@/components/Referral/StatisticsPanel';

const Invite = () => {
  const [codeData, setCodeData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralCode();
  }, []);

  const loadReferralCode = async () => {
    try {
      const res = await getReferralCode();
      setCodeData(res.data);
    } catch (error) {
      console.error('加载推荐码失败', error);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async (platform) => {
    if (platform === 'line') {
      await shareToLine(codeData.share_url);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(codeData.share_url);
    // 显示复制成功提示
  };

  if (loading) return <div>加载中...</div>;

  return (
    <div className="p-4 space-y-4">
      {/* 推荐码卡片 */}
      <ReferralCodeCard 
        code={codeData.referral_code}
        qrCodeUrl={codeData.qr_code_url}
        onCopy={handleCopy}
      />

      {/* 分享按钮 */}
      <ShareButtons onShare={handleShare} />

      {/* 统计面板 */}
      <StatisticsPanel statistics={codeData.statistics} />

      {/* 奖励规则说明 */}
      <div className="bg-white rounded-2xl p-4">
        <h3 className="font-bold mb-2">奖励规则</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• 邀请好友注册并完成首单,双方都可获得奖励</li>
          <li>• 奖励将在好友完成任务后自动发放</li>
          <li>• 支持多级推荐,邀请越多奖励越多</li>
        </ul>
      </div>
    </div>
  );
};

export default Invite;
```

#### 2. 推荐码卡片组件 (ReferralCodeCard.jsx)

```jsx
import React from 'react';
import { QRCodeSVG } from 'qrcode.react';

const ReferralCodeCard = ({ code, qrCodeUrl, onCopy }) => {
  return (
    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold mb-2">我的推荐码</h2>
        <div className="text-3xl font-bold tracking-wider">{code}</div>
      </div>

      {/* 二维码 */}
      <div className="bg-white p-4 rounded-xl mx-auto w-fit">
        <QRCodeSVG value={qrCodeUrl} size={150} />
      </div>

      {/* 复制按钮 */}
      <button
        onClick={onCopy}
        className="w-full mt-4 bg-white text-blue-600 font-bold py-3 rounded-xl"
      >
        复制推荐链接
      </button>
    </div>
  );
};

export default ReferralCodeCard;
```


#### 3. 我的推荐页面 (MyReferrals.jsx)

```jsx
import React, { useState, useEffect } from 'react';
import { getReferralList } from '@/api/referral';
import ReferralListItem from '@/components/Referral/ReferralListItem';

const MyReferrals = () => {
  const [list, setList] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadList();
  }, [activeTab]);

  const loadList = async () => {
    try {
      const res = await getReferralList({ status: activeTab });
      setList(res.data.list);
    } catch (error) {
      console.error('加载推荐列表失败', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待完成' },
    { key: 'completed', label: '已完成' },
    { key: 'expired', label: '已失效' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Tab 切换 */}
      <div className="bg-white sticky top-0 z-10">
        <div className="flex border-b">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 推荐列表 */}
      <div className="p-4 space-y-3">
        {list.map(item => (
          <ReferralListItem key={item.id} data={item} />
        ))}
      </div>
    </div>
  );
};

export default MyReferrals;
```

#### 4. 推荐记录项组件 (ReferralListItem.jsx)

```jsx
import React from 'react';
import { formatTime } from '@/utils/time';

const ReferralListItem = ({ data }) => {
  const statusColors = {
    1: 'text-orange-600 bg-orange-50',
    2: 'text-green-600 bg-green-50',
    3: 'text-gray-600 bg-gray-50'
  };

  return (
    <div className="bg-white rounded-2xl p-4">
      {/* 用户信息 */}
      <div className="flex items-center mb-3">
        <img
          src={data.referee_info.avatar}
          alt=""
          className="w-12 h-12 rounded-full"
        />
        <div className="ml-3 flex-1">
          <div className="font-medium">{data.referee_info.nickname}</div>
          <div className="text-xs text-gray-500">
            {formatTime(data.create_time)}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs ${statusColors[data.status]}`}>
          {data.status_text}
        </span>
      </div>

      {/* 任务进度 */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-600">您的任务</div>
          <div className="text-sm font-medium">
            {data.referrer_task_status ? '✓ 已完成' : '待完成'}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2">
          <div className="text-xs text-gray-600">好友任务</div>
          <div className="text-sm font-medium">
            {data.referee_task_status ? '✓ 已完成' : '待完成'}
          </div>
        </div>
      </div>

      {/* 奖励信息 */}
      {data.rewards && data.rewards.length > 0 && (
        <div className="border-t pt-3">
          <div className="text-xs text-gray-600 mb-2">获得奖励</div>
          <div className="flex flex-wrap gap-2">
            {data.rewards.map((reward, index) => (
              <div key={index} className="bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-sm">
                {reward.reward_type_text} {reward.reward_amount}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralListItem;
```

## 性能优化

### 1. 多级推荐查询优化

使用闭包表(Closure Table)优化多级查询:

```sql
-- 推荐关系闭包表
CREATE TABLE `referral_relation_closure` (
  `ancestor` int(11) unsigned NOT NULL COMMENT '祖先节点',
  `descendant` int(11) unsigned NOT NULL COMMENT '后代节点',
  `depth` int(11) NOT NULL COMMENT '深度',
  PRIMARY KEY (`ancestor`, `descendant`),
  KEY `idx_descendant` (`descendant`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 2. 缓存策略

```php
class ReferralCacheService
{
    private $redis;
    
    /**
     * 缓存推荐码信息
     */
    public function cacheCodeInfo(string $code, array $data): void
    {
        $key = "referral:code:{$code}";
        $this->redis->setex($key, 3600, json_encode($data));
    }
    
    /**
     * 缓存用户推荐统计
     */
    public function cacheUserStats(int $userId, array $stats): void
    {
        $key = "referral:stats:{$userId}";
        $this->redis->setex($key, 300, json_encode($stats));
    }
    
    /**
     * 缓存排行榜数据
     */
    public function cacheLeaderboard(string $period, array $data): void
    {
        $key = "referral:leaderboard:{$period}";
        $this->redis->setex($key, 600, json_encode($data));
    }
}
```

### 3. 异步处理

使用消息队列处理耗时操作:

```php
// 奖励发放异步处理
Queue::push('ReferralRewardJob', [
    'relation_id' => $relationId,
    'action' => 'issue_reward'
]);

// 排行榜更新异步处理
Queue::push('LeaderboardUpdateJob', [
    'period_type' => 'monthly',
    'period_date' => date('Y-m')
]);
```

## 安全设计

### 1. 防刷机制

```php
class AntiFraudService
{
    /**
     * 检测异常推荐行为
     */
    public function detectFraud(int $userId, string $action): bool
    {
        // 1. IP地址检测
        if ($this->isSameIpAsReferrer($userId)) {
            return true;
        }
        
        // 2. 设备指纹检测
        if ($this->isSameDeviceAsReferrer($userId)) {
            return true;
        }
        
        // 3. 注册频率检测
        if ($this->isHighFrequencyRegistration($userId)) {
            return true;
        }
        
        // 4. 行为模式分析
        if ($this->isAbnormalBehavior($userId)) {
            return true;
        }
        
        return false;
    }
}
```

### 2. 数据验证

```php
// 推荐码验证
$validator = Validator::make($request->all(), [
    'referral_code' => 'required|string|size:6|exists:user_referral_code,referral_code'
]);

// 防止重复绑定
if (ReferralRelation::where('referee_user_id', $userId)->exists()) {
    throw new Exception('您已经有推荐人了');
}
```

## 监控与日志

### 关键指标监控

1. **推荐转化率**: 注册人数 / 点击人数
2. **任务完成率**: 完成人数 / 注册人数
3. **奖励发放成功率**: 成功发放 / 总发放次数
4. **异常推荐比例**: 异常推荐 / 总推荐数

### 日志记录

```php
// 推荐关系建立日志
Log::info('Referral relation created', [
    'referrer_user_id' => $referrerUserId,
    'referee_user_id' => $refereeUserId,
    'referral_code' => $referralCode,
    'level' => $level
]);

// 奖励发放日志
Log::info('Reward issued', [
    'relation_id' => $relationId,
    'user_id' => $userId,
    'reward_type' => $rewardType,
    'reward_amount' => $amount
]);
```

## 部署方案

### 数据库迁移

```bash
# 创建表结构
php think migrate:run --path=database/migrations/referral

# 初始化配置数据
php think seed:run --class=ReferralConfigSeeder
```

### 定时任务配置

```bash
# crontab 配置
# 每小时更新排行榜
0 * * * * php /path/to/think referral:update-leaderboard

# 每天检查失效推荐关系
0 2 * * * php /path/to/think referral:check-expired
```

### 前端部署

```bash
# 构建前端资源
npm run build

# 部署到CDN
npm run deploy:cdn
```
