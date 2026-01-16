# Implementation Plan: Usermark Display

## Overview

基于 USERMARK_FRONTEND_PROPOSAL.md 方案实现唛头前端展示功能。纯前端实现，不修改后端代码，不包含测试。

## Tasks

- [x] 1. 创建唛头详情页
  - 新建 `src/pages/Mark/Index.jsx`
  - 从 Recoil userInfoState 获取 usermark 数据
  - 渲染唛头列表，显示 mark 和 markdes
  - 实现复制功能，使用 navigator.clipboard.writeText
  - 复制成功显示 toast 提示
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [x] 2. 添加路由配置
  - 在 `src/components/app.jsx` 添加 /mark 路由
  - 配置 element 为 MarkPage 组件
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 3. 个人中心添加唛头入口
  - 修改 `src/pages/Mine/Index.jsx`
  - 添加 MarkEntry 组件，条件渲染 (usermark.length > 0)
  - 实现点击跳转到 /mark 页面
  - 添加点击动画效果 (active:scale-[0.98])
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [x] 4. 仓库地址页唛头选择
  - 修改 `src/pages/Storage/Detail.jsx`
  - 实现标识符选择逻辑：无唛头用 UID，有唛头用唛头
  - 多唛头时显示选择器 UI
  - 复制地址时使用选中的标识符
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 5. 包裹列表唛头显示
  - 修改 `src/components/Order/OrderCard.jsx`
  - 条件显示唛头标签 (item.mark || item.usermark)
  - 使用灰色背景小标签样式
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 6. 包裹详情唛头显示
  - 修改 `src/pages/Order/Detail.jsx`
  - 条件显示唛头卡片 (pack_info.mark || pack_info.usermark)
  - 使用白色卡片样式，突出显示唛头
  - _Requirements: 4.1, 4.3, 4.4_

## Enhancement Tasks (MARK_WAREHOUSE_SELECTOR_PROPOSAL)

- [x] 7. 创建通用 Dropdown 组件
  - 新建 `src/components/Common/Dropdown.jsx`
  - 支持 label、value、options、onChange、open、onToggle 属性
  - 点击外部自动关闭
  - 选中项高亮显示
  - _Requirements: MARK_WAREHOUSE_SELECTOR_PROPOSAL 5.3_

- [x] 8. 创建 AddressCopyCard 组件
  - 新建 `src/components/Mark/AddressCopyCard.jsx`
  - 双选择器：唛头选择器 + 仓库选择器
  - 实时预览组合后的收件地址
  - 一键复制完整地址功能
  - _Requirements: MARK_WAREHOUSE_SELECTOR_PROPOSAL 5.2_

- [x] 9. 增强唛头页面
  - 修改 `src/pages/Mark/Index.jsx`
  - 添加 AddressCopyCard 组件
  - 并行获取唛头和仓库数据
  - 默认选中第一个唛头
  - _Requirements: MARK_WAREHOUSE_SELECTOR_PROPOSAL 5.1_

- [x] 10. 增强仓库详情页唛头选择器
  - 修改 `src/pages/Storage/Detail.jsx`
  - 使用 Dropdown 组件替换按钮式选择器（多唛头时）
  - 添加地址预览卡片
  - 两种复制格式：完整地址 + 淘宝格式（管道分隔）
  - 使用 toast 替换 alert 提示
  - _Requirements: MARK_WAREHOUSE_SELECTOR_PROPOSAL 6.1_

- [x] 11. 增强仓库列表页唛头选择器
  - 修改 `src/pages/Storage/Index.jsx`
  - 每个仓库卡片内添加唛头选择器
  - 每个仓库卡片内添加地址预览
  - 每个仓库卡片内添加一键复制按钮
  - 并行获取仓库列表和用户唛头数据
  - 每个仓库独立维护选中的唛头状态
  - _Requirements: MARK_WAREHOUSE_SELECTOR_PROPOSAL_

## Notes

- 不修改后端代码，仅前端实现
- 不包含自动化测试
- 遵循项目现有 UI 规范：圆角卡片 (rounded-2xl)、Tailwind CSS
- 使用 Recoil 状态管理获取用户信息
