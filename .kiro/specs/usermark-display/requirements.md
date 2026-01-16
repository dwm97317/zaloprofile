# Requirements Document

## Introduction

唛头（Shipping Mark）前端展示功能。基于现有后端 API，在前端实现唛头的条件显示、查看和复制功能。无唛头时保持现状使用 UID，有唛头时显示唛头功能入口。

## Glossary

- **Usermark_System**: 唛头展示系统，负责在前端各页面条件显示唛头信息
- **Mark_Entry**: 个人中心的唛头入口组件
- **Mark_Page**: 唛头详情页面
- **Mark_Selector**: 仓库地址页的唛头选择器组件
- **Mark_Badge**: 包裹列表/详情中的唛头标签组件

## Requirements

### Requirement 1: 个人中心唛头入口

**User Story:** As a user, I want to see a mark entry in my profile page when I have marks, so that I can access my mark details.

#### Acceptance Criteria

1. WHEN a user has marks (usermark.length > 0), THE Mark_Entry SHALL display in the profile page
2. WHEN a user has no marks (usermark.length === 0), THE Mark_Entry SHALL NOT display
3. WHEN a user clicks the Mark_Entry, THE Usermark_System SHALL navigate to the mark detail page
4. THE Mark_Entry SHALL display with click animation (scale effect on active state)

### Requirement 2: 唛头详情页

**User Story:** As a user, I want to view all my marks in a dedicated page, so that I can see and copy them.

#### Acceptance Criteria

1. THE Mark_Page SHALL display all user marks from userInfo.usermark array
2. FOR EACH mark item, THE Mark_Page SHALL display the mark code (item.mark)
3. FOR EACH mark item with description, THE Mark_Page SHALL display the description (item.markdes)
4. WHEN a user clicks the copy button, THE Mark_Page SHALL copy the mark code to clipboard
5. WHEN copy succeeds, THE Mark_Page SHALL show a success toast message

### Requirement 3: 仓库地址唛头选择

**User Story:** As a user, I want to select which mark to use when copying warehouse address, so that I can use the correct mark for different purposes.

#### Acceptance Criteria

1. WHEN a user has no marks, THE Mark_Selector SHALL use UID as the identifier (current behavior)
2. WHEN a user has exactly one mark, THE Mark_Selector SHALL use that mark as the identifier
3. WHEN a user has multiple marks, THE Mark_Selector SHALL display a mark selection UI
4. WHEN a user selects a mark, THE Mark_Selector SHALL update the receiver name with selected mark
5. WHEN copying address, THE Mark_Selector SHALL include the selected identifier in receiver name

### Requirement 4: 包裹唛头显示

**User Story:** As a user, I want to see the mark associated with my packages, so that I can identify which mark was used.

#### Acceptance Criteria

1. WHEN a package has mark field (item.mark or item.usermark), THE Mark_Badge SHALL display in package list
2. WHEN a package has no mark field, THE Mark_Badge SHALL NOT display
3. WHEN viewing package details with mark, THE Mark_Badge SHALL display the mark prominently
4. THE Mark_Badge SHALL support both field names: mark and usermark

### Requirement 5: 路由配置

**User Story:** As a developer, I want the mark page to be accessible via route, so that navigation works correctly.

#### Acceptance Criteria

1. THE Usermark_System SHALL register /mark route
2. WHEN navigating to /mark, THE Usermark_System SHALL render Mark_Page component
3. THE route SHALL have title metadata set to "我的唛头"
