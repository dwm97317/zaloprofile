# Design Document: Usermark Display

## Overview

唛头前端展示功能设计。基于现有后端 API 数据，在前端实现唛头的条件显示、查看和复制功能。核心原则：无唛头时保持现状使用 UID，有唛头时显示唛头功能。

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                   │
│  │  Mine/Index  │───▶│  Mark/Index  │                   │
│  │  (唛头入口)   │    │  (唛头详情页) │                   │
│  └──────────────┘    └──────────────┘                   │
│                                                          │
│  ┌──────────────────┐    ┌──────────────────┐           │
│  │ Warehouse/Address │    │ Order/OrderCard  │           │
│  │ (唛头选择器)       │    │ (唛头标签)        │           │
│  └──────────────────┘    └──────────────────┘           │
│                                                          │
│  ┌──────────────────┐                                   │
│  │  Order/Detail    │                                   │
│  │  (包裹详情唛头)   │                                   │
│  └──────────────────┘                                   │
│                                                          │
├─────────────────────────────────────────────────────────┤
│                    Recoil State                          │
│  userInfoState: { usermark: [{id, mark, markdes}] }     │
├─────────────────────────────────────────────────────────┤
│                    Backend API (不修改)                  │
│  user/detail → userInfo.usermark[]                      │
│  package/outside → mark                                  │
│  package/details → usermark                              │
└─────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. MarkEntry Component

个人中心唛头入口组件。

```typescript
interface MarkEntryProps {
  userInfo: {
    usermark?: Array<{
      id: number;
      mark: string;
      markdes?: string;
    }>;
  };
}

// 条件渲染逻辑
const shouldShow = (userInfo) => {
  return userInfo?.usermark?.length > 0;
};
```

### 2. MarkPage Component

唛头详情页组件。

```typescript
interface MarkItem {
  id: number;
  mark: string;
  markdes?: string;
}

// 从 Recoil state 获取数据
const marks: MarkItem[] = userInfo?.usermark || [];
```

### 3. MarkSelector Component

仓库地址页唛头选择器。

```typescript
interface MarkSelectorProps {
  userInfo: {
    uid?: number;
    id?: number;
    usermark?: MarkItem[];
  };
  warehouse: {
    name: string;
    contact: string;
    address: string;
    phone: string;
  };
}

// 标识符选择逻辑
const getDefaultIdentifier = (userInfo) => {
  const marks = userInfo?.usermark || [];
  if (marks.length === 0) {
    return String(userInfo?.uid || userInfo?.id || '');
  }
  return marks[0].mark;
};
```

### 4. MarkBadge Component

包裹唛头标签组件。

```typescript
interface MarkBadgeProps {
  mark?: string;
  usermark?: string;
}

// 显示逻辑：支持两种字段名
const displayMark = mark || usermark;
const shouldShow = Boolean(displayMark);
```

## Data Models

### UserMark

```typescript
interface UserMark {
  id: number;        // 唛头ID
  mark: string;      // 唛头编码 (如 "ABC123")
  markdes?: string;  // 唛头描述 (如 "淘宝专用")
}
```

### UserInfo Extension

```typescript
interface UserInfo {
  uid: number;
  id: number;
  // ... existing fields
  usermark: UserMark[];  // 用户唛头列表
}
```

### Package Mark Fields

```typescript
// package/outside API
interface PackageOutside {
  mark?: string;  // 包裹唛头
}

// package/details API
interface PackageDetails {
  usermark?: string;  // 包裹唛头 (不同字段名)
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do.*

由于本功能主要是 UI 展示逻辑，不涉及复杂的数据转换或业务计算，大部分验收标准属于 UI 交互测试，不适合作为 property-based testing 的属性。

### Property 1: Mark Entry Conditional Rendering

*For any* userInfo object, the MarkEntry component should render if and only if usermark array has length > 0.

**Validates: Requirements 1.1, 1.2**

### Property 2: Mark List Complete Rendering

*For any* non-empty usermark array, the MarkPage should render exactly the same number of mark items, each displaying its mark code and optional description.

**Validates: Requirements 2.1, 2.2, 2.3**

### Property 3: Identifier Selection Logic

*For any* userInfo object:
- If usermark is empty, selectedId should equal UID
- If usermark has one item, selectedId should equal that mark
- If usermark has multiple items, mark selector UI should be visible

**Validates: Requirements 3.1, 3.2, 3.3**

### Property 4: Mark Badge Field Compatibility

*For any* package object with either mark or usermark field, the MarkBadge should display the value; if neither field exists, MarkBadge should not render.

**Validates: Requirements 4.1, 4.2, 4.3, 4.4**

## Error Handling

| 场景 | 处理方式 |
|------|----------|
| usermark 为 null/undefined | 默认为空数组 [] |
| mark 字段为空字符串 | 不显示 MarkBadge |
| 复制失败 | 显示错误 toast |
| 路由不存在 | 返回 404 页面 |

## Testing Strategy

由于用户要求不测试功能，本设计不包含测试任务。

### 手动验证清单

1. 无唛头用户：个人中心不显示唛头入口
2. 有唛头用户：个人中心显示唛头入口，点击可进入详情页
3. 唛头详情页：显示所有唛头，复制功能正常
4. 仓库地址页：无唛头用 UID，有唛头可选择
5. 包裹列表/详情：有唛头字段时显示
