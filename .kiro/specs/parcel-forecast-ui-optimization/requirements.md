# Requirements Document - 包裹预报功能优化与 LINE Mini App UI 改进

## Introduction

本规范定义了包裹预报功能的优化需求，以及将整体 UI 改造为更符合 LINE Mini App 主题和泰国用户审美偏好的需求。目标是提供一个现代化、易用、视觉吸引力强的包裹转运服务界面。

## Glossary

- **System**: LINE Mini App 前端应用
- **Parcel_Forecast**: 包裹预报功能模块
- **User**: 使用转运服务的泰国用户
- **Tracking_Number**: 快递追踪单号
- **Warehouse**: 转运仓库
- **UI_Theme**: 用户界面主题样式
- **Mark**: 唛头，用户自定义的包裹标识
- **Transfer_Recharge**: 转账充值功能
- **Parcel_Claim**: 包裹认领功能
- **Coupon**: 优惠券
- **Backend**: 商户后台管理系统

## Requirements

### Requirement 1: 单个包裹预报功能

**User Story:** 作为用户，我想要预报单个包裹信息，以便仓库能够识别和处理我的包裹。

#### Acceptance Criteria

1. WHEN 用户选择单个包裹预报模式 THEN THE System SHALL 显示单包裹预报表单
2. WHEN 用户选择仓库 THEN THE System SHALL 提供可用仓库列表供选择
3. WHEN 用户填写快递单号 THEN THE System SHALL 验证单号格式并提供实时反馈
4. WHEN 用户填写唛头（可选） THEN THE System SHALL 允许输入自定义唛头标识
5. WHEN 用户提交预报信息 THEN THE System SHALL 保存数据并显示成功确认

### Requirement 1.1: 多个包裹批量预报功能

**User Story:** 作为用户，我想要一次性预报多个包裹，以便提高预报效率。

#### Acceptance Criteria

1. WHEN 用户选择多个包裹预报模式 THEN THE System SHALL 显示批量预报表单
2. WHEN 用户选择仓库 THEN THE System SHALL 应用到所有待添加的包裹
3. WHEN 用户输入快递单号并点击"+"按钮 THEN THE System SHALL 将单号添加到列表中
4. WHEN 用户添加多个单号 THEN THE System SHALL 在列表中显示所有已添加的单号
5. WHEN 用户点击列表中的单号 THEN THE System SHALL 允许删除该单号
6. WHEN 用户提交批量预报 THEN THE System SHALL 一次性提交所有单号到后端

### Requirement 2: LINE Mini App 主题风格

**User Story:** 作为用户，我希望应用界面符合 LINE 的设计风格，让我感到熟悉和舒适。

#### Acceptance Criteria

1. THE System SHALL 使用 LINE 品牌绿色（#00B900）作为主要强调色
2. THE System SHALL 使用圆润的设计元素（圆角半径 ≥ 16px）
3. THE System SHALL 在交互元素上应用平滑的动画过渡效果
4. THE System SHALL 使用 LINE 风格的图标和视觉元素
5. THE System SHALL 保持简洁清爽的白色背景为主

### Requirement 3: 泰国用户审美优化

**User Story:** 作为泰国用户，我希望界面色彩鲜艳、视觉丰富，符合我的审美偏好。

#### Acceptance Criteria

1. THE System SHALL 使用鲜艳活泼的配色方案（绿色、橙色、粉色等）
2. THE System SHALL 在关键功能区域使用渐变色背景
3. THE System SHALL 增加装饰性图标和插图元素
4. THE System SHALL 使用较大的字体尺寸（基础字号 ≥ 14px）以适应泰语显示
5. THE System SHALL 在卡片和按钮上使用阴影效果增强立体感

### Requirement 4: 包裹预报快速操作

**User Story:** 作为频繁使用的用户，我希望能够快速重复预报相似的包裹。

#### Acceptance Criteria

