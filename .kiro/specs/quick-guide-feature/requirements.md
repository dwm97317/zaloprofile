# Requirements Document - 急件说明功能 (Quick Guide Feature)

## Introduction

本功能旨在为用户提供一个快速访问的操作指南入口，通过交互式步骤展示的方式，帮助用户了解如何使用平台的核心功能。该功能将在主页的显著位置添加一个入口按钮，点击后进入详细的操作说明页面。

## Glossary

- **Quick_Guide_Button**: 主页上的快速指南入口按钮
- **Guide_Page**: 操作说明页面，展示详细的使用步骤
- **Interactive_Step**: 可交互的步骤卡片，用户可以点击查看详情或执行相关操作
- **Storage_Guide**: 仓库使用指南，包含4个核心步骤
- **Navigation_System**: 导航系统，用于在步骤和相关功能页面之间跳转

## Requirements

### Requirement 1: 主页入口按钮

**User Story:** 作为用户，我希望在主页上看到一个明显的"急件说明"入口，以便快速访问操作指南。

#### Acceptance Criteria

1. WHEN 用户访问主页 THEN THE Quick_Guide_Button SHALL 显示在导航菜单下方的中心位置
2. THE Quick_Guide_Button SHALL 使用醒目的设计风格（渐变色背景、图标、文字）
3. THE Quick_Guide_Button SHALL 显示"急件说明"或"操作指南"文字
4. WHEN 用户点击 Quick_Guide_Button THEN THE Navigation_System SHALL 跳转到 Guide_Page
5. THE Quick_Guide_Button SHALL 具有悬停和点击动画效果

### Requirement 2: 操作说明页面结构

**User Story:** 作为用户，我希望看到清晰的操作说明页面，以便了解如何使用平台功能。

#### Acceptance Criteria

1. THE Guide_Page SHALL 包含页面标题"操作指南"或"急件说明"
2. THE Guide_Page SHALL 包含返回按钮，可返回主页
3. THE Guide_Page SHALL 使用 LINE 主题的视觉风格（绿色渐变、圆角卡片）
4. THE Guide_Page SHALL 包含简短的介绍文字，说明指南的用途
5. THE Guide_Page SHALL 在页面底部显示客服联系方式

### Requirement 3: 交互式步骤展示

**User Story:** 作为用户，我希望以交互式的方式查看操作步骤，以便更好地理解和执行。

#### Acceptance Criteria

1. THE Guide_Page SHALL 展示4个核心步骤（基于 Storage_Guide）
2. WHEN 用户查看步骤列表 THEN THE Interactive_Step SHALL 按顺序编号显示（1-4）
3. THE Interactive_Step SHALL 包含步骤标题、描述文字和操作按钮
4. THE Interactive_Step SHALL 使用卡片式设计，带有图标和渐变色
5. WHEN 用户滚动页面 THEN THE Interactive_Step SHALL 具有渐入动画效果

### Requirement 4: 步骤1 - 复制仓库地址

**User Story:** 作为用户，我希望直接看到并复制默认仓库地址，以便在购物平台填写收货地址。

#### Acceptance Criteria

1. THE Interactive_Step SHALL 显示"步骤1: 复制仓库地址"
2. THE Interactive_Step SHALL 包含描述："复制仓库地址并粘贴到购物平台的收货地址"
3. THE Interactive_Step SHALL 调用 API `page/getStorageFirst` 获取默认仓库信息
4. THE Interactive_Step SHALL 显示完整的仓库地址信息（收件人、电话、地址、邮编）
5. WHEN 用户点击"复制地址"按钮 THEN THE System SHALL 复制完整地址到剪贴板
6. THE Interactive_Step SHALL 显示蓝色提示框："默认为陆运地址，如果是海运请在地址后面加入 SEA"
7. THE Interactive_Step SHALL 提供"复制陆运地址"和"复制海运地址"两个按钮
8. WHEN 用户点击"复制海运地址" THEN THE System SHALL 在地址末尾添加 " SEA" 后复制
9. THE Interactive_Step SHALL 显示仓库图标（📦）
10. THE Interactive_Step SHALL 使用蓝色渐变背景
11. WHEN 复制成功 THEN THE System SHALL 显示提示消息"คัดลอกสำเร็จ"（复制成功）

### Requirement 5: 步骤2 - 报告包裹

**User Story:** 作为用户，我希望了解如何报告包裹，以便系统能够追踪我的货物。

#### Acceptance Criteria

1. THE Interactive_Step SHALL 显示"步骤2: 报告包裹"
2. THE Interactive_Step SHALL 包含描述："购买后，将快递单号报告到系统"
3. WHEN 用户点击"立即报告"按钮 THEN THE Navigation_System SHALL 跳转到包裹报告页面
4. THE Interactive_Step SHALL 显示包裹图标（📋）
5. THE Interactive_Step SHALL 使用绿色渐变背景

### Requirement 6: 步骤3 - 申请打包

**User Story:** 作为用户，我希望了解如何申请打包并填写收货信息，以便将多个包裹合并发货。

#### Acceptance Criteria

