# Implementation Plan: Member Grade Display

## Overview

本实现计划将会员等级显示功能分解为可执行的编码任务。所有任务仅涉及前端代码修改，不修改后端代码。使用React + Recoil + Tailwind CSS技术栈。

## Tasks

- [x] 1. 创建等级工具函数和类型定义
  - [x] 1.1 创建 `src/utils/gradeUtils.js` 文件
    - 实现 `calculateProgress` 函数：计算升级进度百分比
    - 实现 `getAmountToNextLevel` 函数：计算距离下一等级还需金额
    - 实现 `getDiscountPrice` 函数：计算折扣后价格
    - 实现 `getGradeStyle` 函数：根据等级权重返回样式配置
    - 导出默认等级配置 `DEFAULT_GRADE` 和预设等级列表 `PRESET_GRADES`
    - _Requirements: 3.6, 5.1, 5.4, 6.3_

  - [ ]* 1.2 编写 gradeUtils 属性测试
    - **Property 2: Grade Progress Calculation**
    - **Property 3: Discount Price Calculation**
    - **Property 4: Grade Style Mapping**
    - **Property 5: Amount To Next Level Calculation**
    - **Validates: Requirements 3.6, 5.1, 5.4, 3.4**

- [x] 2. 扩展状态管理
  - [x] 2.1 更新 `src/state.js` 添加等级相关状态
    - 添加 `userGradeState` atom：存储用户当前等级
    - 添加 `gradeListState` atom：存储等级列表
    - 添加 `userExpendState` atom：存储用户累计消费金额
    - _Requirements: 1.2, 1.3_

- [x] 3. 创建等级展示组件
  - [x] 3.1 创建 `src/components/Grade/GradeBadge.jsx` 组件
    - 接收 grade 对象和 size 属性
    - 根据等级权重显示对应图标和样式
    - 支持 sm/md/lg 三种尺寸
    - 无等级时显示默认"普通会员"
    - _Requirements: 2.1, 2.2, 8.1, 8.4_

  - [x] 3.2 创建 `src/components/Grade/GradeProgress.jsx` 组件
    - 显示升级进度条
    - 显示当前累计消费金额
    - 显示距离下一等级还需金额
    - 最高等级时显示"最高等级"提示
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 8.2_

  - [x] 3.3 创建 `src/components/Grade/GradeCard.jsx` 组件
    - 组合 GradeBadge 和 GradeProgress
    - 显示当前折扣率
    - 支持点击跳转到等级详情页
    - _Requirements: 4.1, 4.2, 8.3_

  - [x] 3.4 创建 `src/components/Grade/PriceWithDiscount.jsx` 组件
    - 显示原价和会员折扣价
    - 无折扣时只显示原价
    - _Requirements: 5.1, 5.2, 5.3_

  - [x] 3.5 创建 `src/components/Grade/index.js` 导出文件
    - 统一导出所有等级组件
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 4. Checkpoint - 确保组件创建完成
  - 确保所有组件文件已创建
  - 确保导出正确
  - 如有问题请询问用户

- [x] 5. 添加多语言支持
  - [x] 5.1 更新 `src/locales/zh/translation.json` 添加等级相关翻译
    - 添加 grade 命名空间下的所有翻译键
    - 包括：等级名称、折扣标签、进度标签、升级提示
    - _Requirements: 7.1, 7.2_

  - [x] 5.2 更新 `src/locales/vi/translation.json` 添加越南语翻译
    - 添加与中文对应的越南语翻译
    - _Requirements: 7.1, 7.2_

  - [x] 5.3 更新 `src/locales/th/translation.json` 添加泰语翻译
    - 添加与中文对应的泰语翻译
    - _Requirements: 7.1, 7.2_

- [x] 6. 集成到用户中心页面
  - [x] 6.1 更新 `src/pages/Mine/Index.jsx` 集成等级展示
    - 在 fetchUserAssets 中提取等级信息
    - 在用户信息区域添加 GradeCard 组件
    - 处理 API 错误时显示默认等级
    - 添加点击跳转到等级详情页的逻辑
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4_

- [x] 7. 创建等级详情页面
  - [x] 7.1 创建 `src/pages/Grade/Index.jsx` 等级详情页
    - 显示所有等级列表
    - 高亮当前用户等级
    - 显示每个等级的升级条件和折扣权益
    - _Requirements: 4.3, 4.4, 4.5_

  - [x] 7.2 创建 `src/pages/Grade/Grade.scss` 样式文件
    - 定义等级详情页样式
    - _Requirements: 4.3_

  - [x] 7.3 更新路由配置添加等级详情页路由
    - 在 app.jsx 或路由配置文件中添加 /grade/index 路由
    - _Requirements: 4.2_

- [x] 8. Checkpoint - 确保功能集成完成
  - 确保所有测试通过
  - 确保页面正常显示
  - 如有问题请询问用户

- [x] 9. 创建等级组件样式
  - [x] 9.1 创建 `src/components/Grade/Grade.scss` 样式文件
    - 定义 GradeBadge 样式（不同等级的颜色和图标）
    - 定义 GradeProgress 进度条样式
    - 定义 GradeCard 卡片样式
    - 定义 PriceWithDiscount 价格样式
    - _Requirements: 2.1, 2.2, 3.1_

- [ ]* 10. 编写组件单元测试
  - [ ]* 10.1 创建 `src/components/Grade/__tests__/GradeBadge.test.jsx`
    - 测试等级名称显示
    - 测试默认等级显示
    - 测试不同尺寸渲染
    - _Requirements: 8.1, 8.4_

  - [ ]* 10.2 创建 `src/components/Grade/__tests__/GradeProgress.test.jsx`
    - 测试进度条渲染
    - 测试最高等级显示
    - _Requirements: 8.2_

  - [ ]* 10.3 创建 `src/components/Grade/__tests__/PriceWithDiscount.test.jsx`
    - 测试折扣价格显示
    - 测试无折扣时只显示原价
    - _Requirements: 5.2, 5.3_

- [x] 11. Final Checkpoint - 确保所有功能完成
  - 确保所有测试通过
  - 确保多语言切换正常
  - 确保等级显示正确
  - 如有问题请询问用户

## Notes

- 任务标记 `*` 的为可选任务，可跳过以加快MVP开发
- 每个任务都引用了具体的需求以便追溯
- 检查点任务用于确保增量验证
- 属性测试验证核心计算逻辑的正确性
- 单元测试验证具体示例和边界情况