1. WHEN 用户成功预报包裹 THEN THE System SHALL 保存常用信息到本地存储
2. WHEN 用户再次访问预报页面 THEN THE System SHALL 提供历史记录快速填充选项
3. WHEN 用户选择历史记录 THEN THE System SHALL 自动填充相关字段
4. WHEN 用户修改预填充的信息 THEN THE System SHALL 允许编辑所有字段
5. THE System SHALL 最多保存最近 10 条预报记录

### Requirement 5: 照片上传功能

**User Story:** 作为用户，我想要上传包裹照片，以便更准确地描述包裹内容。

#### Acceptance Criteria

1. WHEN 用户点击上传按钮 THEN THE System SHALL 打开相机或相册选择界面
2. WHEN 用户选择照片 THEN THE System SHALL 压缩图片到合适大小（< 2MB）
3. WHEN 照片上传成功 THEN THE System SHALL 显示缩略图预览
4. WHEN 用户点击缩略图 THEN THE System SHALL 显示大图预览
5. THE System SHALL 支持最多上传 5 张照片

### Requirement 6: 表单验证与错误提示

**User Story:** 作为用户，我希望在填写表单时获得清晰的指导和错误提示。

#### Acceptance Criteria

1. WHEN 用户输入无效数据 THEN THE System SHALL 在字段下方显示红色错误提示
2. WHEN 用户修正错误 THEN THE System SHALL 移除错误提示并显示绿色确认图标
3. WHEN 用户尝试提交不完整表单 THEN THE System SHALL 阻止提交并滚动到第一个错误字段
4. THE System SHALL 使用泰语显示所有错误消息
5. THE System SHALL 在必填字段标签旁显示红色星号（*）

### Requirement 7: 首页 UI 优化

**User Story:** 作为用户，我希望首页界面美观、信息清晰、操作便捷。

#### Acceptance Criteria

1. THE System SHALL 使用渐变色背景的顶部横幅区域
2. THE System SHALL 将功能图标网格改为更大、更圆润的卡片设计
3. THE System SHALL 在功能卡片上添加悬停和点击动画效果
4. THE System SHALL 优化运输路线卡片的视觉层次
5. THE System SHALL 在底部导航栏使用 LINE 绿色作为选中状态颜色

### Requirement 8: 响应式动画效果

**User Story:** 作为用户，我希望应用交互流畅，有愉悦的视觉反馈。

#### Acceptance Criteria

1. WHEN 用户点击按钮 THEN THE System SHALL 显示缩放动画反馈
2. WHEN 页面加载内容 THEN THE System SHALL 使用淡入和滑入动画
3. WHEN 用户切换标签页 THEN THE System SHALL 使用平滑的过渡动画
4. WHEN 显示模态框 THEN THE System SHALL 使用背景模糊和淡入效果
5. THE System SHALL 所有动画持续时间在 200-300ms 之间

### Requirement 9: 包裹状态可视化

**User Story:** 作为用户，我希望能够直观地看到包裹的当前状态。

#### Acceptance Criteria

1. THE System SHALL 使用不同颜色标识不同的包裹状态
2. THE System SHALL 在包裹卡片上显示状态进度条或步骤指示器
3. WHEN 包裹状态更新 THEN THE System SHALL 在列表中高亮显示更新项
4. THE System SHALL 使用图标配合文字说明包裹状态
5. THE System SHALL 为紧急状态（待付款、待处理）使用醒目的颜色

### Requirement 10: 多语言支持优化

**User Story:** 作为泰国用户，我希望所有界面文字都是准确的泰语。

#### Acceptance Criteria

1. THE System SHALL 使用泰语作为默认语言
2. THE System SHALL 确保所有 UI 文本都有泰语翻译
3. THE System SHALL 使用适合泰语的字体（如 Noto Sans Thai）
4. WHEN 泰语文本较长 THEN THE System SHALL 正确处理换行和截断
5. THE System SHALL 在日期和数字格式上遵循泰国本地化标准

### Requirement 11: 转账充值功能

**User Story:** 作为用户，我想要通过转账方式充值账户余额，以便支付运费和其他费用。

#### Acceptance Criteria

