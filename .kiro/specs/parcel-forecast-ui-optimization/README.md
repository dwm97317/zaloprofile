# 包裹预报功能优化与 LINE Mini App UI 改进 Spec

## 概述

本 Spec 定义了包裹预报功能的优化需求和将整体 UI 改造为符合 LINE Mini App 主题和泰国用户审美的完整方案。

## 文件结构

```
.kiro/specs/parcel-forecast-ui-optimization/
├── README.md           # 本文件 - Spec 概述
├── requirements.md     # 需求文档 - 详细的功能需求和验收标准
├── design.md          # 设计文档 - 技术设计和实现方案
└── tasks.md           # 任务列表 - 可执行的实现任务
```

## 主要功能

### 1. 包裹预报功能
- **单个包裹预报**: 仓库 + 快递单号 + 唛头（可选）
- **批量包裹预报**: 仓库 + 多个快递单号（通过"+"按钮添加）

### 2. 转账充值功能
- 充值日期和时间选择
- 充值金额输入
- 上传转账截图（最多3张）
- 提交到后端审核

### 3. 包裹认领功能
- 入口页面
- 跳转到认领功能

### 4. 优惠券功能
- 查看可用/已使用/已过期优惠券
- 优化为 LINE 主题样式

### 5. UI 全面优化
- LINE 绿色主题（#00B900）
- 圆润设计（圆角 ≥ 16px）
- 鲜艳活泼配色 + 渐变背景
- 大字体（≥ 14px）适配泰语
- 流畅动画效果
- 完整泰语支持

## 设计原则

1. **LINE 品牌一致性**: 使用 LINE 的绿色主题和设计语言
2. **泰国本地化**: 鲜艳配色、大字体、完整泰语翻译
3. **用户体验优先**: 简洁直观的操作流程
4. **性能优化**: 快速加载、流畅动画
5. **移动优先**: 针对移动端优化的触摸交互

## 技术栈

- **前端框架**: React 18.2.0
- **样式方案**: Tailwind CSS 3.4.1
- **状态管理**: Recoil 0.7.7
- **路由**: React Router 6.21.2
- **国际化**: i18next + react-i18next
- **图片处理**: Canvas API + LIFF SDK
- **测试**: Jest + React Testing Library + Playwright

## 开始实施

### 1. 阅读文档
```bash
# 按顺序阅读以下文档
1. requirements.md  # 了解功能需求
2. design.md        # 了解技术设计
3. tasks.md         # 查看实现任务
```

### 2. 执行任务
```bash
# 在 Kiro 中打开 tasks.md
# 点击任务旁的 "Start task" 按钮开始实施
```

### 3. 测试验证
```bash
# 运行测试
npm test

# E2E 测试
npm run test:e2e

# 启动开发服务器
npm run start
```

## 关键指标

### 性能目标
- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Time to Interactive (TTI) < 3.5s
- Cumulative Layout Shift (CLS) < 0.1

### 质量目标
- 单元测试覆盖率 > 80%
- 所有核心流程有 E2E 测试
- 所有 UI 文本有泰语翻译
- 所有交互有动画反馈

## 实施顺序

建议按以下顺序实施任务：

1. **阶段 1: 基础设施** (任务 1-2)
   - 配置主题系统
   - 创建共享组件库

2. **阶段 2: 首页优化** (任务 3)
   - 优化首页 UI
   - 添加新功能入口

3. **阶段 3: 核心功能** (任务 4-7)
   - 实现包裹预报
   - 实现转账充值
   - 优化优惠券
   - 实现包裹认领

4. **阶段 4: 完善和优化** (任务 8-13)
   - 国际化
   - 动画优化
   - API 集成
   - 测试和部署

## 注意事项

### 设计规范
- ✅ 主色使用 LINE 绿色 (#00B900)
- ✅ 圆角最小 16px
- ✅ 字体最小 14px
- ✅ 动画时长 200-300ms
- ✅ 所有文本必须有泰语翻译

### 开发规范
- ✅ 使用 TypeScript 类型定义
- ✅ 所有组件都要有单元测试
- ✅ 所有 API 调用都要有错误处理
- ✅ 所有表单都要有验证
- ✅ 所有图片都要压缩

### 测试规范
- ✅ 单元测试：测试组件和函数
- ✅ 集成测试：测试完整流程
- ✅ E2E 测试：测试用户场景
- ✅ 性能测试：测试加载和响应时间

## 相关资源

- [LINE Design System](https://designsystem.line.me/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [React 文档](https://react.dev/)
- [LIFF SDK 文档](https://developers.line.biz/en/docs/liff/)

## 联系方式

如有问题或建议，请联系开发团队。

---

**创建时间**: 2025-01-10  
**状态**: ✅ Spec 已完成，准备开始实施  
**预计工期**: 2-3 周