1. THE Interactive_Step SHALL 显示"步骤3: 申请打包"
2. THE Interactive_Step SHALL 包含描述："包裹到达仓库后，选择包裹申请打包并填写收货信息"
3. THE Interactive_Step SHALL 显示橙色提示框："申请打包时需要填写收货地址信息"
4. WHEN 用户点击"申请打包"按钮 THEN THE Navigation_System SHALL 跳转到打包申请页面 `/package/pack/select`
5. THE Interactive_Step SHALL 显示打包图标（📦）
6. THE Interactive_Step SHALL 使用橙色渐变背景
7. THE Interactive_Step SHALL 提示用户需要先添加收货地址
8. THE Interactive_Step SHALL 提供"管理地址"快捷链接，跳转到地址管理页面 `/address/index`

### Requirement 7: 步骤4 - 支付运费

**User Story:** 作为用户，我希望了解如何支付运费，以便完成发货流程。

#### Acceptance Criteria

1. THE Interactive_Step SHALL 显示"步骤4: 支付运费"
2. THE Interactive_Step SHALL 包含描述："打包完成后，支付运费，货物将被发送"
3. WHEN 用户点击"查看订单"按钮 THEN THE Navigation_System SHALL 跳转到订单列表页面
4. THE Interactive_Step SHALL 显示支付图标（💳）
5. THE Interactive_Step SHALL 使用紫色渐变背景

### Requirement 8: 额外功能链接

**User Story:** 作为用户，我希望快速访问其他相关功能，以便完成整个流程。

#### Acceptance Criteria

1. THE Guide_Page SHALL 在步骤列表下方显示"其他功能"区域
2. THE Guide_Page SHALL 包含"计算运费"功能链接
3. THE Guide_Page SHALL 包含"我的包裹"功能链接
4. THE Guide_Page SHALL 包含"充值"功能链接
5. WHEN 用户点击功能链接 THEN THE Navigation_System SHALL 跳转到对应页面

### Requirement 9: 响应式设计

**User Story:** 作为用户，我希望在不同设备上都能正常使用操作指南，以便随时查看。

#### Acceptance Criteria

1. THE Guide_Page SHALL 在移动设备上正常显示（320px - 768px）
2. THE Interactive_Step SHALL 在小屏幕上自动调整布局
3. THE Guide_Page SHALL 支持触摸滑动操作
4. THE Guide_Page SHALL 在不同屏幕尺寸下保持可读性
5. THE Guide_Page SHALL 使用响应式字体大小

### Requirement 10: 多语言支持

**User Story:** 作为泰国用户，我希望看到泰语的操作说明，以便更好地理解。

#### Acceptance Criteria

1. THE Guide_Page SHALL 支持泰语显示
2. THE Guide_Page SHALL 使用 i18n 翻译系统
3. THE Guide_Page SHALL 在翻译文件中定义所有文本内容
4. WHEN 用户切换语言 THEN THE Guide_Page SHALL 自动更新显示语言
5. THE Guide_Page SHALL 为所有文本提供默认的泰语翻译

### Requirement 11: 性能优化

**User Story:** 作为用户，我希望操作指南页面快速加载，以便不浪费时间等待。

#### Acceptance Criteria

1. THE Guide_Page SHALL 在2秒内完成初始加载
2. THE Guide_Page SHALL 使用懒加载技术加载图片
3. THE Guide_Page SHALL 缓存静态资源
4. THE Guide_Page SHALL 使用 CSS 动画而非 JavaScript 动画
5. THE Guide_Page SHALL 优化图片大小和格式

### Requirement 12: 分析追踪

**User Story:** 作为产品经理，我希望追踪用户如何使用操作指南，以便优化功能。

#### Acceptance Criteria

1. WHEN 用户点击 Quick_Guide_Button THEN THE System SHALL 记录事件
2. WHEN 用户点击步骤操作按钮 THEN THE System SHALL 记录点击事件
3. WHEN 用户访问 Guide_Page THEN THE System SHALL 记录页面浏览
4. THE System SHALL 记录用户在页面停留时间
5. THE System SHALL 记录用户完成步骤的顺序

## Technical Considerations

### 页面路由
- 新增路由: `/guide/quick-start`
- 从主页导航: `navigate('/guide/quick-start')`
- 返回主页: `navigate('/')` 或 `navigate(-1)`

### 组件结构
```
QuickGuidePage/
├── Index.jsx (主页面组件)
├── StepCard.jsx (步骤卡片组件)
├── QuickLinks.jsx (快速链接组件)
└── Index.scss (样式文件)
```

### 状态管理
- 不需要全局状态管理
- 使用本地 state 管理页面状态
- 使用 React Router 进行导航

### 样式设计
- 遵循 LINE 主题设计规范
- 使用 Tailwind CSS 工具类
- 使用渐变色和圆角设计
- 添加悬停和点击动画效果

### 数据来源
- 步骤内容来自翻译文件 (i18n)
- 不需要 API 调用
- 静态内容展示

## Success Metrics

1. **使用率**: 至少30%的新用户点击查看操作指南
2. **完成率**: 至少60%的用户浏览完所有4个步骤
3. **转化率**: 查看指南后，用户完成首次包裹报告的比例提升20%
4. **满意度**: 用户反馈操作指南有帮助的比例达到80%以上
5. **加载性能**: 页面加载时间小于2秒

## Future Enhancements

1. 添加视频教程
2. 添加常见问题解答 (FAQ)
3. 添加实时聊天支持
4. 添加步骤完成进度追踪
5. 添加个性化推荐（基于用户行为）