1. WHEN 用户访问充值页面 THEN THE System SHALL 显示转账充值表单
2. WHEN 用户选择充值日期 THEN THE System SHALL 提供日期选择器
3. WHEN 用户选择充值时间 THEN THE System SHALL 提供时间选择器
4. WHEN 用户输入充值金额 THEN THE System SHALL 验证金额格式（正数，最多2位小数）
5. WHEN 用户上传转账截图 THEN THE System SHALL 压缩并预览图片
6. WHEN 用户提交充值申请 THEN THE System SHALL 发送到后端并显示待审核状态
7. THE System SHALL 支持上传最多 3 张转账截图

### Requirement 12: 包裹认领功能

**User Story:** 作为用户，我想要认领已到达仓库但未预报的包裹，以便将其加入我的账户。

#### Acceptance Criteria

1. WHEN 用户访问包裹认领页面 THEN THE System SHALL 显示认领入口
2. WHEN 用户点击认领入口 THEN THE System SHALL 跳转到认领功能页面
3. WHEN 用户输入包裹信息 THEN THE System SHALL 验证包裹是否存在于仓库
4. WHEN 包裹验证成功 THEN THE System SHALL 将包裹关联到用户账户
5. WHEN 认领成功 THEN THE System SHALL 显示成功提示并更新包裹列表

### Requirement 13: 优惠券功能

**User Story:** 作为用户，我想要查看和使用优惠券，以便享受折扣优惠。

#### Acceptance Criteria

1. WHEN 用户访问优惠券页面 THEN THE System SHALL 显示优惠券入口
2. WHEN 用户点击优惠券入口 THEN THE System SHALL 跳转到优惠券列表页面
3. WHEN 显示优惠券列表 THEN THE System SHALL 区分可用、已使用和已过期的优惠券
4. WHEN 用户选择优惠券 THEN THE System SHALL 显示优惠券详情（金额、有效期、使用条件）
5. WHEN 用户在支付时 THEN THE System SHALL 允许选择可用的优惠券
6. THE System SHALL 使用不同颜色标识优惠券状态（绿色=可用，灰色=已用/过期）

### Requirement 14: 首页功能入口优化

**User Story:** 作为用户，我希望在首页能够快速访问所有主要功能。

#### Acceptance Criteria

1. THE System SHALL 在首页功能网格中添加"转账充值"入口
2. THE System SHALL 在首页功能网格中添加"包裹认领"入口
3. THE System SHALL 在首页功能网格中添加"优惠券"入口
4. THE System SHALL 使用醒目的图标标识新增功能
5. WHEN 用户点击功能入口 THEN THE System SHALL 导航到对应的功能页面

---

## 功能字段定义

### 单个包裹预报表单字段

**必填字段：**
- 仓库（Warehouse）
- 快递单号（Tracking Number）

**选填字段：**
- 唛头（Mark/Label）

### 多个包裹预报表单字段

**必填字段：**
- 仓库（Warehouse）
- 快递单号列表（Tracking Number List）- 通过"+"按钮添加

### 转账充值表单字段

**必填字段：**
- 充值日期（Transfer Date）
- 充值时间（Transfer Time）
- 充值金额（Amount）
- 转账截图（Transfer Screenshot）- 最多3张

**选填字段：**
- 备注（Remarks）

### 包裹认领字段

**必填字段：**
- 包裹识别信息（Package Identifier）- 可能是单号或仓库编号

### 优惠券字段

**显示信息：**
- 优惠券名称（Coupon Name）
- 优惠金额/折扣（Discount Amount/Percentage）
- 有效期（Valid Period）
- 使用条件（Usage Conditions）
- 状态（Status）- 可用/已使用/已过期

## 设计原则

1. **简洁优先**: 减少不必要的视觉元素，突出核心功能
2. **色彩鲜艳**: 使用高饱和度的颜色吸引注意力
3. **圆润友好**: 大圆角设计营造亲和力
4. **动画流畅**: 适度的动画提升用户体验
5. **泰语优化**: 字体和排版适配泰语特点

## 技术约束

- 使用 React 18+ 和 Tailwind CSS
- 兼容 LINE LIFF SDK
- 支持移动端触摸交互
- 图片上传使用 LIFF 的 API
- 本地存储使用 localStorage

